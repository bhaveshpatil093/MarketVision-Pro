"""
MarketVision Pro - Main FastAPI Application
High-performance real-time market data visualization platform
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from app.config import settings
from app.database.influx_client import InfluxDBClientWrapper
from app.database.redis_client import RedisClient
from app.websocket.manager import WebSocketManager
from app.market_data.processors.market_data_processor import MarketDataProcessor
from app.api.endpoints import market_data, analytics, performance

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global instances
websocket_manager = WebSocketManager()
influx_client = InfluxDBClientWrapper()
redis_client = RedisClient()
market_data_processor = MarketDataProcessor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting MarketVision Pro...")
    
    # Initialize database connections
    await influx_client.connect()
    await redis_client.connect()
    
    # Set up market data processor connections
    await market_data_processor.set_influx_client(influx_client)
    await market_data_processor.set_redis_client(redis_client)
    await market_data_processor.set_websocket_manager(websocket_manager)
    
    # Start market data processor
    asyncio.create_task(market_data_processor.start())
    
    logger.info("MarketVision Pro started successfully!")
    
    yield
    
    # Shutdown
    logger.info("Shutting down MarketVision Pro...")
    await influx_client.disconnect()
    await redis_client.disconnect()
    await market_data_processor.stop()
    logger.info("MarketVision Pro shutdown complete!")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="High-performance real-time market data visualization platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API routes
app.include_router(market_data.router, prefix="/api/v1/market-data", tags=["Market Data"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(performance.router, prefix="/api/v1/performance", tags=["Performance"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to MarketVision Pro",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connections
        influx_healthy = await influx_client.health_check()
        redis_healthy = await redis_client.health_check()
        
        return {
            "status": "healthy" if influx_healthy and redis_healthy else "unhealthy",
            "timestamp": asyncio.get_event_loop().time(),
            "services": {
                "influxdb": "healthy" if influx_healthy else "unhealthy",
                "redis": "healthy" if redis_healthy else "unhealthy",
                "websocket": "healthy" if websocket_manager.is_healthy() else "unhealthy"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "unhealthy", "error": str(e)}
        )

@app.websocket("/ws/market-data")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time market data"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            # Process any incoming messages from client
            await websocket_manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        websocket_manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("MarketVision Pro is starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("MarketVision Pro is shutting down...")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
