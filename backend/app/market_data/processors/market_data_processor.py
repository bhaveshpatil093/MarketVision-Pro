"""
Market data processor for real-time data ingestion and processing
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import time

from app.config import settings
from app.database.influx_client import InfluxDBClient
from app.database.redis_client import RedisClient
from app.websocket.manager import WebSocketManager
from app.market_data.providers.alpha_vantage import AlphaVantageProvider
from app.market_data.providers.iex_cloud import IEXCloudProvider
from app.market_data.providers.yahoo_finance import YahooFinanceProvider
from app.market_data.processors.technical_indicators import TechnicalIndicators
from app.market_data.processors.anomaly_detector import AnomalyDetector

logger = logging.getLogger(__name__)

class MarketDataProcessor:
    """Main market data processor for real-time data handling"""
    
    def __init__(self):
        self.influx_client: Optional[InfluxDBClient] = None
        self.redis_client: Optional[RedisClient] = None
        self.websocket_manager: Optional[WebSocketManager] = None
        
        # Data providers
        self.alpha_vantage = AlphaVantageProvider()
        self.iex_cloud = IEXCloudProvider()
        self.yahoo_finance = YahooFinanceProvider()
        
        # Processors
        self.technical_indicators = TechnicalIndicators()
        self.anomaly_detector = AnomalyDetector()
        
        # State
        self.is_running = False
        self.processing_task = None
        self.symbols = set(settings.DEFAULT_SYMBOLS)
        self.last_prices = {}
        self.price_history = {}
        self.processing_stats = {
            "total_updates": 0,
            "last_update": None,
            "errors": 0,
            "latency_ms": 0
        }
        
        # Performance tracking
        self.update_frequency = settings.UPDATE_FREQUENCY / 1000.0  # Convert to seconds
        self.batch_size = settings.BATCH_SIZE
        
    async def start(self):
        """Start the market data processor"""
        try:
            logger.info("Starting Market Data Processor...")
            self.is_running = True
            
            # Start processing task
            self.processing_task = asyncio.create_task(self._process_loop())
            
            logger.info("Market Data Processor started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start Market Data Processor: {e}")
            raise
    
    async def stop(self):
        """Stop the market data processor"""
        try:
            logger.info("Stopping Market Data Processor...")
            self.is_running = False
            
            if self.processing_task:
                self.processing_task.cancel()
                try:
                    await self.processing_task
                except asyncio.CancelledError:
                    pass
            
            logger.info("Market Data Processor stopped")
            
        except Exception as e:
            logger.error(f"Error stopping Market Data Processor: {e}")
    
    async def _process_loop(self):
        """Main processing loop"""
        while self.is_running:
            try:
                start_time = time.time()
                
                # Process all symbols
                await self._process_symbols()
                
                # Update processing stats
                processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds
                self.processing_stats["latency_ms"] = processing_time
                self.processing_stats["last_update"] = datetime.utcnow().isoformat()
                
                # Wait for next update cycle
                await asyncio.sleep(self.update_frequency)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in processing loop: {e}")
                self.processing_stats["errors"] += 1
                await asyncio.sleep(1)  # Wait before retrying
    
    async def _process_symbols(self):
        """Process all symbols for market data updates"""
        try:
            # Process symbols in batches for performance
            symbol_batches = [list(self.symbols)[i:i + self.batch_size] 
                            for i in range(0, len(self.symbols), self.batch_size)]
            
            for batch in symbol_batches:
                # Process batch concurrently
                tasks = [self._process_symbol(symbol) for symbol in batch]
                await asyncio.gather(*tasks, return_exceptions=True)
                
        except Exception as e:
            logger.error(f"Failed to process symbols: {e}")
            raise
    
    async def _process_symbol(self, symbol: str):
        """Process market data for a single symbol"""
        try:
            # Get market data from providers
            market_data = await self._fetch_market_data(symbol)
            
            if not market_data:
                logger.warning(f"No market data received for {symbol}")
                return
            
            # Process and enrich data
            processed_data = await self._process_market_data(symbol, market_data)
            
            # Store data
            await self._store_market_data(symbol, processed_data)
            
            # Broadcast updates
            await self._broadcast_updates(symbol, processed_data)
            
            # Update processing stats
            self.processing_stats["total_updates"] += 1
            
        except Exception as e:
            logger.error(f"Failed to process symbol {symbol}: {e}")
            self.processing_stats["errors"] += 1
    
    async def _fetch_market_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch market data from multiple providers"""
        try:
            # Try different providers in order of preference
            providers = [
                (self.iex_cloud, "IEX Cloud"),
                (self.alpha_vantage, "Alpha Vantage"),
                (self.yahoo_finance, "Yahoo Finance")
            ]
            
            for provider, provider_name in providers:
                try:
                    data = await provider.get_quote(symbol)
                    if data:
                        data["provider"] = provider_name
                        data["symbol"] = symbol
                        data["timestamp"] = datetime.utcnow()
                        return data
                except Exception as e:
                    logger.debug(f"Provider {provider_name} failed for {symbol}: {e}")
                    continue
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to fetch market data for {symbol}: {e}")
            return None
    
    async def _process_market_data(self, symbol: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process and enrich market data with technical indicators"""
        try:
            processed_data = market_data.copy()
            
            # Calculate price change
            if symbol in self.last_prices:
                last_price = self.last_prices[symbol]
                current_price = market_data.get("price", 0)
                
                if last_price > 0:
                    change = current_price - last_price
                    change_percent = (change / last_price) * 100
                    
                    processed_data["change"] = round(change, 4)
                    processed_data["change_percent"] = round(change_percent, 2)
                    processed_data["direction"] = "up" if change > 0 else "down" if change < 0 else "unchanged"
            
            # Update last price
            self.last_prices[symbol] = market_data.get("price", 0)
            
            # Add to price history
            if symbol not in self.price_history:
                self.price_history[symbol] = []
            
            self.price_history[symbol].append({
                "price": market_data.get("price", 0),
                "volume": market_data.get("volume", 0),
                "timestamp": market_data.get("timestamp")
            })
            
            # Keep only recent history (last 1000 points)
            if len(self.price_history[symbol]) > 1000:
                self.price_history[symbol] = self.price_history[symbol][-1000:]
            
            # Calculate technical indicators if we have enough data
            if len(self.price_history[symbol]) >= 20:
                prices = [point["price"] for point in self.price_history[symbol]]
                volumes = [point["volume"] for point in self.price_history[symbol]]
                
                # Calculate basic indicators
                sma_20 = self.technical_indicators.calculate_sma(prices, 20)
                sma_50 = self.technical_indicators.calculate_sma(prices, 50) if len(prices) >= 50 else None
                
                processed_data["indicators"] = {
                    "sma_20": round(sma_20, 4) if sma_20 else None,
                    "sma_50": round(sma_50, 4) if sma_50 else None,
                    "price_above_sma_20": sma_20 and market_data.get("price", 0) > sma_20,
                    "price_above_sma_50": sma_50 and market_data.get("price", 0) > sma_50
                }
                
                # Calculate RSI if we have enough data
                if len(prices) >= 14:
                    rsi = self.technical_indicators.calculate_rsi(prices, 14)
                    processed_data["indicators"]["rsi"] = round(rsi, 2) if rsi else None
                
                # Calculate VWAP
                vwap = self.technical_indicators.calculate_vwap(prices, volumes)
                processed_data["indicators"]["vwap"] = round(vwap, 4) if vwap else None
            
            # Detect anomalies
            if len(self.price_history[symbol]) >= 20:
                anomaly_score = self.anomaly_detector.detect_anomaly(
                    symbol, 
                    self.price_history[symbol][-20:],
                    processed_data
                )
                processed_data["anomaly_score"] = anomaly_score
            
            return processed_data
            
        except Exception as e:
            logger.error(f"Failed to process market data for {symbol}: {e}")
            return market_data
    
    async def _store_market_data(self, symbol: str, data: Dict[str, Any]):
        """Store market data in databases"""
        try:
            # Store in InfluxDB
            if self.influx_client:
                await self.influx_client.write_market_data(data)
            
            # Store in Redis
            if self.redis_client:
                await self.redis_client.set_latest_price(symbol, data)
                await self.redis_client.add_to_price_history(symbol, data)
                
                # Store technical indicators separately
                if "indicators" in data:
                    for indicator_name, value in data["indicators"].items():
                        if value is not None:
                            await self.redis_client.set_technical_indicator(
                                symbol, indicator_name, 20, {"value": value}
                            )
            
        except Exception as e:
            logger.error(f"Failed to store market data for {symbol}: {e}")
            raise
    
    async def _broadcast_updates(self, symbol: str, data: Dict[str, Any]):
        """Broadcast market data updates via WebSocket"""
        try:
            if self.websocket_manager:
                await self.websocket_manager.broadcast_market_data(symbol, data)
            
        except Exception as e:
            logger.error(f"Failed to broadcast updates for {symbol}: {e}")
    
    async def add_symbol(self, symbol: str):
        """Add a new symbol to track"""
        try:
            if symbol not in self.symbols:
                self.symbols.add(symbol)
                logger.info(f"Added symbol to tracking: {symbol}")
                
                # Initialize price history
                self.price_history[symbol] = []
                self.last_prices[symbol] = 0
                
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to add symbol {symbol}: {e}")
            return False
    
    async def remove_symbol(self, symbol: str):
        """Remove a symbol from tracking"""
        try:
            if symbol in self.symbols:
                self.symbols.remove(symbol)
                
                # Clean up data
                if symbol in self.last_prices:
                    del self.last_prices[symbol]
                if symbol in self.price_history:
                    del self.price_history[symbol]
                
                logger.info(f"Removed symbol from tracking: {symbol}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to remove symbol {symbol}: {e}")
            return False
    
    def get_tracked_symbols(self) -> List[str]:
        """Get list of currently tracked symbols"""
        return list(self.symbols)
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return self.processing_stats.copy()
    
    def get_symbol_price_history(self, symbol: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get price history for a symbol"""
        if symbol in self.price_history:
            return self.price_history[symbol][-limit:]
        return []
    
    async def set_influx_client(self, influx_client: InfluxDBClient):
        """Set InfluxDB client reference"""
        self.influx_client = influx_client
    
    async def set_redis_client(self, redis_client: RedisClient):
        """Set Redis client reference"""
        self.redis_client = redis_client
    
    async def set_websocket_manager(self, websocket_manager: WebSocketManager):
        """Set WebSocket manager reference"""
        self.websocket_manager = websocket_manager
    
    async def get_market_overview(self) -> Dict[str, Any]:
        """Get market overview for all tracked symbols"""
        try:
            overview = {
                "total_symbols": len(self.symbols),
                "symbols": {},
                "market_summary": {
                    "gainers": 0,
                    "losers": 0,
                    "unchanged": 0,
                    "total_volume": 0
                }
            }
            
            for symbol in self.symbols:
                latest_data = await self.redis_client.get_latest_price(symbol)
                if latest_data:
                    overview["symbols"][symbol] = {
                        "price": latest_data.get("price", 0),
                        "change": latest_data.get("change", 0),
                        "change_percent": latest_data.get("change_percent", 0),
                        "volume": latest_data.get("volume", 0),
                        "direction": latest_data.get("direction", "unchanged")
                    }
                    
                    # Update market summary
                    direction = latest_data.get("direction", "unchanged")
                    if direction == "up":
                        overview["market_summary"]["gainers"] += 1
                    elif direction == "down":
                        overview["market_summary"]["losers"] += 1
                    else:
                        overview["market_summary"]["unchanged"] += 1
                    
                    overview["market_summary"]["total_volume"] += latest_data.get("volume", 0)
            
            return overview
            
        except Exception as e:
            logger.error(f"Failed to get market overview: {e}")
            return {}
