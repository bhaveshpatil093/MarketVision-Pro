"""
EODHD Market Data Provider
Provides real-time and historical market data via EODHD API
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx

from app.config import settings

logger = logging.getLogger(__name__)

class EODHDProvider:
    """EODHD market data provider"""
    
    def __init__(self):
        self.api_key = settings.EODHD_API_KEY
        self.base_url = "https://eodhd.com/api"
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
            url = f"{self.base_url}/real-time/{symbol}"
            params = {
                "api_token": self.api_key,
                "fmt": "json"
            }
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and isinstance(data, dict):
                return {
                    "symbol": data.get("code", symbol),
                    "price": data.get("close", 0.0),
                    "change": data.get("change", 0.0),
                    "change_percent": data.get("change_p", 0.0),
                    "volume": data.get("volume", 0),
                    "high": data.get("high", 0.0),
                    "low": data.get("low", 0.0),
                    "open": data.get("open", 0.0),
                    "previous_close": data.get("previousClose", 0.0),
                    "timestamp": datetime.now().isoformat(),
                    "provider": "eodhd"
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get EODHD quote for {symbol}: {e}")
            return None
    
    async def get_historical_data(
        self,
        symbol: str,
        period: str = "1d",
        from_date: Optional[str] = None,
        to_date: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """Get historical data for a symbol"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}/eod/{symbol}"
            params = {
                "api_token": self.api_key,
                "period": period,
                "fmt": "json"
            }
            
            if from_date:
                params["from"] = from_date
            if to_date:
                params["to"] = to_date
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and isinstance(data, list):
                return [
                    {
                        "symbol": symbol,
                        "date": item.get("date", ""),
                        "open": item.get("open", 0.0),
                        "high": item.get("high", 0.0),
                        "low": item.get("low", 0.0),
                        "close": item.get("close", 0.0),
                        "volume": item.get("volume", 0),
                        "adjusted_close": item.get("adjustedClose", 0.0),
                        "provider": "eodhd"
                    }
                    for item in data
                ]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get EODHD historical data for {symbol}: {e}")
            return None
    
    async def get_intraday_data(
        self,
        symbol: str,
        interval: str = "1m"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get intraday data for a symbol"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}/intraday/{symbol}"
            params = {
                "api_token": self.api_key,
                "interval": interval,
                "fmt": "json"
            }
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and isinstance(data, list):
                return [
                    {
                        "symbol": symbol,
                        "timestamp": item.get("datetime", ""),
                        "open": item.get("open", 0.0),
                        "high": item.get("high", 0.0),
                        "low": item.get("low", 0.0),
                        "close": item.get("close", 0.0),
                        "volume": item.get("volume", 0),
                        "provider": "eodhd"
                    }
                    for item in data
                ]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get EODHD intraday data for {symbol}: {e}")
            return None
    
    async def search_symbols(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """Search for symbols"""
        try:
            session = await self._get_session()
            url = f"{self.base_url}/search/{query}"
            params = {
                "api_token": self.api_key,
                "fmt": "json"
            }
            
            response = await session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data and isinstance(data, list):
                return [
                    {
                        "symbol": item.get("Code", ""),
                        "name": item.get("Name", ""),
                        "exchange": item.get("Exchange", ""),
                        "type": item.get("Type", ""),
                        "country": item.get("Country", ""),
                        "currency": item.get("Currency", ""),
                        "provider": "eodhd"
                    }
                    for item in data
                ]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to search EODHD symbols for {query}: {e}")
            return None
    
    async def close(self):
        """Close the HTTP session"""
        if self.session:
            await self.session.aclose()
            self.session = None
