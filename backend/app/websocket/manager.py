"""
WebSocket manager for real-time market data broadcasting
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Optional, Any
from datetime import datetime
import time

from fastapi import WebSocket, WebSocketDisconnect

from app.config import settings

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_subscriptions: Dict[str, Set[str]] = {}  # connection_id -> symbols
        self.symbol_connections: Dict[str, Set[str]] = {}  # symbol -> connection_ids
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}  # connection_id -> metadata
        
    async def connect(self, websocket: WebSocket, connection_id: str):
        """Accept a new WebSocket connection"""
        try:
            await websocket.accept()
            self.active_connections[connection_id] = websocket
            self.connection_subscriptions[connection_id] = set()
            self.connection_metadata[connection_id] = {
                "connected_at": datetime.utcnow().isoformat(),
                "last_activity": time.time(),
                "subscription_count": 0
            }
            
            logger.info(f"WebSocket connected: {connection_id}")
            
        except Exception as e:
            logger.error(f"Failed to accept WebSocket connection: {e}")
            raise
    
    def disconnect(self, connection_id: str):
        """Remove a WebSocket connection"""
        try:
            # Remove from active connections
            if connection_id in self.active_connections:
                del self.active_connections[connection_id]
            
            # Remove subscriptions
            if connection_id in self.connection_subscriptions:
                symbols = self.connection_subscriptions[connection_id]
                for symbol in symbols:
                    if symbol in self.symbol_connections:
                        self.symbol_connections[symbol].discard(connection_id)
                        if not self.symbol_connections[symbol]:
                            del self.symbol_connections[symbol]
                del self.connection_subscriptions[connection_id]
            
            # Remove metadata
            if connection_id in self.connection_metadata:
                del self.connection_metadata[connection_id]
            
            logger.info(f"WebSocket disconnected: {connection_id}")
            
        except Exception as e:
            logger.error(f"Error during WebSocket disconnect: {e}")
    
    async def subscribe_to_symbol(self, connection_id: str, symbol: str):
        """Subscribe a connection to a symbol"""
        try:
            if connection_id not in self.active_connections:
                logger.warning(f"Connection {connection_id} not found for subscription")
                return False
            
            # Add to connection subscriptions
            if connection_id not in self.connection_subscriptions:
                self.connection_subscriptions[connection_id] = set()
            self.connection_subscriptions[connection_id].add(symbol)
            
            # Add to symbol connections
            if symbol not in self.symbol_connections:
                self.symbol_connections[symbol] = set()
            self.symbol_connections[symbol].add(connection_id)
            
            # Update metadata
            if connection_id in self.connection_metadata:
                self.connection_metadata[connection_id]["subscription_count"] = len(
                    self.connection_subscriptions[connection_id]
                )
                self.connection_metadata[connection_id]["last_activity"] = time.time()
            
            logger.info(f"Connection {connection_id} subscribed to {symbol}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to subscribe connection {connection_id} to {symbol}: {e}")
            return False
    
    async def unsubscribe_from_symbol(self, connection_id: str, symbol: str):
        """Unsubscribe a connection from a symbol"""
        try:
            # Remove from connection subscriptions
            if connection_id in self.connection_subscriptions:
                self.connection_subscriptions[connection_id].discard(symbol)
            
            # Remove from symbol connections
            if symbol in self.symbol_connections:
                self.symbol_connections[symbol].discard(connection_id)
                if not self.symbol_connections[symbol]:
                    del self.symbol_connections[symbol]
            
            # Update metadata
            if connection_id in self.connection_metadata:
                self.connection_metadata[connection_id]["subscription_count"] = len(
                    self.connection_subscriptions[connection_id]
                )
                self.connection_metadata[connection_id]["last_activity"] = time.time()
            
            logger.info(f"Connection {connection_id} unsubscribed from {symbol}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to unsubscribe connection {connection_id} from {symbol}: {e}")
            return False
    
    async def broadcast_to_symbol(self, symbol: str, message: Dict[str, Any]):
        """Broadcast a message to all connections subscribed to a symbol"""
        try:
            if symbol not in self.symbol_connections:
                return 0
            
            message_str = json.dumps(message)
            sent_count = 0
            failed_connections = []
            
            for connection_id in self.symbol_connections[symbol]:
                try:
                    websocket = self.active_connections.get(connection_id)
                    if websocket:
                        await websocket.send_text(message_str)
                        sent_count += 1
                        
                        # Update last activity
                        if connection_id in self.connection_metadata:
                            self.connection_metadata[connection_id]["last_activity"] = time.time()
                    else:
                        failed_connections.append(connection_id)
                        
                except Exception as e:
                    logger.error(f"Failed to send message to connection {connection_id}: {e}")
                    failed_connections.append(connection_id)
            
            # Clean up failed connections
            for connection_id in failed_connections:
                self.disconnect(connection_id)
            
            return sent_count
            
        except Exception as e:
            logger.error(f"Failed to broadcast message to symbol {symbol}: {e}")
            return 0
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast a message to all active connections"""
        try:
            message_str = json.dumps(message)
            sent_count = 0
            failed_connections = []
            
            for connection_id, websocket in self.active_connections.items():
                try:
                    await websocket.send_text(message_str)
                    sent_count += 1
                    
                    # Update last activity
                    if connection_id in self.connection_metadata:
                        self.connection_metadata[connection_id]["last_activity"] = time.time()
                        
                except Exception as e:
                    logger.error(f"Failed to send message to connection {connection_id}: {e}")
                    failed_connections.append(connection_id)
            
            # Clean up failed connections
            for connection_id in failed_connections:
                self.disconnect(connection_id)
            
            return sent_count
            
        except Exception as e:
            logger.error(f"Failed to broadcast message to all connections: {e}")
            return 0
    
    async def send_personal_message(self, connection_id: str, message: Dict[str, Any]):
        """Send a message to a specific connection"""
        try:
            websocket = self.active_connections.get(connection_id)
            if websocket:
                message_str = json.dumps(message)
                await websocket.send_text(message_str)
                
                # Update last activity
                if connection_id in self.connection_metadata:
                    self.connection_metadata[connection_id]["last_activity"] = time.time()
                
                return True
            else:
                logger.warning(f"Connection {connection_id} not found for personal message")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send personal message to {connection_id}: {e}")
            return False
    
    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)
    
    def get_subscription_count(self, symbol: str) -> int:
        """Get the number of connections subscribed to a symbol"""
        return len(self.symbol_connections.get(symbol, set()))
    
    def get_connection_info(self) -> Dict[str, Any]:
        """Get information about all connections"""
        return {
            "total_connections": len(self.active_connections),
            "total_subscriptions": sum(len(subs) for subs in self.connection_subscriptions.values()),
            "symbol_subscriptions": {
                symbol: len(connections) 
                for symbol, connections in self.symbol_connections.items()
            },
            "connection_details": self.connection_metadata
        }

