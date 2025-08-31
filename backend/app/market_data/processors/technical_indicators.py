"""
Technical indicators processor for market data analysis
"""

import logging
from typing import List, Dict, Optional, Tuple
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

class TechnicalIndicators:
    """Technical indicators calculator for market data"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def calculate_sma(self, prices: List[float], period: int) -> Optional[float]:
        """Calculate Simple Moving Average"""
        try:
            if len(prices) < period:
                return None
            
            return sum(prices[-period:]) / period
            
        except Exception as e:
            self.logger.error(f"Failed to calculate SMA: {e}")
            return None
    
    def calculate_ema(self, prices: List[float], period: int) -> Optional[float]:
        """Calculate Exponential Moving Average"""
        try:
            if len(prices) < period:
                return None
            
            # Calculate initial SMA
            sma = sum(prices[:period]) / period
            
            # Multiplier
            multiplier = 2 / (period + 1)
            
            # Calculate EMA
            ema = sma
            for price in prices[period:]:
                ema = (price * multiplier) + (ema * (1 - multiplier))
            
            return ema
            
        except Exception as e:
            self.logger.error(f"Failed to calculate EMA: {e}")
            return None
    
    def calculate_rsi(self, prices: List[float], period: int = 14) -> Optional[float]:
        """Calculate Relative Strength Index"""
        try:
            if len(prices) < period + 1:
                return None
            
            # Calculate price changes
            deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
            
            # Separate gains and losses
            gains = [d if d > 0 else 0 for d in deltas]
            losses = [-d if d < 0 else 0 for d in deltas]
            
            # Calculate average gains and losses
            avg_gain = sum(gains[-period:]) / period
            avg_loss = sum(losses[-period:]) / period
            
            # Avoid division by zero
            if avg_loss == 0:
                return 100
            
            # Calculate RS and RSI
            rs = avg_gain / avg_loss
            rsi = 100 - (100 / (1 + rs))
            
            return rsi
            
        except Exception as e:
            self.logger.error(f"Failed to calculate RSI: {e}")
            return None
    
    def calculate_macd(
        self, 
        prices: List[float], 
        fast_period: int = 12, 
        slow_period: int = 26, 
        signal_period: int = 9
    ) -> Optional[Dict[str, float]]:
        """Calculate MACD (Moving Average Convergence Divergence)"""
        try:
            if len(prices) < slow_period + signal_period:
                return None
            
            # Calculate EMAs
            ema_fast = self.calculate_ema(prices, fast_period)
            ema_slow = self.calculate_ema(prices, slow_period)
            
            if ema_fast is None or ema_slow is None:
                return None
            
            # Calculate MACD line
            macd_line = ema_fast - ema_slow
            
            # Calculate signal line (EMA of MACD line)
            # For simplicity, we'll use a simplified approach
            # In production, you'd want to maintain MACD line history
            signal_line = macd_line  # Simplified
            
            # Calculate histogram
            histogram = macd_line - signal_line
            
            return {
                "macd_line": round(macd_line, 4),
                "signal_line": round(signal_line, 4),
                "histogram": round(histogram, 4)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to calculate MACD: {e}")
            return None
    
    def calculate_bollinger_bands(
        self, 
        prices: List[float], 
        period: int = 20, 
        std_dev: float = 2.0
    ) -> Optional[Dict[str, float]]:
        """Calculate Bollinger Bands"""
        try:
            if len(prices) < period:
                return None
            
            # Calculate SMA
            sma = self.calculate_sma(prices, period)
            if sma is None:
                return None
            
            # Calculate standard deviation
            recent_prices = prices[-period:]
            std = np.std(recent_prices)
            
            # Calculate bands
            upper_band = sma + (std_dev * std)
            lower_band = sma - (std_dev * std)
            
            return {
                "upper_band": round(upper_band, 4),
                "middle_band": round(sma, 4),
                "lower_band": round(lower_band, 4),
                "bandwidth": round((upper_band - lower_band) / sma * 100, 2),
                "percent_b": round((prices[-1] - lower_band) / (upper_band - lower_band), 4)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to calculate Bollinger Bands: {e}")
            return None
    
    def calculate_vwap(self, prices: List[float], volumes: List[int]) -> Optional[float]:
        """Calculate Volume Weighted Average Price"""
        try:
            if len(prices) != len(volumes) or len(prices) == 0:
                return None
            
            # Calculate cumulative volume-weighted price
            cumulative_vwp = 0
            cumulative_volume = 0
            
            for price, volume in zip(prices, volumes):
                cumulative_vwp += price * volume
                cumulative_volume += volume
            
            if cumulative_volume == 0:
                return None
            
            vwap = cumulative_vwp / cumulative_volume
            return vwap
            
        except Exception as e:
            self.logger.error(f"Failed to calculate VWAP: {e}")
            return None
    
    def calculate_stochastic(
        self, 
        high_prices: List[float], 
        low_prices: List[float], 
        close_prices: List[float], 
        period: int = 14
    ) -> Optional[Dict[str, float]]:
        """Calculate Stochastic Oscillator"""
        try:
            if len(high_prices) < period or len(low_prices) < period or len(close_prices) < period:
                return None
            
            # Get recent data
            recent_highs = high_prices[-period:]
            recent_lows = low_prices[-period:]
            current_close = close_prices[-1]
            
            # Calculate %K
            highest_high = max(recent_highs)
            lowest_low = min(recent_lows)
            
            if highest_high == lowest_low:
                percent_k = 50  # Neutral when high == low
            else:
                percent_k = ((current_close - lowest_low) / (highest_high - lowest_low)) * 100
            
            # Calculate %D (3-period SMA of %K)
            # For simplicity, we'll use the current %K value
            percent_d = percent_k  # Simplified
            
            return {
                "percent_k": round(percent_k, 2),
                "percent_d": round(percent_d, 2)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to calculate Stochastic: {e}")
            return None
    
    def calculate_atr(
        self, 
        high_prices: List[float], 
        low_prices: List[float], 
        close_prices: List[float], 
        period: int = 14
    ) -> Optional[float]:
        """Calculate Average True Range"""
        try:
            if len(high_prices) < period + 1 or len(low_prices) < period + 1 or len(close_prices) < period + 1:
                return None
            
            # Calculate True Range for each period
            true_ranges = []
            
            for i in range(1, len(high_prices)):
                high = high_prices[i]
                low = low_prices[i]
                prev_close = close_prices[i-1]
                
                tr1 = high - low
                tr2 = abs(high - prev_close)
                tr3 = abs(low - prev_close)
                
                true_range = max(tr1, tr2, tr3)
                true_ranges.append(true_range)
            
            # Calculate ATR as SMA of True Range
            if len(true_ranges) >= period:
                atr = sum(true_ranges[-period:]) / period
                return round(atr, 4)
            
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to calculate ATR: {e}")
            return None
    
    def calculate_obv(self, prices: List[float], volumes: List[int]) -> Optional[float]:
        """Calculate On-Balance Volume"""
        try:
            if len(prices) != len(volumes) or len(prices) < 2:
                return None
            
            obv = 0
            
            for i in range(1, len(prices)):
                if prices[i] > prices[i-1]:
                    obv += volumes[i]
                elif prices[i] < prices[i-1]:
                    obv -= volumes[i]
                # If price unchanged, OBV remains the same
            
            return obv
            
        except Exception as e:
            self.logger.error(f"Failed to calculate OBV: {e}")
            return None
    
    def calculate_williams_r(
        self, 
        high_prices: List[float], 
        low_prices: List[float], 
        close_prices: List[float], 
        period: int = 14
    ) -> Optional[float]:
        """Calculate Williams %R"""
        try:
            if len(high_prices) < period or len(low_prices) < period or len(close_prices) < period:
                return None
            
            # Get recent data
            recent_highs = high_prices[-period:]
            recent_lows = low_prices[-period:]
            current_close = close_prices[-1]
            
            # Calculate Williams %R
            highest_high = max(recent_highs)
            lowest_low = min(recent_lows)
            
            if highest_high == lowest_low:
                williams_r = -50  # Neutral when high == low
            else:
                williams_r = ((highest_high - current_close) / (highest_high - lowest_low)) * -100
            
            return round(williams_r, 2)
            
        except Exception as e:
            self.logger.error(f"Failed to calculate Williams %R: {e}")
            return None
    
    def calculate_all_indicators(
        self, 
        prices: List[float], 
        volumes: Optional[List[int]] = None,
        high_prices: Optional[List[float]] = None,
        low_prices: Optional[List[float]] = None
    ) -> Dict[str, any]:
        """Calculate all available technical indicators"""
        try:
            indicators = {}
            
            # Basic indicators
            if len(prices) >= 20:
                indicators["sma_20"] = self.calculate_sma(prices, 20)
                indicators["ema_20"] = self.calculate_ema(prices, 20)
            
            if len(prices) >= 50:
                indicators["sma_50"] = self.calculate_sma(prices, 50)
                indicators["ema_50"] = self.calculate_ema(prices, 50)
            
            if len(prices) >= 200:
                indicators["sma_200"] = self.calculate_sma(prices, 200)
            
            # Momentum indicators
            if len(prices) >= 14:
                indicators["rsi"] = self.calculate_rsi(prices, 14)
            
            if len(prices) >= 26:
                indicators["macd"] = self.calculate_macd(prices, 12, 26, 9)
            
            # Volatility indicators
            if len(prices) >= 20:
                indicators["bollinger_bands"] = self.calculate_bollinger_bands(prices, 20)
            
            if len(prices) >= 14 and high_prices and low_prices and close_prices:
                indicators["atr"] = self.calculate_atr(high_prices, low_prices, close_prices, 14)
            
            # Volume indicators
            if volumes:
                indicators["vwap"] = self.calculate_vwap(prices, volumes)
                indicators["obv"] = self.calculate_obv(prices, volumes)
            
            # Oscillators
            if len(prices) >= 14 and high_prices and low_prices and close_prices:
                indicators["stochastic"] = self.calculate_stochastic(high_prices, low_prices, close_prices, 14)
                indicators["williams_r"] = self.calculate_williams_r(high_prices, low_prices, close_prices, 14)
            
            # Clean up None values
            indicators = {k: v for k, v in indicators.items() if v is not None}
            
            return indicators
            
        except Exception as e:
            self.logger.error(f"Failed to calculate all indicators: {e}")
            return {}
    
    def get_support_resistance(
        self, 
        prices: List[float], 
        window: int = 20
    ) -> Optional[Dict[str, float]]:
        """Calculate support and resistance levels"""
        try:
            if len(prices) < window:
                return None
            
            recent_prices = prices[-window:]
            
            # Find local minima and maxima
            support_levels = []
            resistance_levels = []
            
            for i in range(1, len(recent_prices) - 1):
                if recent_prices[i] < recent_prices[i-1] and recent_prices[i] < recent_prices[i+1]:
                    support_levels.append(recent_prices[i])
                elif recent_prices[i] > recent_prices[i-1] and recent_prices[i] > recent_prices[i+1]:
                    resistance_levels.append(recent_prices[i])
            
            # Get strongest levels (most frequent)
            if support_levels:
                support = max(set(support_levels), key=support_levels.count)
            else:
                support = min(recent_prices)
            
            if resistance_levels:
                resistance = max(set(resistance_levels), key=resistance_levels.count)
            else:
                resistance = max(recent_prices)
            
            return {
                "support": round(support, 4),
                "resistance": round(resistance, 4),
                "current_price": round(prices[-1], 4)
            }
            
        except Exception as e:
            self.logger.error(f"Failed to calculate support/resistance: {e}")
            return None
