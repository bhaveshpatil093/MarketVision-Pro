"""
InfluxDB client for time-series market data storage
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import pandas as pd

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from influxdb_client.client.query_api import QueryApi

from app.config import settings

logger = logging.getLogger(__name__)

class InfluxDBClient:
    """InfluxDB client for market data storage"""
    
    def __init__(self):
        self.client: Optional[InfluxDBClient] = None
        self.write_api = None
        self.query_api = None
        self.bucket = settings.INFLUXDB_BUCKET
        self.org = settings.INFLUXDB_ORG
        self.token = settings.INFLUXDB_TOKEN
        self.url = settings.INFLUXDB_URL
        
    async def connect(self):
        """Connect to InfluxDB"""
        try:
            self.client = InfluxDBClient(
                url=self.url,
                token=self.token,
                org=self.org
            )
            
            # Test connection
            health = await self._check_health()
            if health:
                self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
                self.query_api = self.client.query_api()
                logger.info("Successfully connected to InfluxDB")
            else:
                raise ConnectionError("InfluxDB health check failed")
                
        except Exception as e:
            logger.error(f"Failed to connect to InfluxDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from InfluxDB"""
        try:
            if self.write_api:
                self.write_api.close()
            if self.client:
                self.client.close()
            logger.info("Disconnected from InfluxDB")
        except Exception as e:
            logger.error(f"Error disconnecting from InfluxDB: {e}")
    
    async def _check_health(self) -> bool:
        """Check InfluxDB health"""
        try:
            health = self.client.health()
            return health.status == "pass"
        except Exception as e:
            logger.error(f"InfluxDB health check failed: {e}")
            return False
    
    async def health_check(self) -> bool:
        """Public health check method"""
        return await self._check_health()
    
    async def write_market_data(self, data: Dict[str, Any]):
        """Write market data point to InfluxDB"""
        try:
            if not self.write_api:
                raise RuntimeError("InfluxDB not connected")
            
            # Create data point
            point = Point("market_data") \
                .tag("symbol", data.get("symbol", "unknown")) \
                .tag("exchange", data.get("exchange", "unknown")) \
                .field("price", data.get("price", 0.0)) \
                .field("volume", data.get("volume", 0)) \
                .field("bid", data.get("bid", 0.0)) \
                .field("ask", data.get("ask", 0.0)) \
                .field("spread", data.get("spread", 0.0)) \
                .field("change", data.get("change", 0.0)) \
                .field("change_percent", data.get("change_percent", 0.0)) \
                .time(data.get("timestamp", datetime.utcnow()), WritePrecision.NS)
            
            # Write to InfluxDB
            self.write_api.write(bucket=self.bucket, record=point)
            
        except Exception as e:
            logger.error(f"Failed to write market data to InfluxDB: {e}")
            raise
    
    async def write_batch_market_data(self, data_points: List[Dict[str, Any]]):
        """Write multiple market data points in batch"""
        try:
            if not self.write_api:
                raise RuntimeError("InfluxDB not connected")
            
            points = []
            for data in data_points:
                point = Point("market_data") \
                    .tag("symbol", data.get("symbol", "unknown")) \
                    .tag("exchange", data.get("exchange", "unknown")) \
                    .field("price", data.get("price", 0.0)) \
                    .field("volume", data.get("volume", 0)) \
                    .field("bid", data.get("bid", 0.0)) \
                    .field("ask", data.get("ask", 0.0)) \
                    .field("spread", data.get("spread", 0.0)) \
                    .field("change", data.get("change", 0.0)) \
                    .field("change_percent", data.get("change_percent", 0.0)) \
                    .time(data.get("timestamp", datetime.utcnow()), WritePrecision.NS)
                
                points.append(point)
            
            # Write batch to InfluxDB
            self.write_api.write(bucket=self.bucket, record=points)
            
        except Exception as e:
            logger.error(f"Failed to write batch market data to InfluxDB: {e}")
            raise
    
    async def query_market_data(
        self,
        symbol: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 1000
    ) -> pd.DataFrame:
        """Query market data from InfluxDB"""
        try:
            if not self.query_api:
                raise RuntimeError("InfluxDB not connected")
            
            # Build query
            query = f'''
                from(bucket: "{self.bucket}")
                    |> range(start: {start_time.isoformat() if start_time else "-1h"}, 
                            stop: {end_time.isoformat() if end_time else "now()"})
                    |> filter(fn: (r) => r["_measurement"] == "market_data")
                    |> filter(fn: (r) => r["symbol"] == "{symbol}")
                    |> limit(n: {limit})
            '''
            
            # Execute query
            result = self.query_api.query_data_frame(query, org=self.org)
            
            if result.empty:
                return pd.DataFrame()
            
            # Pivot the data for easier analysis
            pivoted = result.pivot(index="_time", columns="_field", values="_value")
            pivoted.reset_index(inplace=True)
            pivoted.rename(columns={"_time": "timestamp"}, inplace=True)
            
            return pivoted
            
        except Exception as e:
            logger.error(f"Failed to query market data from InfluxDB: {e}")
            return pd.DataFrame()
    
    async def query_technical_indicators(
        self,
        symbol: str,
        indicator: str,
        period: int,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> pd.DataFrame:
        """Query technical indicator data"""
        try:
            if not self.query_api:
                raise RuntimeError("InfluxDB not connected")
            
            # Build query for technical indicators
            query = f'''
                from(bucket: "{self.bucket}")
                    |> range(start: {start_time.isoformat() if start_time else "-1h"}, 
                            stop: {end_time.isoformat() if end_time else "now()"})
                    |> filter(fn: (r) => r["_measurement"] == "technical_indicators")
                    |> filter(fn: (r) => r["symbol"] == "{symbol}")
                    |> filter(fn: (r) => r["indicator"] == "{indicator}")
                    |> filter(fn: (r) => r["period"] == "{period}")
            '''
            
            result = self.query_api.query_data_frame(query, org=self.org)
            
            if result.empty:
                return pd.DataFrame()
            
            # Pivot the data
            pivoted = result.pivot(index="_time", columns="_field", values="_value")
            pivoted.reset_index(inplace=True)
            pivoted.rename(columns={"_time": "timestamp"}, inplace=True)
            
            return pivoted
            
        except Exception as e:
            logger.error(f"Failed to query technical indicators from InfluxDB: {e}")
            return pd.DataFrame()
    
    async def get_latest_price(self, symbol: str) -> Optional[float]:
        """Get the latest price for a symbol"""
        try:
            query = f'''
                from(bucket: "{self.bucket}")
                    |> range(start: -1m)
                    |> filter(fn: (r) => r["_measurement"] == "market_data")
                    |> filter(fn: (r) => r["symbol"] == "{symbol}")
                    |> filter(fn: (r) => r["_field"] == "price")
                    |> last()
            '''
            
            result = self.query_api.query_data_frame(query, org=self.org)
            
            if result.empty:
                return None
            
            return result.iloc[0]["_value"]
            
        except Exception as e:
            logger.error(f"Failed to get latest price from InfluxDB: {e}")
            return None
    
    async def get_price_history(
        self,
        symbol: str,
        hours: int = 24
    ) -> pd.DataFrame:
        """Get price history for a symbol"""
        start_time = datetime.utcnow() - timedelta(hours=hours)
        return await self.query_market_data(symbol, start_time=start_time)
    
    async def create_buckets(self):
        """Create required buckets if they don't exist"""
        try:
            buckets_api = self.client.buckets_api()
            
            # Check if bucket exists
            existing_buckets = buckets_api.find_buckets()
            bucket_names = [bucket.name for bucket in existing_buckets]
            
            if self.bucket not in bucket_names:
                buckets_api.create_bucket(
                    bucket_name=self.bucket,
                    org=self.org
                )
                logger.info(f"Created bucket: {self.bucket}")
            
            # Create technical indicators bucket
            tech_bucket = "technical_indicators"
            if tech_bucket not in bucket_names:
                buckets_api.create_bucket(
                    bucket_name=tech_bucket,
                    org=self.org
                )
                logger.info(f"Created bucket: {tech_bucket}")
                
        except Exception as e:
            logger.error(f"Failed to create buckets: {e}")
            raise
