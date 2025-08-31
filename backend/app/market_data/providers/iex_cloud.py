"""
IEX Cloud market data provider
"""

import asyncio
import logging
from typing import Dict, Optional, Any
import httpx
from datetime import datetime

from app.config import settings

logger = logging.getLogger(__name__)

class IEXCloudProvider:
    """IEX Cloud API provider for market data"""
    
    def __init__(self):
        self.api_key = settings.IEX_CLOUD_API_KEY
        self.base_url = "https://cloud.iexapis.com/stable"
        self.sandbox_url = "https://sandbox.iexapis.com/stable"
        self.use_sandbox = False  # Set to True for testing
        self.rate_limit = 500000  # 500K calls per month (free tier)
        self.call_count = 0
        self.reset_time = datetime.now().timestamp()
        
        if not self.api_key:
            logger.warning("IEX Cloud API key not configured")
    
    def _get_base_url(self) -> str:
        """Get the appropriate base URL"""
        return self.sandbox_url if self.use_sandbox else self.base_url
    
    async def _check_rate_limit(self) -> bool:
        """Check if we can make an API call"""
        current_time = datetime.now().timestamp()
        
        # Reset counter every month (30 days)
        if current_time - self.reset_time >= 2592000:  # 30 days in seconds
            self.call_count = 0
            self.reset_time = current_time
        
        # Check if we've exceeded rate limit
        if self.call_count >= self.rate_limit:
            logger.warning("IEX Cloud rate limit exceeded")
            return False
        
        return True
    
    async def _make_request(self, endpoint: str, params: Optional[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
        """Make API request to IEX Cloud"""
        try:
            if not self.api_key:
                logger.warning("IEX Cloud API key not configured")
                return None
            
            # Check rate limit
            if not await self._check_rate_limit():
                return None
            
            # Prepare parameters
            if params is None:
                params = {}
            
            params["token"] = self.api_key
            
            # Build URL
            url = f"{self._get_base_url()}/{endpoint}"
            
            # Make request
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Update rate limit tracking
                    self.call_count += 1
                    
                    return data
                else:
                    logger.error(f"IEX Cloud API request failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Failed to make IEX Cloud request: {e}")
            return None
    
    async def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get real-time quote for a symbol"""
        try:
            endpoint = f"stock/{symbol}/quote"
            
            data = await self._make_request(endpoint)
            if not data:
                return None
            
            # Parse quote data
            result = {
                "symbol": data.get("symbol", symbol),
                "price": float(data.get("latestPrice", 0)),
                "change": float(data.get("change", 0)),
                "change_percent": float(data.get("changePercent", 0)) * 100,  # Convert to percentage
                "volume": int(data.get("latestVolume", 0)),
                "high": float(data.get("high", 0)),
                "low": float(data.get("low", 0)),
                "open": float(data.get("open", 0)),
                "previous_close": float(data.get("previousClose", 0)),
                "exchange": data.get("primaryExchange", "NYSE"),
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
            logger.error(f"Failed to get quote for {symbol} from IEX Cloud: {e}")
            return None
    
    async def get_intraday_data(
        self, 
        symbol: str, 
        date: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get intraday time series data"""
        try:
            if date:
                endpoint = f"stock/{symbol}/intraday-prices"
                params = {"date": date}
            else:
                endpoint = f"stock/{symbol}/intraday-prices"
                params = {}
            
            data = await self._make_request(endpoint, params)
            if not data:
                return None
            
            # Convert to structured format
            result = {
                "symbol": symbol,
                "date": date or "today",
                "data": []
            }
            
            for item in data:
                data_point = {
                    "timestamp": item.get("minute", ""),
                    "open": float(item.get("open", 0)),
                    "high": float(item.get("high", 0)),
                    "low": float(item.get("low", 0)),
                    "close": float(item.get("close", 0)),
                    "volume": int(item.get("volume", 0)),
                    "average": float(item.get("average", 0)),
                    "number_of_trades": int(item.get("numberOfTrades", 0))
                }
                result["data"].append(data_point)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get intraday data for {symbol} from IEX Cloud: {e}")
            return None
    
    async def get_daily_data(
        self, 
        symbol: str, 
        range: str = "1m"
    ) -> Optional[Dict[str, Any]]:
        """Get daily time series data"""
        try:
            endpoint = f"stock/{symbol}/chart/{range}"
            
            data = await self._make_request(endpoint)
            if not data:
                return None
            
            # Convert to structured format
            result = {
                "symbol": symbol,
                "range": range,
                "data": []
            }
            
            for item in data:
                data_point = {
                    "date": item.get("date", ""),
                    "open": float(item.get("open", 0)),
                    "high": float(item.get("high", 0)),
                    "low": float(item.get("low", 0)),
                    "close": float(item.get("close", 0)),
                    "volume": int(item.get("volume", 0)),
                    "change": float(item.get("change", 0)),
                    "change_percent": float(item.get("changePercent", 0)),
                    "vwap": float(item.get("vwap", 0))
                }
                result["data"].append(data_point)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get daily data for {symbol} from IEX Cloud: {e}")
            return None
    
    async def get_company_info(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get company information"""
        try:
            endpoint = f"stock/{symbol}/company"
            
            data = await self._make_request(endpoint)
            if not data:
                return None
            
            # Parse company data
            result = {
                "symbol": data.get("symbol", symbol),
                "company_name": data.get("companyName", ""),
                "exchange": data.get("exchange", ""),
                "industry": data.get("industry", ""),
                "website": data.get("website", ""),
                "description": data.get("description", ""),
                "ceo": data.get("CEO", ""),
                "sector": data.get("sector", ""),
                "employees": data.get("employees", 0),
                "tags": data.get("tags", [])
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get company info for {symbol} from IEX Cloud: {e}")
            return None
    
    async def get_key_stats(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get key statistics for a symbol"""
        try:
            endpoint = f"stock/{symbol}/stats"
            
            data = await self._make_request(endpoint)
            if not data:
                return None
            
            # Parse key stats
            result = {
                "symbol": data.get("symbol", symbol),
                "market_cap": data.get("marketcap", 0),
                "pe_ratio": data.get("peRatio", 0),
                "forward_pe": data.get("forwardPERatio", 0),
                "price_to_book": data.get("priceToBook", 0),
                "price_to_sales": data.get("priceToSales", 0),
                "dividend_yield": data.get("dividendYield", 0),
                "beta": data.get("beta", 0),
                "52_week_high": data.get("week52high", 0),
                "52_week_low": data.get("week52low", 0),
                "50_day_ma": data.get("day50MovingAverage", 0),
                "200_day_ma": data.get("day200MovingAverage", 0)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get key stats for {symbol} from IEX Cloud: {e}")
            return None
    
    async def get_news(self, symbol: str, last: int = 10) -> Optional[Dict[str, Any]]:
        """Get news for a symbol"""
        try:
            endpoint = f"stock/{symbol}/news/last/{last}"
            
            data = await self._make_request(endpoint)
            if not data:
                return None
            
            # Parse news data
            result = {
                "symbol": symbol,
                "news": []
            }
            
            for item in data:
                news_item = {
                    "datetime": item.get("datetime", 0),
                    "headline": item.get("headline", ""),
                    "source": item.get("source", ""),
                    "url": item.get("url", ""),
                    "summary": item.get("summary", ""),
                    "related": item.get("related", "")
                }
                result["news"].append(news_item)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get news for {symbol} from IEX Cloud: {e}")
            return None
    
    async def get_market_data(self) -> Optional[Dict[str, Any]]:
        """Get market-wide data"""
        try:
            endpoint = "market"
            
            data = await self._make_request(endpoint)
            if not data:
                return None
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to get market data from IEX Cloud: {e}")
            return None
    
    async def get_symbols(self) -> Optional[Dict[str, Any]]:
        """Get list of all symbols"""
        try:
            endpoint = "ref-data/symbols"
            
            data = await self._make_request(endpoint)
            if not data:
                return None
            
            return {
                "symbols": data,
                "total_count": len(data)
            }
            
        except Exception as e:
            logger.error(f"Failed to get symbols from IEX Cloud: {e}")
            return None
    
    def get_rate_limit_info(self) -> Dict[str, Any]:
        """Get current rate limit information"""
        current_time = datetime.now().timestamp()
        time_until_reset = max(0, 2592000 - (current_time - self.reset_time))
        
        return {
            "calls_made": self.call_count,
            "calls_remaining": max(0, self.rate_limit - self.call_count),
            "rate_limit": self.rate_limit,
            "time_until_reset_days": round(time_until_reset / 86400, 1),
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
            logger.error(f"IEX Cloud connection test failed: {e}")
            return False
    
    def enable_sandbox(self):
        """Enable sandbox mode for testing"""
        self.use_sandbox = True
        logger.info("IEX Cloud sandbox mode enabled")
    
    def disable_sandbox(self):
        """Disable sandbox mode"""
        self.use_sandbox = False
        logger.info("IEX Cloud sandbox mode disabled")
