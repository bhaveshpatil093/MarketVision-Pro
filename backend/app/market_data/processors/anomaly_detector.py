"""
Anomaly detector for market data using machine learning
"""

import logging
import numpy as np
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import warnings

warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class AnomalyDetector:
    """Machine learning-based anomaly detector for market data"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.models = {}  # symbol -> model
        self.scalers = {}  # symbol -> scaler
        self.training_data = {}  # symbol -> training data
        self.anomaly_thresholds = {
            "price_change": 0.05,  # 5% price change
            "volume_spike": 3.0,    # 3x volume increase
            "volatility": 0.03,     # 3% volatility
            "rsi_extreme": 0.8,     # RSI above 80 or below 20
            "spread_widening": 0.02 # 2% spread increase
        }
        
    def detect_anomaly(
        self, 
        symbol: str, 
        price_history: List[Dict[str, Any]], 
        current_data: Dict[str, Any]
    ) -> float:
        """Detect anomalies in market data"""
        try:
            if len(price_history) < 20:
                return 0.0  # Not enough data
            
            # Calculate anomaly score using multiple methods
            scores = []
            
            # 1. Statistical anomaly detection
            statistical_score = self._detect_statistical_anomaly(price_history, current_data)
            if statistical_score is not None:
                scores.append(statistical_score)
            
            # 2. ML-based anomaly detection
            ml_score = self._detect_ml_anomaly(symbol, price_history, current_data)
            if ml_score is not None:
                scores.append(ml_score)
            
            # 3. Pattern-based anomaly detection
            pattern_score = self._detect_pattern_anomaly(price_history, current_data)
            if pattern_score is not None:
                scores.append(pattern_score)
            
            # 4. Volume anomaly detection
            volume_score = self._detect_volume_anomaly(price_history, current_data)
            if volume_score is not None:
                scores.append(volume_score)
            
            # Return average score if we have any scores
            if scores:
                return round(np.mean(scores), 4)
            
            return 0.0
            
        except Exception as e:
            self.logger.error(f"Failed to detect anomaly for {symbol}: {e}")
            return 0.0
    
    def _detect_statistical_anomaly(
        self, 
        price_history: List[Dict[str, Any]], 
        current_data: Dict[str, Any]
    ) -> Optional[float]:
        """Detect anomalies using statistical methods"""
        try:
            prices = [point["price"] for point in price_history]
            volumes = [point["volume"] for point in price_history]
            
            if not prices or not volumes:
                return None
            
            current_price = current_data.get("price", 0)
            current_volume = current_data.get("volume", 0)
            
            # Calculate statistics
            mean_price = np.mean(prices)
            std_price = np.std(prices)
            mean_volume = np.mean(volumes)
            std_volume = np.std(volumes)
            
            # Z-score for price
            if std_price > 0:
                price_z_score = abs((current_price - mean_price) / std_price)
            else:
                price_z_score = 0
            
            # Z-score for volume
            if std_volume > 0:
                volume_z_score = abs((current_volume - mean_volume) / std_volume)
            else:
                volume_z_score = 0
            
            # Calculate anomaly score (0-1 scale)
            price_score = min(price_z_score / 3.0, 1.0)  # Normalize to 0-1
            volume_score = min(volume_z_score / 3.0, 1.0)
            
            # Combined score
            combined_score = (price_score + volume_score) / 2
            
            return combined_score
            
        except Exception as e:
            self.logger.error(f"Failed to detect statistical anomaly: {e}")
            return None
    
    def _detect_ml_anomaly(
        self, 
        symbol: str, 
        price_history: List[Dict[str, Any]], 
        current_data: Dict[str, Any]
    ) -> Optional[float]:
        """Detect anomalies using machine learning (Isolation Forest)"""
        try:
            # Prepare features
            features = self._extract_features(price_history, current_data)
            if not features:
                return None
            
            # Train or update model
            if symbol not in self.models:
                self._train_model(symbol, price_history)
            
            if symbol in self.models and self.models[symbol] is not None:
                # Predict anomaly
                feature_vector = np.array(features).reshape(1, -1)
                
                # Scale features
                if symbol in self.scalers:
                    feature_vector = self.scalers[symbol].transform(feature_vector)
                
                # Get prediction (-1 for anomaly, 1 for normal)
                prediction = self.models[symbol].predict(feature_vector)[0]
                
                # Convert to anomaly score (0-1)
                anomaly_score = 1.0 if prediction == -1 else 0.0
                
                return anomaly_score
            
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to detect ML anomaly for {symbol}: {e}")
            return None
    
    def _detect_pattern_anomaly(
        self, 
        price_history: List[Dict[str, Any]], 
        current_data: Dict[str, Any]
    ) -> Optional[float]:
        """Detect anomalies based on price patterns"""
        try:
            prices = [point["price"] for point in price_history]
            
            if len(prices) < 5:
                return None
            
            current_price = current_data.get("price", 0)
            
            # Check for price gaps
            recent_prices = prices[-5:]
            price_changes = [abs(recent_prices[i] - recent_prices[i-1]) / recent_prices[i-1] 
                           for i in range(1, len(recent_prices))]
            
            # Check for sudden price movements
            if price_changes:
                max_change = max(price_changes)
                if max_change > self.anomaly_thresholds["price_change"]:
                    return min(max_change / self.anomaly_thresholds["price_change"], 1.0)
            
            # Check for price reversals
            if len(prices) >= 10:
                short_trend = np.mean(prices[-5:]) - np.mean(prices[-10:-5])
                long_trend = np.mean(prices[-10:]) - np.mean(prices[-20:-10]) if len(prices) >= 20 else 0
                
                # If trends are opposite, it might be an anomaly
                if short_trend * long_trend < 0:
                    trend_strength = abs(short_trend) / (abs(long_trend) + 1e-8)
                    return min(trend_strength, 1.0)
            
            return 0.0
            
        except Exception as e:
            self.logger.error(f"Failed to detect pattern anomaly: {e}")
            return None
    
    def _detect_volume_anomaly(
        self, 
        price_history: List[Dict[str, Any]], 
        current_data: Dict[str, Any]
    ) -> Optional[float]:
        """Detect anomalies based on volume patterns"""
        try:
            volumes = [point["volume"] for point in price_history]
            
            if len(volumes) < 10:
                return None
            
            current_volume = current_data.get("volume", 0)
            
            # Calculate volume statistics
            mean_volume = np.mean(volumes)
            std_volume = np.std(volumes)
            
            # Check for volume spikes
            if mean_volume > 0:
                volume_ratio = current_volume / mean_volume
                if volume_ratio > self.anomaly_thresholds["volume_spike"]:
                    return min((volume_ratio - 1) / (self.anomaly_thresholds["volume_spike"] - 1), 1.0)
            
            # Check for unusual volume patterns
            recent_volumes = volumes[-10:]
            volume_trend = np.polyfit(range(len(recent_volumes)), recent_volumes, 1)[0]
            
            # If volume is increasing rapidly, it might be an anomaly
            if volume_trend > mean_volume * 0.1:  # 10% increase per period
                return min(volume_trend / (mean_volume * 0.2), 1.0)  # Normalize
            
            return 0.0
            
        except Exception as e:
            self.logger.error(f"Failed to detect volume anomaly: {e}")
            return None
    
    def _extract_features(
        self, 
        price_history: List[Dict[str, Any]], 
        current_data: Dict[str, Any]
    ) -> Optional[List[float]]:
        """Extract features for machine learning model"""
        try:
            if len(price_history) < 20:
                return None
            
            prices = [point["price"] for point in price_history]
            volumes = [point["volume"] for point in price_history]
            
            # Price-based features
            price_change = (prices[-1] - prices[-2]) / prices[-2] if len(prices) > 1 else 0
            price_volatility = np.std(prices[-20:]) / np.mean(prices[-20:]) if len(prices) >= 20 else 0
            
            # Volume-based features
            volume_change = (volumes[-1] - volumes[-2]) / volumes[-2] if len(volumes) > 1 else 0
            volume_ratio = volumes[-1] / np.mean(volumes[-20:]) if len(volumes) >= 20 else 1
            
            # Technical features
            sma_20 = np.mean(prices[-20:]) if len(prices) >= 20 else prices[-1]
            price_to_sma = prices[-1] / sma_20 if sma_20 > 0 else 1
            
            # Momentum features
            momentum_5 = (prices[-1] - prices[-5]) / prices[-5] if len(prices) >= 5 else 0
            momentum_10 = (prices[-1] - prices[-10]) / prices[-10] if len(prices) >= 10 else 0
            
            # Spread features (if available)
            spread = current_data.get("spread", 0)
            spread_ratio = spread / prices[-1] if prices[-1] > 0 else 0
            
            features = [
                price_change,
                price_volatility,
                volume_change,
                volume_ratio,
                price_to_sma,
                momentum_5,
                momentum_10,
                spread_ratio
            ]
            
            # Remove any infinite or NaN values
            features = [f if np.isfinite(f) else 0.0 for f in features]
            
            return features
            
        except Exception as e:
            self.logger.error(f"Failed to extract features: {e}")
            return None
    
    def _train_model(self, symbol: str, price_history: List[Dict[str, Any]]):
        """Train isolation forest model for a symbol"""
        try:
            if len(price_history) < 50:
                return
            
            # Extract features for training
            training_features = []
            for i in range(20, len(price_history)):
                features = self._extract_features(price_history[:i+1], price_history[i])
                if features:
                    training_features.append(features)
            
            if len(training_features) < 10:
                return
            
            # Convert to numpy array
            X = np.array(training_features)
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Train isolation forest
            model = IsolationForest(
                contamination=0.1,  # Expect 10% anomalies
                random_state=42,
                n_estimators=100
            )
            
            model.fit(X_scaled)
            
            # Store model and scaler
            self.models[symbol] = model
            self.scalers[symbol] = scaler
            self.training_data[symbol] = price_history
            
            self.logger.info(f"Trained anomaly detection model for {symbol}")
            
        except Exception as e:
            self.logger.error(f"Failed to train model for {symbol}: {e}")
    
    def _update_model(self, symbol: str, new_data: Dict[str, Any]):
        """Update model with new data"""
        try:
            if symbol in self.training_data:
                self.training_data[symbol].append(new_data)
                
                # Retrain model periodically (every 100 new data points)
                if len(self.training_data[symbol]) % 100 == 0:
                    self._train_model(symbol, self.training_data[symbol])
            
        except Exception as e:
            self.logger.error(f"Failed to update model for {symbol}: {e}")
    
    def get_anomaly_summary(self, symbol: str) -> Dict[str, Any]:
        """Get anomaly detection summary for a symbol"""
        try:
            summary = {
                "symbol": symbol,
                "model_trained": symbol in self.models,
                "training_data_points": len(self.training_data.get(symbol, [])),
                "last_training": None,
                "anomaly_thresholds": self.anomaly_thresholds.copy()
            }
            
            if symbol in self.training_data:
                summary["last_training"] = self.training_data[symbol][-1].get("timestamp") if self.training_data[symbol] else None
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Failed to get anomaly summary for {symbol}: {e}")
            return {}
    
    def set_anomaly_thresholds(self, thresholds: Dict[str, float]):
        """Update anomaly detection thresholds"""
        try:
            for key, value in thresholds.items():
                if key in self.anomaly_thresholds:
                    self.anomaly_thresholds[key] = value
            
            self.logger.info(f"Updated anomaly thresholds: {thresholds}")
            
        except Exception as e:
            self.logger.error(f"Failed to update anomaly thresholds: {e}")
    
    def get_model_performance(self, symbol: str) -> Dict[str, Any]:
        """Get model performance metrics"""
        try:
            if symbol not in self.models:
                return {"error": "Model not trained"}
            
            # Calculate basic performance metrics
            model = self.models[symbol]
            
            performance = {
                "symbol": symbol,
                "model_type": type(model).__name__,
                "n_estimators": getattr(model, 'n_estimators', 'N/A'),
                "contamination": getattr(model, 'contamination', 'N/A'),
                "training_samples": len(self.training_data.get(symbol, [])),
                "last_updated": datetime.utcnow().isoformat()
            }
            
            return performance
            
        except Exception as e:
            self.logger.error(f"Failed to get model performance for {symbol}: {e}")
            return {"error": str(e)}
    
    def reset_model(self, symbol: str):
        """Reset anomaly detection model for a symbol"""
        try:
            if symbol in self.models:
                del self.models[symbol]
            if symbol in self.scalers:
                del self.scalers[symbol]
            if symbol in self.training_data:
                del self.training_data[symbol]
            
            self.logger.info(f"Reset anomaly detection model for {symbol}")
            
        except Exception as e:
            self.logger.error(f"Failed to reset model for {symbol}: {e}")
    
    def get_all_models_info(self) -> Dict[str, Any]:
        """Get information about all trained models"""
        try:
            info = {
                "total_models": len(self.models),
                "models": {}
            }
            
            for symbol in self.models:
                info["models"][symbol] = self.get_model_performance(symbol)
            
            return info
            
        except Exception as e:
            self.logger.error(f"Failed to get all models info: {e}")
            return {"error": str(e)}
