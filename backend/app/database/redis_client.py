"""
Redis client for real-time market data caching
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import pickle

import redis.asyncio as redis
from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    """Redis client for market data caching"""
    
    def __init__(self):
        self.client: Optional[Redis] = None
        self.url = settings.REDIS_URL
        self.db = settings.REDIS_DB
        
    async def connect(self):
        """Connect to Redis"""
        try:
            self.client = redis.from_url(
                self.url,
                db=self.db,
                decode_responses=False,  # Keep binary for pickle
                encoding="utf-8"
            )
            
            # Test connection
            await self.client.ping()
            logger.info("Successfully connected to Redis")
            
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}, running in mock mode")
            self.client = None
    
    async def disconnect(self):
        """Disconnect from Redis"""
        try:
            if self.client:
                await self.client.close()
            logger.info("Disconnected from Redis")
        except Exception as e:
            logger.error(f"Error disconnecting from Redis: {e}")
    
    async def health_check(self) -> bool:
        """Check Redis health"""
        try:
            if not self.client:
                return False
            await self.client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False
    
    async def set_latest_price(self, symbol: str, price_data: Dict[str, Any], ttl: int = 300):
        """Set latest price data for a symbol with TTL"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"price:{symbol}:latest"
            value = pickle.dumps(price_data)
            
            await self.client.setex(key, ttl, value)
            
        except Exception as e:
            logger.error(f"Failed to set latest price in Redis: {e}")
            raise
    
    async def get_latest_price(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get latest price data for a symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"price:{symbol}:latest"
            value = await self.client.get(key)
            
            if value:
                return pickle.loads(value)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get latest price from Redis: {e}")
            return None
    
    async def set_market_data(self, symbol: str, data: Dict[str, Any], ttl: int = 3600):
        """Set market data for a symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"market_data:{symbol}"
            value = pickle.dumps(data)
            
            await self.client.setex(key, ttl, value)
            
        except Exception as e:
            logger.error(f"Failed to set market data in Redis: {e}")
            raise
    
    async def get_market_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get market data for a symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"market_data:{symbol}"
            value = await self.client.get(key)
            
            if value:
                return pickle.loads(value)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get market data from Redis: {e}")
            return None
    
    async def set_technical_indicator(
        self,
        symbol: str,
        indicator: str,
        period: int,
        data: Dict[str, Any],
        ttl: int = 1800
    ):
        """Set technical indicator data"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"indicator:{symbol}:{indicator}:{period}"
            value = pickle.dumps(data)
            
            await self.client.setex(key, ttl, value)
            
        except Exception as e:
            logger.error(f"Failed to set technical indicator in Redis: {e}")
            raise
    
    async def get_technical_indicator(
        self,
        symbol: str,
        indicator: str,
        period: int
    ) -> Optional[Dict[str, Any]]:
        """Get technical indicator data"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"indicator:{symbol}:{indicator}:{period}"
            value = await self.client.get(key)
            
            if value:
                return pickle.loads(value)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get technical indicator from Redis: {e}")
            return None
    
    async def set_order_book(self, symbol: str, order_book: Dict[str, Any], ttl: int = 60):
        """Set order book data for a symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"orderbook:{symbol}"
            value = pickle.dumps(order_book)
            
            await self.client.setex(key, ttl, value)
            
        except Exception as e:
            logger.error(f"Failed to set order book in Redis: {e}")
            raise
    
    async def get_order_book(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get order book data for a symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"orderbook:{symbol}"
            value = await self.client.get(key)
            
            if value:
                return pickle.loads(value)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get order book from Redis: {e}")
            return None
    
    async def set_time_sales(self, symbol: str, trades: List[Dict[str, Any]], ttl: int = 300):
        """Set time and sales data for a symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"timesales:{symbol}"
            value = pickle.dumps(trades)
            
            await self.client.setex(key, ttl, value)
            
        except Exception as e:
            logger.error(f"Failed to set time and sales in Redis: {e}")
            raise
    
    async def get_time_sales(self, symbol: str) -> Optional[List[Dict[str, Any]]]:
        """Get time and sales data for a symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"timesales:{symbol}"
            value = await self.client.get(key)
            
            if value:
                return pickle.loads(value)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get time and sales from Redis: {e}")
            return None
    
    async def add_to_price_history(self, symbol: str, price_data: Dict[str, Any], max_points: int = 1000):
        """Add price data to historical list (limited size)"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"price_history:{symbol}"
            
            # Add to list
            await self.client.lpush(key, pickle.dumps(price_data))
            
            # Trim to max size
            await self.client.ltrim(key, 0, max_points - 1)
            
            # Set TTL
            await self.client.expire(key, 86400)  # 24 hours
            
        except Exception as e:
            logger.error(f"Failed to add to price history in Redis: {e}")
            raise
    
    async def get_price_history(self, symbol: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get price history for a symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = f"price_history:{symbol}"
            values = await self.client.lrange(key, 0, limit - 1)
            
            return [pickle.loads(value) for value in values]
            
        except Exception as e:
            logger.error(f"Failed to get price history from Redis: {e}")
            return []
    
    async def set_performance_metrics(self, metrics: Dict[str, Any], ttl: int = 300):
        """Set performance metrics"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = "performance:metrics"
            value = pickle.dumps(metrics)
            
            await self.client.setex(key, ttl, value)
            
        except Exception as e:
            logger.error(f"Failed to set performance metrics in Redis: {e}")
            raise
    
    async def get_performance_metrics(self) -> Optional[Dict[str, Any]]:
        """Get performance metrics"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            key = "performance:metrics"
            value = await self.client.get(key)
            
            if value:
                return pickle.loads(value)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get performance metrics from Redis: {e}")
            return None
    
    async def increment_counter(self, key: str, ttl: int = 3600) -> int:
        """Increment a counter with TTL"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            count = await self.client.incr(key)
            
            # Set TTL if this is the first increment
            if count == 1:
                await self.client.expire(key, ttl)
            
            return count
            
        except Exception as e:
            logger.error(f"Failed to increment counter in Redis: {e}")
            return 0
    
    async def get_counter(self, key: str) -> int:
        """Get counter value"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            value = await self.client.get(key)
            return int(value) if value else 0
            
        except Exception as e:
            logger.error(f"Failed to get counter from Redis: {e}")
            return 0
    
    async def clear_symbol_data(self, symbol: str):
        """Clear all data for a specific symbol"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            pattern = f"*:{symbol}:*"
            keys = await self.client.keys(pattern)
            
            if keys:
                await self.client.delete(*keys)
                logger.info(f"Cleared {len(keys)} keys for symbol {symbol}")
            
        except Exception as e:
            logger.error(f"Failed to clear symbol data from Redis: {e}")
            raise
    
    async def get_memory_usage(self) -> Dict[str, Any]:
        """Get Redis memory usage statistics"""
        try:
            if not self.client:
                raise RuntimeError("Redis not connected")
            
            info = await self.client.info("memory")
            
            return {
                "used_memory": info.get("used_memory", 0),
                "used_memory_human": info.get("used_memory_human", "0B"),
                "used_memory_peak": info.get("used_memory_peak", 0),
                "used_memory_peak_human": info.get("used_memory_peak_human", "0B"),
                "total_system_memory": info.get("total_system_memory", 0),
                "total_system_memory_human": info.get("total_system_memory_human", "0B")
            }
            
        except Exception as e:
            logger.error(f"Failed to get memory usage from Redis: {e}")
            return {}
