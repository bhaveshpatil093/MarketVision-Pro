"""
Alpha Vantage market data provider
"""

import asyncio
import logging
from typing import Dict, Optional, Any
import httpx
from datetime import datetime

from app.config import settings

logger = logging.getLogger(__name__)

class AlphaVantageProvider:
    """Alpha Vantage API provider for market data"""
    
    def __init__(self):
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.base_url = "https://www.alphavantage.co/query"
        self.rate_limit = 5  # 5 calls per minute (free tier)
        self.last_call_time = 0
        self.call_count = 0
        self.reset_time = datetime.now().timestamp()
        
        if not self.api_key:
            logger.warning("Alpha Vantage API key not configured")
    
    async def _check_rate_limit(self) -> bool:
        """Check if we can make an API call"""
        current_time = datetime.now().timestamp()
        
        # Reset counter every minute
        if current_time - self.reset_time >= 60:
            self.call_count = 0
            self.reset_time = current_time
        
        # Check if we've exceeded rate limit
        if self.call_count >= self.rate_limit:
            logger.warning("Alpha Vantage rate limit exceeded")
            return False
        
        # Check minimum time between calls
        if current_time - self.last_call_time < 12:  # 12 seconds between calls
            return False
        
        return True
    
    async def _make_request(self, params: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Make API request to Alpha Vantage"""
        try:
            if not self.api_key:
                logger.warning("Alpha Vantage API key not configured")
                return None
            
            # Check rate limit
            if not await self._check_rate_limit():
                return None
            
            # Add API key to params
            params["apikey"] = self.api_key
            
            # Make request
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check for API errors
                    if "Error Message" in data:
                        logger.error(f"Alpha Vantage API error: {data['Error Message']}")
                        return None
                    
                    if "Note" in data:
                        logger.warning(f"Alpha Vantage API note: {data['Note']}")
                        return None
                    
                    # Update rate limit tracking
                    self.last_call_time = datetime.now().timestamp()
                    self.call_count += 1
                    
                    return data
                else:
                    logger.error(f"Alpha Vantage API request failed: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Failed to make Alpha Vantage request: {e}")
            return None
    
    async def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get real-time quote for a symbol"""
        try:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol
            }
            
            data = await self._make_request(params)
            if not data or "Global Quote" not in data:
                return None
            
            quote = data["Global Quote"]
            
            # Parse quote data
            result = {
                "symbol": quote.get("01. symbol", symbol),
                "price": float(quote.get("05. price", 0)),
                "change": float(quote.get("09. change", 0)),
                "change_percent": float(quote.get("10. change percent", "0%").replace("%", "")),
                "volume": int(quote.get("06. volume", 0)),
                "high": float(quote.get("03. high", 0)),
                "low": float(quote.get("04. low", 0)),
                "open": float(quote.get("02. open", 0)),
                "previous_close": float(quote.get("08. previous close", 0)),
                "exchange": "NYSE",  # Default assumption
                "timestamp": datetime.utcnow()
            }
            
            # Calculate bid/ask spread (estimate)
            if result["price"] > 0:
                result["bid"] = result["price"] * 0.999  # Estimate bid
                result["ask"] = result["price"] * 1.001  # Estimate ask
                result["spread"] = result["ask"] - result["bid"]
            else:
                result["bid"] = 0
                result["ask"] = 0
                result["spread"] = 0
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get quote for {symbol} from Alpha Vantage: {e}")
            return None
    
    async def get_intraday_data(
        self, 
        symbol: str, 
        interval: str = "5min", 
        outputsize: str = "compact"
    ) -> Optional[Dict[str, Any]]:
        """Get intraday time series data"""
        try:
            params = {
                "function": "TIME_SERIES_INTRADAY",
                "symbol": symbol,
                "interval": interval,
                "outputsize": outputsize
            }
            
            data = await self._make_request(params)
            if not data or f"Time Series ({interval})" not in data:
                return None
            
            time_series = data[f"Time Series ({interval})"]
            
            # Convert to structured format
            result = {
                "symbol": symbol,
                "interval": interval,
                "data": []
            }
            
            for timestamp, values in time_series.items():
                data_point = {
                    "timestamp": datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S"),
                    "open": float(values.get("1. open", 0)),
                    "high": float(values.get("2. high", 0)),
                    "low": float(values.get("3. low", 0)),
                    "close": float(values.get("4. close", 0)),
                    "volume": int(values.get("5. volume", 0))
                }
                result["data"].append(data_point)
            
            # Sort by timestamp
            result["data"].sort(key=lambda x: x["timestamp"])
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get intraday data for {symbol} from Alpha Vantage: {e}")
            return None
    
    async def get_daily_data(
        self, 
        symbol: str, 
        outputsize: str = "compact"
    ) -> Optional[Dict[str, Any]]:
        """Get daily time series data"""
        try:
            params = {
                "function": "TIME_SERIES_DAILY",
                "symbol": symbol,
                "outputsize": outputsize
            }
            
            data = await self._make_request(params)
            if not data or "Time Series (Daily)" not in data:
                return None
            
            time_series = data["Time Series (Daily)"]
            
            # Convert to structured format
            result = {
                "symbol": symbol,
                "data": []
            }
            
            for date, values in time_series.items():
                data_point = {
                    "date": date,
                    "open": float(values.get("1. open", 0)),
                    "high": float(values.get("2. high", 0)),
                    "low": float(values.get("3. low", 0)),
                    "close": float(values.get("4. close", 0)),
                    "volume": int(values.get("5. volume", 0))
                }
                result["data"].append(data_point)
            
            # Sort by date
            result["data"].sort(key=lambda x: x["date"])
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get daily data for {symbol} from Alpha Vantage: {e}")
            return None
    
    async def search_symbols(self, keywords: str) -> Optional[Dict[str, Any]]:
        """Search for symbols by keywords"""
        try:
            params = {
                "function": "SYMBOL_SEARCH",
                "keywords": keywords
            }
            
            data = await self._make_request(params)
            if not data or "bestMatches" not in data:
                return None
            
            matches = data["bestMatches"]
            
            result = {
                "keywords": keywords,
                "matches": []
            }
            
            for match in matches:
                symbol_info = {
                    "symbol": match.get("1. symbol", ""),
                    "name": match.get("2. name", ""),
                    "type": match.get("3. type", ""),
                    "region": match.get("4. region", ""),
                    "market_open": match.get("5. marketOpen", ""),
                    "market_close": match.get("6. marketClose", ""),
                    "timezone": match.get("7. timezone", ""),
                    "currency": match.get("8. currency", ""),
                    "match_score": match.get("9. matchScore", "")
                }
                result["matches"].append(symbol_info)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to search symbols from Alpha Vantage: {e}")
            return None
    
    async def get_company_overview(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get company overview information"""
        try:
            params = {
                "function": "OVERVIEW",
                "symbol": symbol
            }
            
            data = await self._make_request(params)
            if not data or "Symbol" not in data:
                return None
            
            # Parse company overview data
            result = {
                "symbol": data.get("Symbol", symbol),
                "name": data.get("Name", ""),
                "description": data.get("Description", ""),
                "exchange": data.get("Exchange", ""),
                "currency": data.get("Currency", ""),
                "country": data.get("Country", ""),
                "sector": data.get("Sector", ""),
                "industry": data.get("Industry", ""),
                "market_cap": data.get("MarketCapitalization", ""),
                "pe_ratio": data.get("PERatio", ""),
                "dividend_yield": data.get("DividendYield", ""),
                "eps": data.get("EPS", ""),
                "beta": data.get("Beta", ""),
                "52_week_high": data.get("52WeekHigh", ""),
                "52_week_low": data.get("52WeekLow", ""),
                "50_day_ma": data.get("50DayMovingAverage", ""),
                "200_day_ma": data.get("200DayMovingAverage", "")
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get company overview for {symbol} from Alpha Vantage: {e}")
            return None
    
    async def get_earnings_calendar(
        self, 
        horizon: str = "3month"
    ) -> Optional[Dict[str, Any]]:
        """Get earnings calendar"""
        try:
            params = {
                "function": "EARNINGS_CALENDAR",
                "horizon": horizon
            }
            
            data = await self._make_request(params)
            if not data:
                return None
            
            # Note: Earnings calendar returns CSV data, so we need to parse it
            # For simplicity, we'll return the raw data
            return {
                "horizon": horizon,
                "data": data
            }
            
        except Exception as e:
            logger.error(f"Failed to get earnings calendar from Alpha Vantage: {e}")
            return None
    
    def get_rate_limit_info(self) -> Dict[str, Any]:
        """Get current rate limit information"""
        current_time = datetime.now().timestamp()
        time_until_reset = max(0, 60 - (current_time - self.reset_time))
        
        return {
            "calls_made": self.call_count,
            "calls_remaining": max(0, self.rate_limit - self.call_count),
            "rate_limit": self.rate_limit,
            "time_until_reset": round(time_until_reset, 1),
            "last_call": self.last_call_time
        }
    
    async def test_connection(self) -> bool:
        """Test API connection"""
        try:
            if not self.api_key:
                return False
            
            # Try to get a simple quote
            test_symbol = "AAPL"
            quote = await self.get_quote(test_symbol)
            
            return quote is not None
            
        except Exception as e:
            logger.error(f"Alpha Vantage connection test failed: {e}")
            return False
