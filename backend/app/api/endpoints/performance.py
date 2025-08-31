"""
Performance monitoring API endpoints
"""

import logging
import time
import psutil
from typing import Dict, Any, List
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.database.influx_client import InfluxDBClient
from app.database.redis_client import RedisClient
from app.websocket.manager import WebSocketManager

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency injection
async def get_influx_client() -> InfluxDBClient:
    """Get InfluxDB client instance"""
    from app.main import influx_client
    return influx_client

async def get_redis_client() -> RedisClient:
    """Get Redis client instance"""
    from app.main import redis_client
    return redis_client

async def get_websocket_manager() -> WebSocketManager:
    """Get WebSocket manager instance"""
    from app.main import websocket_manager
    return websocket_manager

@router.get("/system/health")
async def get_system_health(
    influx_client: InfluxDBClient = Depends(get_influx_client),
    redis_client: RedisClient = Depends(get_redis_client),
    websocket_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """Get overall system health status"""
    try:
        start_time = time.time()
        
        # Check database health
        influx_healthy = await influx_client.health_check()
        redis_healthy = await redis_client.health_check()
        websocket_healthy = websocket_manager.is_healthy()
        
        # Check system resources
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Determine overall health
        overall_health = "healthy"
        if not all([influx_healthy, redis_healthy, websocket_healthy]):
            overall_health = "degraded"
        if cpu_percent > 90 or memory.percent > 90:
            overall_health = "critical"
        
        health_check_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        return {
            "success": True,
            "status": overall_health,
            "timestamp": datetime.utcnow().isoformat(),
            "health_check_latency_ms": round(health_check_time, 2),
            "services": {
                "influxdb": {
                    "status": "healthy" if influx_healthy else "unhealthy",
                    "type": "time_series_database"
                },
                "redis": {
                    "status": "healthy" if redis_healthy else "unhealthy",
                    "type": "cache_database"
                },
                "websocket": {
                    "status": "healthy" if websocket_healthy else "unhealthy",
                    "type": "real_time_communication"
                }
            },
            "system_resources": {
                "cpu_percent": round(cpu_percent, 2),
                "memory_percent": round(memory.percent, 2),
                "memory_available_gb": round(memory.available / (1024**3), 2),
                "disk_percent": round(disk.percent, 2),
                "disk_free_gb": round(disk.free / (1024**3), 2)
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get system health: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/system/resources")
async def get_system_resources():
    """Get detailed system resource usage"""
    try:
        # CPU information
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        cpu_percent_per_core = psutil.cpu_percent(interval=1, percpu=True)
        
        # Memory information
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        # Disk information
        disk_partitions = psutil.disk_partitions()
        disk_usage = {}
        for partition in disk_partitions:
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                disk_usage[partition.mountpoint] = {
                    "total_gb": round(usage.total / (1024**3), 2),
                    "used_gb": round(usage.used / (1024**3), 2),
                    "free_gb": round(usage.free / (1024**3), 2),
                    "percent": round(usage.percent, 2)
                }
            except PermissionError:
                continue
        
        # Network information
        network = psutil.net_io_counters()
        
        # Process information
        process_count = len(psutil.pids())
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "cpu": {
                "count": cpu_count,
                "frequency_mhz": round(cpu_freq.current, 2) if cpu_freq else None,
                "percent_total": round(psutil.cpu_percent(interval=1), 2),
                "percent_per_core": [round(p, 2) for p in cpu_percent_per_core]
            },
            "memory": {
                "total_gb": round(memory.total / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "used_gb": round(memory.used / (1024**3), 2),
                "percent": round(memory.percent, 2),
                "swap_total_gb": round(swap.total / (1024**3), 2),
                "swap_used_gb": round(swap.used / (1024**3), 2),
                "swap_percent": round(swap.percent, 2)
            },
            "disk": disk_usage,
            "network": {
                "bytes_sent": network.bytes_sent,
                "bytes_recv": network.bytes_recv,
                "packets_sent": network.packets_sent,
                "packets_recv": network.packets_recv
            },
            "processes": {
                "total_count": process_count
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get system resources: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/latency/database")
async def get_database_latency(
    influx_client: InfluxDBClient = Depends(get_influx_client),
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Get database latency metrics"""
    try:
        latency_metrics = {}
        
        # Test InfluxDB latency
        start_time = time.time()
        influx_healthy = await influx_client.health_check()
        influx_latency = (time.time() - start_time) * 1000
        
        # Test Redis latency
        start_time = time.time()
        redis_healthy = await redis_client.health_check()
        redis_latency = (time.time() - start_time) * 1000
        
        # Test Redis read/write operations
        start_time = time.time()
        await redis_client.set_performance_metrics({"test": "latency_test"}, 60)
        redis_write_latency = (time.time() - start_time) * 1000
        
        start_time = time.time()
        await redis_client.get_performance_metrics()
        redis_read_latency = (time.time() - start_time) * 1000
        
        latency_metrics = {
            "influxdb": {
                "health_check_latency_ms": round(influx_latency, 2),
                "status": "healthy" if influx_healthy else "unhealthy"
            },
            "redis": {
                "health_check_latency_ms": round(redis_latency, 2),
                "write_latency_ms": round(redis_write_latency, 2),
                "read_latency_ms": round(redis_read_latency, 2),
                "status": "healthy" if redis_healthy else "unhealthy"
            }
        }
        
        # Calculate average latency
        all_latencies = [
            influx_latency,
            redis_latency,
            redis_write_latency,
            redis_read_latency
        ]
        avg_latency = sum(all_latencies) / len(all_latencies)
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "latency_metrics": latency_metrics,
            "summary": {
                "average_latency_ms": round(avg_latency, 2),
                "max_latency_ms": round(max(all_latencies), 2),
                "min_latency_ms": round(min(all_latencies), 2)
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get database latency: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/latency/websocket")
async def get_websocket_latency(
    websocket_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """Get WebSocket performance metrics"""
    try:
        stats = websocket_manager.get_stats()
        
        # Calculate connection efficiency
        total_connections = stats.get("connection_count", 0)
        max_connections = stats.get("max_connections", 1000)
        connection_utilization = (total_connections / max_connections) * 100 if max_connections > 0 else 0
        
        # Get connection details
        connection_info = stats.get("connection_info", {})
        total_subscriptions = connection_info.get("total_subscriptions", 0)
        avg_subscriptions_per_connection = total_subscriptions / total_connections if total_connections > 0 else 0
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "websocket_metrics": {
                "active_connections": total_connections,
                "max_connections": max_connections,
                "connection_utilization_percent": round(connection_utilization, 2),
                "total_subscriptions": total_subscriptions,
                "avg_subscriptions_per_connection": round(avg_subscriptions_per_connection, 2),
                "is_healthy": stats.get("is_running", False)
            },
            "connection_details": {
                "total_connections": connection_info.get("total_connections", 0),
                "total_subscriptions": connection_info.get("total_subscriptions", 0),
                "symbol_subscriptions": connection_info.get("symbol_subscriptions", {})
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get WebSocket latency: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/throughput/market-data")
async def get_market_data_throughput(
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Get market data processing throughput metrics"""
    try:
        # Get performance metrics from Redis
        performance_metrics = await redis_client.get_performance_metrics()
        
        if not performance_metrics:
            # Return default metrics if none available
            return {
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
                "throughput_metrics": {
                    "messages_per_second": 0,
                    "data_points_per_second": 0,
                    "symbols_processed": 0,
                    "last_update": None
                },
                "message": "No performance metrics available yet"
            }
        
        # Calculate throughput metrics
        total_updates = performance_metrics.get("total_updates", 0)
        last_update = performance_metrics.get("last_update")
        
        # Estimate messages per second (assuming 100ms update frequency)
        messages_per_second = 10  # Default estimate
        if last_update:
            try:
                last_update_time = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
                time_diff = (datetime.utcnow() - last_update_time).total_seconds()
                if time_diff > 0:
                    messages_per_second = total_updates / time_diff
            except Exception:
                pass
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "throughput_metrics": {
                "messages_per_second": round(messages_per_second, 2),
                "data_points_per_second": round(messages_per_second * 5, 2),  # Estimate 5 data points per message
                "symbols_processed": performance_metrics.get("total_symbols", 0),
                "total_updates": total_updates,
                "last_update": last_update,
                "errors": performance_metrics.get("errors", 0),
                "error_rate_percent": round((performance_metrics.get("errors", 0) / max(total_updates, 1)) * 100, 4)
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get market data throughput: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/performance/summary")
async def get_performance_summary(
    influx_client: InfluxDBClient = Depends(get_influx_client),
    redis_client: RedisClient = Depends(get_redis_client),
    websocket_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """Get comprehensive performance summary"""
    try:
        start_time = time.time()
        
        # Gather all performance metrics
        system_health = await get_system_health(influx_client, redis_client, websocket_manager)
        system_resources = await get_system_resources()
        database_latency = await get_database_latency(influx_client, redis_client)
        websocket_latency = await get_websocket_latency(websocket_manager)
        market_data_throughput = await get_market_data_throughput(redis_client)
        
        # Calculate overall performance score
        performance_score = self._calculate_performance_score(
            system_health, database_latency, websocket_latency, market_data_throughput
        )
        
        # Determine performance status
        if performance_score >= 90:
            status = "excellent"
        elif performance_score >= 75:
            status = "good"
        elif performance_score >= 60:
            status = "fair"
        else:
            status = "poor"
        
        summary_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "performance_summary": {
                "overall_score": round(performance_score, 2),
                "status": status,
                "summary_generation_time_ms": round(summary_time, 2)
            },
            "system_health": system_health,
            "system_resources": system_resources,
            "database_latency": database_latency,
            "websocket_latency": websocket_latency,
            "market_data_throughput": market_data_throughput
        }
        
    except Exception as e:
        logger.error(f"Failed to get performance summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/performance/history")
async def get_performance_history(
    hours: int = 24,
    redis_client: RedisClient = Depends(get_redis_client)
):
    """Get performance metrics history"""
    try:
        if hours < 1 or hours > 168:  # Max 1 week
            raise HTTPException(
                status_code=400,
                detail="Hours must be between 1 and 168"
            )
        
        # This would typically query a time-series database for historical performance data
        # For now, return a placeholder response
        
        return {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "requested_hours": hours,
            "message": "Performance history feature not yet implemented",
            "data": []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get performance history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Helper methods
def _calculate_performance_score(
    self,
    system_health: Dict[str, Any],
    database_latency: Dict[str, Any],
    websocket_latency: Dict[str, Any],
    market_data_throughput: Dict[str, Any]
) -> float:
    """Calculate overall performance score (0-100)"""
    try:
        score = 100.0
        
        # System health (30% weight)
        if system_health.get("status") == "critical":
            score -= 30
        elif system_health.get("status") == "degraded":
            score -= 15
        
        # Database latency (25% weight)
        db_latency = database_latency.get("summary", {}).get("average_latency_ms", 0)
        if db_latency > 100:
            score -= 25
        elif db_latency > 50:
            score -= 15
        elif db_latency > 20:
            score -= 5
        
        # WebSocket performance (25% weight)
        ws_metrics = websocket_latency.get("websocket_metrics", {})
        if not ws_metrics.get("is_healthy", False):
            score -= 25
        
        connection_utilization = ws_metrics.get("connection_utilization_percent", 0)
        if connection_utilization > 90:
            score -= 10
        
        # Market data throughput (20% weight)
        throughput = market_data_throughput.get("throughput_metrics", {})
        error_rate = throughput.get("error_rate_percent", 0)
        if error_rate > 5:
            score -= 20
        elif error_rate > 2:
            score -= 10
        elif error_rate > 1:
            score -= 5
        
        return max(0, score)
        
    except Exception:
        return 50.0  # Default score if calculation fails
