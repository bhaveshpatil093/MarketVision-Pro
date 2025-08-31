"""
Market data API endpoints
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse

from app.database.influx_client import InfluxDBClient
from app.database.redis_client import RedisClient
from app.market_data.processors.market_data_processor import MarketDataProcessor
from app.market_data.processors.technical_indicators import TechnicalIndicators

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency injection
async def get_influx_client() -> InfluxDBClient:
    """Get InfluxDB client instance"""
    from app.main import influx_client
    return influx_client

async def get_redis_client() -> RedisClient:
    """Get Redis client instance"""
    from app.main import redis_client
    return redis_client

async def get_market_data_processor() -> MarketDataProcessor:
    """Get market data processor instance"""
    from app.main import market_data_processor
    return market_data_processor

@router.get("/quotes/{symbol}")
async def get_quote(
    symbol: str,
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Get real-time quote for a symbol"""
    try:
        # Try to get from Redis cache first
        quote_data = await redis_client.get_latest_price(symbol)
        
        if quote_data:
            return {
                "success": True,
                "data": quote_data,
                "source": "cache",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # If not in cache, return error (data should be populated by processor)
        raise HTTPException(
            status_code=404,
            detail=f"No data available for symbol {symbol}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get quote for {symbol}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/quotes")
async def get_multiple_quotes(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Get real-time quotes for multiple symbols"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
        
        if len(symbol_list) > 50:  # Limit to 50 symbols
            raise HTTPException(
                status_code=400,
                detail="Maximum 50 symbols allowed per request"
            )
        
        quotes = {}
        for symbol in symbol_list:
            quote_data = await redis_client.get_latest_price(symbol)
            if quote_data:
                quotes[symbol] = quote_data
        
        return {
            "success": True,
            "data": quotes,
            "total_symbols": len(quotes),
            "requested_symbols": len(symbol_list),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get multiple quotes: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/history/{symbol}")
async def get_price_history(
    symbol: str,
    timeframe: str = Query("1d", description="Timeframe: 1h, 1d, 1w, 1m, 3m, 6m, 1y"),
    limit: int = Query(1000, description="Maximum number of data points", ge=1, le=10000),
    influx_client: InfluxDBClient = Depends(get_influx_client)
):
    """Get price history for a symbol"""
    try:
        # Convert timeframe to hours
        timeframe_hours = {
            "1h": 1,
            "1d": 24,
            "1w": 168,
            "1m": 720,
            "3m": 2160,
            "6m": 4320,
            "1y": 8760
        }
        
        if timeframe not in timeframe_hours:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid timeframe. Must be one of: {list(timeframe_hours.keys())}"
            )
        
        hours = timeframe_hours[timeframe]
        history_data = await influx_client.get_price_history(symbol, hours)
        
        if history_data.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No historical data available for {symbol}"
            )
        
        # Convert to list format
        data_points = []
        for _, row in history_data.iterrows():
            data_point = {
                "timestamp": row.get("timestamp", ""),
                "price": row.get("price", 0),
                "volume": row.get("volume", 0),
                "bid": row.get("bid", 0),
                "ask": row.get("ask", 0),
                "spread": row.get("spread", 0),
                "change": row.get("change", 0),
                "change_percent": row.get("change_percent", 0)
            }
            data_points.append(data_point)
        
        # Limit results
        data_points = data_points[-limit:]
        
        return {
            "success": True,
            "symbol": symbol,
            "timeframe": timeframe,
            "data_points": len(data_points),
            "data": data_points,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get price history for {symbol}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/indicators/{symbol}")
async def get_technical_indicators(
    symbol: str,
    indicators: str = Query("all", description="Comma-separated list of indicators or 'all'"),
    period: int = Query(20, description="Period for indicators", ge=5, le=200),
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Get technical indicators for a symbol"""
    try:
        # Get latest price data
        price_data = await redis_client.get_latest_price(symbol)
        if not price_data:
            raise HTTPException(
                status_code=404,
                detail=f"No data available for symbol {symbol}"
            )
        
        # Get price history for calculations
        price_history = await redis_client.get_price_history(symbol, 200)
        
        if not price_history:
            raise HTTPException(
                status_code=404,
                detail=f"Insufficient data for technical indicators"
            )
        
        # Calculate indicators
        tech_indicators = TechnicalIndicators()
        
        # Extract price and volume data
        prices = [point["price"] for point in price_history if point["price"] > 0]
        volumes = [point["volume"] for point in price_history if point["volume"] > 0]
        
        if len(prices) < period:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient data points. Need at least {period}, got {len(prices)}"
            )
        
        # Calculate requested indicators
        indicator_list = [i.strip() for i in indicators.split(",")] if indicators != "all" else ["all"]
        
        calculated_indicators = {}
        
        if "all" in indicator_list or "sma" in indicator_list:
            calculated_indicators["sma"] = {
                "20": tech_indicators.calculate_sma(prices, 20),
                "50": tech_indicators.calculate_sma(prices, 50) if len(prices) >= 50 else None,
                "200": tech_indicators.calculate_sma(prices, 200) if len(prices) >= 200 else None
            }
        
        if "all" in indicator_list or "ema" in indicator_list:
            calculated_indicators["ema"] = {
                "12": tech_indicators.calculate_ema(prices, 12),
                "26": tech_indicators.calculate_ema(prices, 26)
            }
        
        if "all" in indicator_list or "rsi" in indicator_list:
            calculated_indicators["rsi"] = tech_indicators.calculate_rsi(prices, 14)
        
        if "all" in indicator_list or "macd" in indicator_list:
            calculated_indicators["macd"] = tech_indicators.calculate_macd(prices, 12, 26, 9)
        
        if "all" in indicator_list or "bollinger" in indicator_list:
            calculated_indicators["bollinger_bands"] = tech_indicators.calculate_bollinger_bands(prices, 20)
        
        if "all" in indicator_list or "vwap" in indicator_list:
            calculated_indicators["vwap"] = tech_indicators.calculate_vwap(prices, volumes)
        
        if "all" in indicator_list or "support_resistance" in indicator_list:
            calculated_indicators["support_resistance"] = tech_indicators.get_support_resistance(prices, period)
        
        return {
            "success": True,
            "symbol": symbol,
            "period": period,
            "indicators": calculated_indicators,
            "data_points": len(prices),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get technical indicators for {symbol}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/overview")
async def get_market_overview(
    market_data_processor: MarketDataProcessor = Depends(get_market_data_processor)
):
    """Get market overview for all tracked symbols"""
    try:
        overview = await market_data_processor.get_market_overview()
        
        return {
            "success": True,
            "data": overview,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get market overview: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/symbols")
async def get_tracked_symbols(
    market_data_processor: MarketDataProcessor = Depends(get_market_data_processor)
):
    """Get list of currently tracked symbols"""
    try:
        symbols = market_data_processor.get_tracked_symbols()
        
        return {
            "success": True,
            "symbols": symbols,
            "total_count": len(symbols),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get tracked symbols: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/symbols")
async def add_symbol(
    symbol: str,
    market_data_processor: MarketDataProcessor = Depends(get_market_data_processor)
):
    """Add a new symbol to tracking"""
    try:
        if not symbol or len(symbol) > 10:
            raise HTTPException(
                status_code=400,
                detail="Invalid symbol format"
            )
        
        success = await market_data_processor.add_symbol(symbol.upper())
        
        if success:
            return {
                "success": True,
                "message": f"Symbol {symbol.upper()} added to tracking",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Symbol {symbol.upper()} is already being tracked"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add symbol {symbol}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/symbols/{symbol}")
async def remove_symbol(
    symbol: str,
    market_data_processor: MarketDataProcessor = Depends(get_market_data_processor)
):
    """Remove a symbol from tracking"""
    try:
        success = await market_data_processor.remove_symbol(symbol.upper())
        
        if success:
            return {
                "success": True,
                "message": f"Symbol {symbol.upper()} removed from tracking",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Symbol {symbol.upper()} is not being tracked"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to remove symbol {symbol}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/search")
async def search_symbols(
    query: str = Query(..., description="Search query for symbols"),
    limit: int = Query(10, description="Maximum number of results", ge=1, le=50)
):
    """Search for symbols by query"""
    try:
        # This would typically call a search service
        # For now, return a simple response
        return {
            "success": True,
            "query": query,
            "results": [],
            "total_count": 0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to search symbols: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/stats")
async def get_processing_stats(
    market_data_processor: MarketDataProcessor = Depends(get_market_data_processor)
):
    """Get market data processing statistics"""
    try:
        stats = market_data_processor.get_processing_stats()
        
        return {
            "success": True,
            "data": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get processing stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )
