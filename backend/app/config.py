"""
Configuration management for MarketVision Pro
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """Application settings"""
    
    # Application Configuration
    APP_NAME: str = Field(default="MarketVision Pro", env="APP_NAME")
    DEBUG: bool = Field(default=True, env="DEBUG")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # API Keys
    ALPHA_VANTAGE_API_KEY: Optional[str] = Field(default=None, env="ALPHA_VANTAGE_API_KEY")
    IEX_CLOUD_API_KEY: Optional[str] = Field(default=None, env="IEX_CLOUD_API_KEY")
    BINANCE_API_KEY: Optional[str] = Field(default=None, env="BINANCE_API_KEY")
    BINANCE_SECRET_KEY: Optional[str] = Field(default=None, env="BINANCE_SECRET_KEY")
    
    # Database Configuration
    INFLUXDB_URL: str = Field(default="http://localhost:8086", env="INFLUXDB_URL")
    INFLUXDB_TOKEN: str = Field(default="admin_token_123", env="INFLUXDB_TOKEN")
    INFLUXDB_ORG: str = Field(default="marketvision", env="INFLUXDB_ORG")
    INFLUXDB_BUCKET: str = Field(default="market_data", env="INFLUXDB_BUCKET")
    
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    # WebSocket Configuration
    WS_HOST: str = Field(default="0.0.0.0", env="WS_HOST")
    WS_PORT: int = Field(default=8001, env="WS_PORT")
    
    # Performance Configuration
    MAX_CONNECTIONS: int = Field(default=1000, env="MAX_CONNECTIONS")
    BATCH_SIZE: int = Field(default=100, env="BATCH_SIZE")
    UPDATE_FREQUENCY: int = Field(default=100, env="UPDATE_FREQUENCY")  # milliseconds
    
    # Market Data Configuration
    DEFAULT_SYMBOLS: list = Field(default=["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN"], env="DEFAULT_SYMBOLS")
    MAX_SYMBOLS: int = Field(default=100, env="MAX_SYMBOLS")
    
    # Technical Indicators Configuration
    DEFAULT_PERIODS: dict = Field(default={
        "sma": [20, 50, 200],
        "ema": [12, 26],
        "rsi": 14,
        "macd": {"fast": 12, "slow": 26, "signal": 9},
        "bollinger": 20
    })
    
    # Risk Management Configuration
    VAR_CONFIDENCE_LEVEL: float = Field(default=0.95, env="VAR_CONFIDENCE_LEVEL")
    MAX_POSITION_SIZE: float = Field(default=0.1, env="MAX_POSITION_SIZE")  # 10% of portfolio
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

# Global settings instance
settings = Settings()

# Validate required API keys
def validate_api_keys():
    """Validate that required API keys are set"""
    missing_keys = []
    
    if not settings.ALPHA_VANTAGE_API_KEY:
        missing_keys.append("ALPHA_VANTAGE_API_KEY")
    if not settings.IEX_CLOUD_API_KEY:
        missing_keys.append("IEX_CLOUD_API_KEY")
    
    if missing_keys:
        print(f"Warning: Missing API keys: {', '.join(missing_keys)}")
        print("Some market data features may not work properly.")
        print("Please set these keys in your .env file.")

# Call validation on import
validate_api_keys()