class WebSocketManager:
    """Main WebSocket manager for the application"""
    
    def __init__(self):
        self.connection_manager = ConnectionManager()
        self.connection_counter = 0
        self.health_check_task = None
        self.is_running = False
    
    async def connect(self, websocket: WebSocket):
        """Handle new WebSocket connection"""
        try:
            connection_id = f"conn_{self.connection_counter}"
            self.connection_counter += 1
            
            await self.connection_manager.connect(websocket, connection_id)
            
            # Send welcome message
            welcome_message = {
                "type": "connection_established",
                "connection_id": connection_id,
                "timestamp": datetime.utcnow().isoformat(),
                "message": "Welcome to MarketVision Pro WebSocket API"
            }
            
            await self.connection_manager.send_personal_message(connection_id, welcome_message)
            
        except Exception as e:
            logger.error(f"Failed to handle WebSocket connection: {e}")
            raise
    
    def disconnect(self, websocket: WebSocket):
        """Handle WebSocket disconnection"""
        try:
            # Find connection by websocket
            connection_id = None
            for cid, ws in self.connection_manager.active_connections.items():
                if ws == websocket:
                    connection_id = cid
                    break
            
            if connection_id:
                self.connection_manager.disconnect(connection_id)
            
        except Exception as e:
            logger.error(f"Failed to handle WebSocket disconnection: {e}")
    
    async def handle_message(self, websocket: WebSocket, message: str):
        """Handle incoming WebSocket message"""
        try:
            # Find connection by websocket
            connection_id = None
            for cid, ws in self.connection_manager.active_connections.items():
                if ws == websocket:
                    connection_id = cid
                    break
            
            if not connection_id:
                logger.warning("Received message from unknown connection")
                return
            
            # Parse message
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                error_msg = {
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.utcnow().isoformat()
                }
                await self.connection_manager.send_personal_message(connection_id, error_msg)
                return
            
            # Handle different message types
            message_type = data.get("type")
            
            if message_type == "subscribe":
                symbol = data.get("symbol")
                if symbol:
                    success = await self.connection_manager.subscribe_to_symbol(connection_id, symbol)
                    response = {
                        "type": "subscription_response",
                        "symbol": symbol,
                        "success": success,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    await self.connection_manager.send_personal_message(connection_id, response)
            
            elif message_type == "unsubscribe":
                symbol = data.get("symbol")
                if symbol:
                    success = await self.connection_manager.unsubscribe_from_symbol(connection_id, symbol)
                    response = {
                        "type": "unsubscription_response",
                        "symbol": symbol,
                        "success": success,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    await self.connection_manager.send_personal_message(connection_id, response)
            
            elif message_type == "ping":
                response = {
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                }
                await self.connection_manager.send_personal_message(connection_id, response)
            
            else:
                # Unknown message type
                error_msg = {
                    "type": "error",
                    "message": f"Unknown message type: {message_type}",
                    "timestamp": datetime.utcnow().isoformat()
                }
                await self.connection_manager.send_personal_message(connection_id, error_msg)
            
        except Exception as e:
            logger.error(f"Failed to handle WebSocket message: {e}")
    
    async def broadcast_market_data(self, symbol: str, data: Dict[str, Any]):
        """Broadcast market data to all subscribers"""
        try:
            message = {
                "type": "market_data_update",
                "symbol": symbol,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            sent_count = await self.connection_manager.broadcast_to_symbol(symbol, message)
            return sent_count
            
        except Exception as e:
            logger.error(f"Failed to broadcast market data for {symbol}: {e}")
            return 0
    
    async def broadcast_system_message(self, message: str, message_type: str = "info"):
        """Broadcast system message to all connections"""
        try:
            system_message = {
                "type": "system_message",
                "message_type": message_type,
                "message": message,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            sent_count = await self.connection_manager.broadcast_to_all(system_message)
            return sent_count
            
        except Exception as e:
            logger.error(f"Failed to broadcast system message: {e}")
            return 0
    
    def is_healthy(self) -> bool:
        """Check if WebSocket manager is healthy"""
        return self.is_running and self.connection_manager.get_connection_count() < settings.MAX_CONNECTIONS
    
    def get_stats(self) -> Dict[str, Any]:
        """Get WebSocket manager statistics"""
        return {
            "is_running": self.is_running,
            "connection_count": self.connection_manager.get_connection_count(),
            "max_connections": settings.MAX_CONNECTIONS,
            "connection_info": self.connection_manager.get_connection_info()
        }
    
    async def start_health_check(self):
        """Start periodic health check task"""
        self.is_running = True
        
        while self.is_running:
            try:
                # Check for stale connections (no activity for 5 minutes)
                current_time = time.time()
                stale_connections = []
                
                for connection_id, metadata in self.connection_manager.connection_metadata.items():
                    if current_time - metadata.get("last_activity", 0) > 300:  # 5 minutes
                        stale_connections.append(connection_id)
                
                # Disconnect stale connections
                for connection_id in stale_connections:
                    logger.info(f"Disconnecting stale connection: {connection_id}")
                    self.connection_manager.disconnect(connection_id)
                
                # Log statistics
                if self.connection_manager.get_connection_count() > 0:
                    logger.debug(f"WebSocket stats: {self.get_stats()}")
                
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Health check error: {e}")
                await asyncio.sleep(60)
    
    async def stop_health_check(self):
        """Stop health check task"""
        self.is_running = False
        if self.health_check_task:
            self.health_check_task.cancel()
            try:
                await self.health_check_task
            except asyncio.CancelledError:
                pass
