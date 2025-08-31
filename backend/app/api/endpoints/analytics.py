"""
Analytics API endpoints for risk metrics and portfolio analysis
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import numpy as np

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse

from app.database.redis_client import RedisClient
from app.market_data.processors.anomaly_detector import AnomalyDetector

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency injection
async def get_redis_client() -> RedisClient:
    """Get Redis client instance"""
    from app.main import redis_client
    return redis_client

async def get_anomaly_detector() -> AnomalyDetector:
    """Get anomaly detector instance"""
    from app.main import market_data_processor
    return market_data_processor.anomaly_detector

@router.get("/risk/var")
async def calculate_var(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    confidence_level: float = Query(0.95, description="Confidence level for VaR calculation", ge=0.5, le=0.99),
    time_horizon: int = Query(1, description="Time horizon in days", ge=1, le=30),
    portfolio_weights: Optional[str] = Query(None, description="Comma-separated portfolio weights (optional)"),
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Calculate Value at Risk (VaR) for a portfolio"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        if len(symbol_list) > 100:
            raise HTTPException(
                status_code=400,
                detail="Maximum 100 symbols allowed per request"
            )
        
        # Parse portfolio weights if provided
        weights = None
        if portfolio_weights:
            try:
                weights = [float(w.strip()) for w in portfolio_weights.split(",")]
                if len(weights) != len(symbol_list):
                    raise HTTPException(
                        status_code=400,
                        detail="Number of weights must match number of symbols"
                    )
                # Normalize weights
                total_weight = sum(weights)
                weights = [w / total_weight for w in weights]
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid portfolio weights format"
                )
        else:
            # Equal weights if not provided
            weights = [1.0 / len(symbol_list)] * len(symbol_list)
        
        # Get price history for each symbol
        portfolio_data = {}
        for symbol in symbol_list:
            price_history = await redis_client.get_price_history(symbol, 252)  # 1 year of trading days
            if price_history and len(price_history) > 1:
                prices = [point["price"] for point in price_history if point["price"] > 0]
                if len(prices) > 1:
                    # Calculate daily returns
                    returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]
                    portfolio_data[symbol] = {
                        "returns": returns,
                        "mean_return": np.mean(returns),
                        "volatility": np.std(returns)
                    }
        
        if not portfolio_data:
            raise HTTPException(
                status_code=404,
                detail="No sufficient data available for VaR calculation"
            )
        
        # Calculate portfolio statistics
        portfolio_returns = []
        for symbol, data in portfolio_data.items():
            symbol_weight = weights[symbol_list.index(symbol)]
            weighted_returns = [r * symbol_weight for r in data["returns"]]
            portfolio_returns.extend(weighted_returns)
        
        # Calculate VaR
        portfolio_mean = np.mean(portfolio_returns)
        portfolio_std = np.std(portfolio_returns)
        
        # Parametric VaR (assuming normal distribution)
        z_score = {
            0.90: 1.282,
            0.95: 1.645,
            0.99: 2.326
        }.get(confidence_level, 1.645)
        
        var_parametric = portfolio_mean - (z_score * portfolio_std * np.sqrt(time_horizon))
        
        # Historical VaR
        sorted_returns = sorted(portfolio_returns)
        var_index = int((1 - confidence_level) * len(sorted_returns))
        var_historical = sorted_returns[var_index] if var_index < len(sorted_returns) else sorted_returns[0]
        
        # Calculate additional risk metrics
        max_drawdown = self._calculate_max_drawdown(portfolio_returns)
        sharpe_ratio = self._calculate_sharpe_ratio(portfolio_returns)
        
        return {
            "success": True,
            "portfolio": {
                "symbols": symbol_list,
                "weights": weights,
                "total_symbols": len(symbol_list)
            },
            "var_metrics": {
                "confidence_level": confidence_level,
                "time_horizon_days": time_horizon,
                "parametric_var": round(var_parametric * 100, 4),  # Convert to percentage
                "historical_var": round(var_historical * 100, 4),   # Convert to percentage
                "portfolio_mean_return": round(portfolio_mean * 100, 4),
                "portfolio_volatility": round(portfolio_std * 100, 4)
            },
            "risk_metrics": {
                "max_drawdown": round(max_drawdown * 100, 4),
                "sharpe_ratio": round(sharpe_ratio, 4),
                "var_confidence_interval": f"{confidence_level * 100}%"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to calculate VaR: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/risk/correlation")
async def calculate_correlation_matrix(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    timeframe: str = Query("1m", description="Timeframe: 1w, 1m, 3m, 6m, 1y"),
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Calculate correlation matrix for a set of symbols"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        if len(symbol_list) > 50:
            raise HTTPException(
                status_code=400,
                detail="Maximum 50 symbols allowed per request"
            )
        
        # Convert timeframe to days
        timeframe_days = {
            "1w": 7,
            "1m": 30,
            "3m": 90,
            "6m": 180,
            "1y": 365
        }
        
        if timeframe not in timeframe_days:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid timeframe. Must be one of: {list(timeframe_days.keys())}"
            )
        
        days = timeframe_days[timeframe]
        
        # Get price history and calculate returns
        returns_data = {}
        for symbol in symbol_list:
            price_history = await redis_client.get_price_history(symbol, days)
            if price_history and len(price_history) > 1:
                prices = [point["price"] for point in price_history if point["price"] > 0]
                if len(prices) > 1:
                    returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]
                    returns_data[symbol] = returns
        
        if len(returns_data) < 2:
            raise HTTPException(
                status_code=404,
                detail="Insufficient data for correlation calculation"
            )
        
        # Align return series to same length
        min_length = min(len(returns) for returns in returns_data.values())
        aligned_returns = {}
        for symbol, returns in returns_data.items():
            aligned_returns[symbol] = returns[-min_length:]
        
        # Calculate correlation matrix
        symbols_list = list(aligned_returns.keys())
        n_symbols = len(symbols_list)
        correlation_matrix = np.zeros((n_symbols, n_symbols))
        
        for i in range(n_symbols):
            for j in range(n_symbols):
                if i == j:
                    correlation_matrix[i][j] = 1.0
                else:
                    symbol1 = symbols_list[i]
                    symbol2 = symbols_list[j]
                    returns1 = aligned_returns[symbol1]
                    returns2 = aligned_returns[symbol2]
                    
                    if len(returns1) == len(returns2):
                        correlation = np.corrcoef(returns1, returns2)[0, 1]
                        correlation_matrix[i][j] = correlation if not np.isnan(correlation) else 0.0
        
        # Convert to dictionary format
        correlation_dict = {}
        for i, symbol1 in enumerate(symbols_list):
            correlation_dict[symbol1] = {}
            for j, symbol2 in enumerate(symbols_list):
                correlation_dict[symbol1][symbol2] = round(correlation_matrix[i][j], 4)
        
        # Calculate average correlation
        upper_triangle = correlation_matrix[np.triu_indices(n_symbols, k=1)]
        avg_correlation = np.mean(upper_triangle) if len(upper_triangle) > 0 else 0
        
        return {
            "success": True,
            "correlation_matrix": correlation_dict,
            "summary": {
                "total_symbols": n_symbols,
                "timeframe": timeframe,
                "data_points": min_length,
                "average_correlation": round(avg_correlation, 4)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to calculate correlation matrix: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/risk/volatility")
async def calculate_volatility_metrics(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    period: int = Query(20, description="Period for volatility calculation", ge=5, le=252),
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Calculate volatility metrics for symbols"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        if len(symbol_list) > 100:
            raise HTTPException(
                status_code=400,
                detail="Maximum 100 symbols allowed per request"
            )
        
        volatility_data = {}
        
        for symbol in symbol_list:
            price_history = await redis_client.get_price_history(symbol, period + 10)
            if price_history and len(price_history) > period:
                prices = [point["price"] for point in price_history if point["price"] > 0]
                if len(prices) >= period:
                    # Calculate rolling volatility
                    volatilities = []
                    for i in range(period, len(prices)):
                        window_prices = prices[i-period:i]
                        returns = [(window_prices[j] - window_prices[j-1]) / window_prices[j-1] 
                                 for j in range(1, len(window_prices))]
                        volatility = np.std(returns) * np.sqrt(252)  # Annualized
                        volatilities.append(volatility)
                    
                    if volatilities:
                        volatility_data[symbol] = {
                            "current_volatility": round(volatilities[-1] * 100, 4),  # Convert to percentage
                            "avg_volatility": round(np.mean(volatilities) * 100, 4),
                            "min_volatility": round(min(volatilities) * 100, 4),
                            "max_volatility": round(max(volatilities) * 100, 4),
                            "volatility_trend": self._calculate_trend(volatilities)
                        }
        
        if not volatility_data:
            raise HTTPException(
                status_code=404,
                detail="No sufficient data available for volatility calculation"
            )
        
        # Calculate portfolio-level volatility metrics
        all_volatilities = [data["current_volatility"] for data in volatility_data.values()]
        
        return {
            "success": True,
            "individual_volatilities": volatility_data,
            "portfolio_summary": {
                "total_symbols": len(volatility_data),
                "period": period,
                "avg_portfolio_volatility": round(np.mean(all_volatilities), 4),
                "min_portfolio_volatility": round(min(all_volatilities), 4),
                "max_portfolio_volatility": round(max(all_volatilities), 4),
                "volatility_dispersion": round(np.std(all_volatilities), 4)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to calculate volatility metrics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/anomaly/{symbol}")
async def get_anomaly_analysis(
    symbol: str,
    anomaly_detector: AnomalyDetector = Depends(get_anomaly_detector),
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Get anomaly analysis for a symbol"""
    try:
        # Get price history
        price_history = await redis_client.get_price_history(symbol, 100)
        
        if not price_history or len(price_history) < 20:
            raise HTTPException(
                status_code=404,
                detail="Insufficient data for anomaly analysis"
            )
        
        # Get latest price data
        latest_data = await redis_client.get_latest_price(symbol)
        if not latest_data:
            raise HTTPException(
                status_code=404,
                detail=f"No current data available for {symbol}"
            )
        
        # Detect anomalies
        anomaly_score = anomaly_detector.detect_anomaly(symbol, price_history, latest_data)
        
        # Get anomaly summary
        anomaly_summary = anomaly_detector.get_anomaly_summary(symbol)
        
        # Get model performance
        model_performance = anomaly_detector.get_model_performance(symbol)
        
        # Determine anomaly level
        if anomaly_score > 0.7:
            level = "high"
        elif anomaly_score > 0.4:
            level = "medium"
        else:
            level = "low"
        
        return {
            "success": True,
            "symbol": symbol,
            "anomaly_analysis": {
                "anomaly_score": round(anomaly_score, 4),
                "anomaly_level": level,
                "interpretation": self._interpret_anomaly_score(anomaly_score)
            },
            "model_info": {
                "trained": anomaly_summary.get("model_trained", False),
                "training_data_points": anomaly_summary.get("training_data_points", 0),
                "last_training": anomaly_summary.get("last_training"),
                "performance": model_performance
            },
            "thresholds": anomaly_summary.get("anomaly_thresholds", {}),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get anomaly analysis for {symbol}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/anomaly/summary")
async def get_anomaly_summary(
    anomaly_detector: AnomalyDetector = Depends(get_anomaly_detector)
):
    """Get summary of all anomaly detection models"""
    try:
        models_info = anomaly_detector.get_all_models_info()
        
        return {
            "success": True,
            "data": models_info,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get anomaly summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/anomaly/thresholds")
async def update_anomaly_thresholds(
    thresholds: Dict[str, float],
    anomaly_detector: AnomalyDetector = Depends(get_anomaly_detector)
):
    """Update anomaly detection thresholds"""
    try:
        anomaly_detector.set_anomaly_thresholds(thresholds)
        
        return {
            "success": True,
            "message": "Anomaly thresholds updated successfully",
            "new_thresholds": thresholds,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to update anomaly thresholds: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Helper methods
def _calculate_max_drawdown(self, returns: List[float]) -> float:
    """Calculate maximum drawdown from returns"""
    try:
        cumulative = np.cumprod(1 + np.array(returns))
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / running_max
        return abs(min(drawdown))
    except Exception:
        return 0.0

def _calculate_sharpe_ratio(self, returns: List[float], risk_free_rate: float = 0.02) -> float:
    """Calculate Sharpe ratio from returns"""
    try:
        if not returns:
            return 0.0
        
        excess_returns = np.array(returns) - (risk_free_rate / 252)  # Daily risk-free rate
        if np.std(excess_returns) == 0:
            return 0.0
        
        return np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252)  # Annualized
    except Exception:
        return 0.0

def _calculate_trend(self, values: List[float]) -> str:
    """Calculate trend direction from a list of values"""
    try:
        if len(values) < 2:
            return "neutral"
        
        # Simple linear regression slope
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        
        if slope > 0.001:
            return "increasing"
        elif slope < -0.001:
            return "decreasing"
        else:
            return "stable"
    except Exception:
        return "neutral"

def _interpret_anomaly_score(self, score: float) -> str:
    """Interpret anomaly score"""
    if score > 0.8:
        return "Highly unusual market behavior detected"
    elif score > 0.6:
        return "Moderately unusual market behavior detected"
    elif score > 0.4:
        return "Slightly unusual market behavior detected"
    elif score > 0.2:
        return "Minimal market anomalies detected"
    else:
        return "Normal market behavior"
