"""
Polygon.io Market Data Provider
Provides real-time and historical market data via Polygon.io API
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

class PolygonProvider:
    """Polygon.io market data provider"""
    
    def __init__(self):
        self.api_key = settings.POLYGON_API_KEY
        self.base_url = "https://api.polygon.io"
        self.session = None
        
    async def _get_session(self) -> httpx.AsyncClient:
        """Get or create HTTP session"""
        if self.session is None:
            self.session = httpx.AsyncClient(timeout=30.0)
        return self.session
    
    async def get_quote(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get real-time quote for a symbol"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}/v2/snapshot/locale/us/markets/stocks/tickers/{symbol}/quote"
            params = {
                "apiKey": self.api_key
            }
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and "results" in data and data["results"]:
                quote = data["results"]
                return {
                    "symbol": symbol,
                    "price": quote.get("p", 0.0),
                    "change": quote.get("c", 0.0),
                    "change_percent": quote.get("P", 0.0),
                    "volume": quote.get("v", 0),
                    "high": quote.get("h", 0.0),
                    "low": quote.get("l", 0.0),
                    "open": quote.get("o", 0.0),
                    "previous_close": quote.get("op", 0.0),
                    "timestamp": datetime.now().isoformat(),
                    "provider": "polygon"
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get Polygon quote for {symbol}: {e}")
            return None
    
    async def get_historical_data(
        self,
        symbol: str,
        from_date: str,
        to_date: str,
        timespan: str = "day"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get historical data for a symbol"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}/v2/aggs/ticker/{symbol}/range/1/{timespan}/{from_date}/{to_date}"
            params = {
                "apiKey": self.api_key,
                "adjusted": "true",
                "sort": "asc"
            }
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and "results" in data and data["results"]:
                return [
                    {
                        "symbol": symbol,
                        "date": datetime.fromtimestamp(item["t"] / 1000).isoformat(),
                        "open": item.get("o", 0.0),
                        "high": item.get("h", 0.0),
                        "low": item.get("l", 0.0),
                        "close": item.get("c", 0.0),
                        "volume": item.get("v", 0),
                        "vwap": item.get("vw", 0.0),
                        "transactions": item.get("n", 0),
                        "provider": "polygon"
                    }
                    for item in data["results"]
                ]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get Polygon historical data for {symbol}: {e}")
            return None
    
    async def get_intraday_data(
        self,
        symbol: str,
        date: str,
        timespan: str = "minute"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get intraday data for a symbol"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}/v2/aggs/ticker/{symbol}/range/1/{timespan}/{date}/{date}"
            params = {
                "apiKey": self.api_key,
                "adjusted": "true",
                "sort": "asc"
            }
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and "results" in data and data["results"]:
                return [
                    {
                        "symbol": symbol,
                        "timestamp": datetime.fromtimestamp(item["t"] / 1000).isoformat(),
                        "open": item.get("o", 0.0),
                        "high": item.get("h", 0.0),
                        "low": item.get("l", 0.0),
                        "close": item.get("c", 0.0),
                        "volume": item.get("v", 0),
                        "vwap": item.get("vw", 0.0),
                        "transactions": item.get("n", 0),
                        "provider": "polygon"
                    }
                    for item in data["results"]
                ]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get Polygon intraday data for {symbol}: {e}")
            return None
    
    async def get_trades(
        self,
        symbol: str,
        date: str,
        limit: int = 100
    ) -> Optional[List[Dict[str, Any]]]:
        """Get trades for a symbol"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}/v3/trades/{symbol}/{date}"
            params = {
                "apiKey": self.api_key,
                "limit": limit
            }
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and "results" in data and data["results"]:
                return [
                    {
                        "symbol": symbol,
                        "timestamp": datetime.fromtimestamp(item["t"] / 1000000000).isoformat(),
                        "price": item.get("p", 0.0),
                        "size": item.get("s", 0),
                        "exchange": item.get("x", ""),
                        "conditions": item.get("c", []),
                        "provider": "polygon"
                    }
                    for item in data["results"]
                ]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get Polygon trades for {symbol}: {e}")
            return None
    
    async def search_tickers(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """Search for tickers"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}/v3/reference/tickers"
            params = {
                "apiKey": self.api_key,
                "search": query,
                "active": "true",
                "limit": 50
            }
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and "results" in data and data["results"]:
                return [
                    {
                        "symbol": item.get("ticker", ""),
                        "name": item.get("name", ""),
                        "market": item.get("market", ""),
                        "locale": item.get("locale", ""),
                        "primary_exchange": item.get("primary_exchange", ""),
                        "type": item.get("type", ""),
                        "active": item.get("active", False),
                        "currency_name": item.get("currency_name", ""),
                        "provider": "polygon"
                    }
                    for item in data["results"]
                ]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to search Polygon tickers for {query}: {e}")
            return None
    
    async def close(self):
        """Close the HTTP session"""
        if self.session:
            await self.session.aclose()
            self.session = None
