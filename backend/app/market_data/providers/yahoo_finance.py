"""
Yahoo Finance market data provider (unofficial API)
"""

import asyncio
import logging
from typing import Dict, Optional, Any
import httpx
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class YahooFinanceProvider:
    """Yahoo Finance API provider for market data (unofficial)"""
    
    def __init__(self):
        self.base_url = "https://query1.finance.yahoo.com"
        self.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        self.headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }
        
        # Rate limiting (conservative)
        self.last_call_time = 0
        self.min_interval = 1.0  # 1 second between calls
    
    async def _check_rate_limit(self) -> bool:
        """Check if we can make an API call"""
        current_time = datetime.now().timestamp()
        
        if current_time - self.last_call_time < self.min_interval:
            return False
        
        return True
    
    async def _make_request(self, endpoint: str, params: Optional[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
        """Make API request to Yahoo Finance"""
        try:
            # Check rate limit
            if not await self._check_rate_limit():
                return None
            
            # Prepare parameters
            if params is None:
                params = {}
            
            # Build URL
            url = f"{self.base_url}/{endpoint}"
            
            # Make request
            async with httpx.AsyncClient(timeout=15.0, headers=self.headers) as client:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Update rate limit tracking
                    self.last_call_time = datetime.now().timestamp()
                    
                    return data
                else:
                    logger.error(f"Yahoo Finance API request failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Failed to make Yahoo Finance request: {e}")
            return None
    
    async def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get real-time quote for a symbol"""
        try:
            endpoint = "v8/finance/chart/{symbol}"
            params = {
                "interval": "1m",
                "range": "1d",
                "includePrePost": "false",
                "events": "div,split"
            }
            
            data = await self._make_request(endpoint.format(symbol=symbol), params)
            if not data or "chart" not in data:
                return None
            
            chart = data["chart"]
            if "result" not in chart or not chart["result"]:
                return None
            
            result_data = chart["result"][0]
            meta = result_data.get("meta", {})
            timestamp = result_data.get("timestamp", [])
            indicators = result_data.get("indicators", {})
            
            # Extract price data
            quote = indicators.get("quote", [{}])[0]
            close_prices = quote.get("close", [])
            open_prices = quote.get("open", [])
            high_prices = quote.get("high", [])
            low_prices = quote.get("low", [])
            volumes = quote.get("volume", [])
            
            # Get latest values
            current_price = close_prices[-1] if close_prices else 0
            open_price = open_prices[-1] if open_prices else 0
            high_price = high_prices[-1] if high_prices else 0
            low_price = low_prices[-1] if low_prices else 0
            volume = volumes[-1] if volumes else 0
            
            # Calculate change
            previous_close = meta.get("previousClose", 0)
            change = current_price - previous_close if previous_close > 0 else 0
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            # Parse result
            result = {
                "symbol": symbol,
                "price": float(current_price) if current_price else 0,
                "change": float(change),
                "change_percent": float(change_percent),
                "volume": int(volume) if volume else 0,
                "high": float(high_price) if high_price else 0,
                "low": float(low_price) if low_price else 0,
                "open": float(open_price) if open_price else 0,
                "previous_close": float(previous_close),
                "exchange": meta.get("exchangeName", "Unknown"),
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
            logger.error(f"Failed to get quote for {symbol} from Yahoo Finance: {e}")
            return None
    
    async def get_intraday_data(
        self, 
        symbol: str, 
        interval: str = "5m",
        range: str = "1d"
    ) -> Optional[Dict[str, Any]]:
        """Get intraday time series data"""
        try:
            endpoint = "v8/finance/chart/{symbol}"
            params = {
                "interval": interval,
                "range": range,
                "includePrePost": "false"
            }
            
            data = await self._make_request(endpoint.format(symbol=symbol), params)
            if not data or "chart" not in data:
                return None
            
            chart = data["chart"]
            if "result" not in chart or not chart["result"]:
                return None
            
            result_data = chart["result"][0]
            timestamp = result_data.get("timestamp", [])
            indicators = result_data.get("indicators", {})
            
            # Extract OHLCV data
            quote = indicators.get("quote", [{}])[0]
            open_prices = quote.get("open", [])
            high_prices = quote.get("high", [])
            low_prices = quote.get("low", [])
            close_prices = quote.get("close", [])
            volumes = quote.get("volume", [])
            
            # Convert to structured format
            result = {
                "symbol": symbol,
                "interval": interval,
                "range": range,
                "data": []
            }
            
            for i in range(len(timestamp)):
                if i < len(close_prices) and close_prices[i] is not None:
                    data_point = {
                        "timestamp": datetime.fromtimestamp(timestamp[i]),
                        "open": float(open_prices[i]) if i < len(open_prices) and open_prices[i] is not None else 0,
                        "high": float(high_prices[i]) if i < len(high_prices) and high_prices[i] is not None else 0,
                        "low": float(low_prices[i]) if i < len(low_prices) and low_prices[i] is not None else 0,
                        "close": float(close_prices[i]),
                        "volume": int(volumes[i]) if i < len(volumes) and volumes[i] is not None else 0
                    }
                    result["data"].append(data_point)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get intraday data for {symbol} from Yahoo Finance: {e}")
            return None
    
    async def get_daily_data(
        self, 
        symbol: str, 
        range: str = "1mo"
    ) -> Optional[Dict[str, Any]]:
        """Get daily time series data"""
        try:
            endpoint = "v8/finance/chart/{symbol}"
            params = {
                "interval": "1d",
                "range": range,
                "includePrePost": "false"
            }
            
            data = await self._make_request(endpoint.format(symbol=symbol), params)
            if not data or "chart" not in data:
                return None
            
            chart = data["chart"]
            if "result" not in chart or not chart["result"]:
                return None
            
            result_data = chart["result"][0]
            timestamp = result_data.get("timestamp", [])
            indicators = result_data.get("indicators", {})
            
            # Extract OHLCV data
            quote = indicators.get("quote", [{}])[0]
            open_prices = quote.get("open", [])
            high_prices = quote.get("high", [])
            low_prices = quote.get("low", [])
            close_prices = quote.get("close", [])
            volumes = quote.get("volume", [])
            
            # Convert to structured format
            result = {
                "symbol": symbol,
                "range": range,
                "data": []
            }
            
            for i in range(len(timestamp)):
                if i < len(close_prices) and close_prices[i] is not None:
                    data_point = {
                        "date": datetime.fromtimestamp(timestamp[i]).strftime("%Y-%m-%d"),
                        "open": float(open_prices[i]) if i < len(open_prices) and open_prices[i] is not None else 0,
                        "high": float(high_prices[i]) if i < len(high_prices) and high_prices[i] is not None else 0,
                        "low": float(low_prices[i]) if i < len(low_prices) and low_prices[i] is not None else 0,
                        "close": float(close_prices[i]),
                        "volume": int(volumes[i]) if i < len(volumes) and volumes[i] is not None else 0
                    }
                    result["data"].append(data_point)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get daily data for {symbol} from Yahoo Finance: {e}")
            return None
    
    async def get_company_info(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get company information"""
        try:
            endpoint = "v10/finance/quoteSummary/{symbol}"
            params = {
                "modules": "assetProfile,summaryDetail,summaryProfile"
            }
            
            data = await self._make_request(endpoint.format(symbol=symbol), params)
            if not data or "quoteSummary" not in data:
                return None
            
            quote_summary = data["quoteSummary"]
            if "result" not in quote_summary or not quote_summary["result"]:
                return None
            
            result_data = quote_summary["result"][0]
            
            # Extract company profile
            asset_profile = result_data.get("assetProfile", {})
            summary_detail = result_data.get("summaryDetail", {})
            summary_profile = result_data.get("summaryProfile", {})
            
            # Parse company data
            result = {
                "symbol": symbol,
                "company_name": asset_profile.get("longName", ""),
                "exchange": summary_profile.get("exchange", ""),
                "industry": asset_profile.get("industry", ""),
                "website": asset_profile.get("website", ""),
                "description": asset_profile.get("longBusinessSummary", ""),
                "sector": asset_profile.get("sector", ""),
                "employees": asset_profile.get("fullTimeEmployees", 0),
                "country": asset_profile.get("country", ""),
                "city": asset_profile.get("city", ""),
                "state": asset_profile.get("state", ""),
                "zip": asset_profile.get("zip", ""),
                "phone": asset_profile.get("phone", ""),
                "market_cap": summary_detail.get("marketCap", 0),
                "enterprise_value": summary_detail.get("enterpriseValue", 0)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get company info for {symbol} from Yahoo Finance: {e}")
            return None
    
    async def get_key_stats(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get key statistics for a symbol"""
        try:
            endpoint = "v10/finance/quoteSummary/{symbol}"
            params = {
                "modules": "defaultKeyStatistics,summaryDetail,financialData"
            }
            
            data = await self._make_request(endpoint.format(symbol=symbol), params)
            if not data or "quoteSummary" not in data:
                return None
            
            quote_summary = data["quoteSummary"]
            if "result" not in quote_summary or not quote_summary["result"]:
                return None
            
            result_data = quote_summary["result"][0]
            
            # Extract statistics
            default_key_stats = result_data.get("defaultKeyStatistics", {})
            summary_detail = result_data.get("summaryDetail", {})
            financial_data = result_data.get("financialData", {})
            
            # Parse key stats
            result = {
                "symbol": symbol,
                "market_cap": summary_detail.get("marketCap", 0),
                "enterprise_value": summary_detail.get("enterpriseValue", 0),
                "pe_ratio": financial_data.get("forwardPE", 0),
                "forward_pe": financial_data.get("forwardPE", 0),
                "price_to_book": default_key_stats.get("priceToBook", 0),
                "price_to_sales": summary_detail.get("priceToSalesTrailing12Months", 0),
                "dividend_yield": summary_detail.get("dividendYield", 0),
                "beta": default_key_stats.get("beta", 0),
                "52_week_high": summary_detail.get("fiftyTwoWeekHigh", 0),
                "52_week_low": summary_detail.get("fiftyTwoWeekLow", 0),
                "50_day_ma": summary_detail.get("fiftyDayAverage", 0),
                "200_day_ma": summary_detail.get("twoHundredDayAverage", 0),
                "peg_ratio": financial_data.get("pegRatio", 0),
                "debt_to_equity": financial_data.get("debtToEquity", 0),
                "return_on_equity": financial_data.get("returnOnEquity", 0),
                "return_on_assets": financial_data.get("returnOnAssets", 0)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get key stats for {symbol} from Yahoo Finance: {e}")
            return None
    
    async def search_symbols(self, query: str) -> Optional[Dict[str, Any]]:
        """Search for symbols by query"""
        try:
            endpoint = "v1/finance/search"
            params = {
                "q": query,
                "quotesCount": 10,
                "newsCount": 0
            }
            
            data = await self._make_request(endpoint, params)
            if not data or "quotes" not in data:
                return None
            
            quotes = data["quotes"]
            
            result = {
                "query": query,
                "matches": []
            }
            
            for quote in quotes:
                symbol_info = {
                    "symbol": quote.get("symbol", ""),
                    "name": quote.get("longname", quote.get("shortname", "")),
                    "exchange": quote.get("exchange", ""),
                    "type": quote.get("quoteType", ""),
                    "score": quote.get("score", 0)
                }
                result["matches"].append(symbol_info)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to search symbols from Yahoo Finance: {e}")
            return None
    
    async def get_market_summary(self) -> Optional[Dict[str, Any]]:
        """Get market summary data"""
        try:
            # Get major indices
            indices = ["^GSPC", "^DJI", "^IXIC", "^RUT"]  # S&P 500, Dow, NASDAQ, Russell 2000
            
            summary = {
                "indices": {},
                "timestamp": datetime.utcnow().isoformat()
            }
            
            for index in indices:
                quote = await self.get_quote(index)
                if quote:
                    summary["indices"][index] = {
                        "name": self._get_index_name(index),
                        "price": quote["price"],
                        "change": quote["change"],
                        "change_percent": quote["change_percent"]
                    }
            
            return summary
            
        except Exception as e:
            logger.error(f"Failed to get market summary from Yahoo Finance: {e}")
            return None
    
    def _get_index_name(self, symbol: str) -> str:
        """Get human-readable name for index symbols"""
        names = {
            "^GSPC": "S&P 500",
            "^DJI": "Dow Jones Industrial Average",
            "^IXIC": "NASDAQ Composite",
            "^RUT": "Russell 2000",
            "^VIX": "CBOE Volatility Index"
        }
        return names.get(symbol, symbol)
    
    async def test_connection(self) -> bool:
        """Test API connection"""
        try:
            # Try to get a simple quote
            test_symbol = "AAPL"
            quote = await self.get_quote(test_symbol)
            
            return quote is not None
            
        except Exception as e:
            logger.error(f"Yahoo Finance connection test failed: {e}")
            return False
    
    def get_rate_limit_info(self) -> Dict[str, Any]:
        """Get current rate limit information"""
        current_time = datetime.now().timestamp()
        time_since_last_call = current_time - self.last_call_time
        
        return {
            "last_call": self.last_call_time,
            "time_since_last_call": round(time_since_last_call, 2),
            "min_interval": self.min_interval,
            "can_make_call": time_since_last_call >= self.min_interval
        }
