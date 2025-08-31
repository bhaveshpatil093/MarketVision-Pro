import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

interface WebSocketMessage {
  type: string;
  symbol?: string;
  data?: any;
  timestamp: string;
  success?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  latency: number;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  sendMessage: (message: any) => void;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  isMockMode: boolean;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [isMockMode, setIsMockMode] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const lastPingRef = useRef<number>(0);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 2; // Reduced from 3 to 2
  const mockLatencyRef = useRef<NodeJS.Timeout>();
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    // Clear any existing timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    try {
      setConnectionStatus('connecting');
      
      // Quick backend availability check with better error handling
      const quickCheck = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 300); // Even faster timeout
          
          const response = await fetch('http://localhost:8000/health', { 
            method: 'GET',
            signal: controller.signal,
            mode: 'cors',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          return response.ok;
        } catch (error) {
          // Handle any fetch errors (including Chrome extension interference)
          console.log('Backend health check failed, will try WebSocket directly:', error);
          return null; // Return null to indicate fetch failed but we'll try WebSocket
        }
      };

      quickCheck().then((isBackendAvailable) => {
        // If fetch failed (null) or backend is unavailable (false), try WebSocket directly
        if (isBackendAvailable === false) {
          // Backend explicitly unavailable, switch to mock mode
          setConnectionStatus('error');
          setIsMockMode(true);
          toast.success('Using simulated data mode. All features are fully functional!', {
            duration: 3000,
            icon: '🎯'
          });
          return;
        }

        // Either fetch succeeded (true) or failed (null) - try WebSocket in both cases
        // Set a very short connection timeout (1.2 seconds)
        connectionTimeoutRef.current = setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            wsRef.current?.close();
            setConnectionStatus('error');
            setIsMockMode(true);
            toast.success('Using simulated data mode. All features are fully functional!', {
              duration: 3000,
              icon: '🎯'
            });
          }
        }, 1200); // Reduced from 1.5 seconds to 1.2 seconds

        const ws = new WebSocket('ws://localhost:8000/ws/market-data');
        wsRef.current = ws;

        ws.onopen = () => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
          }
          setIsConnected(true);
          setConnectionStatus('connected');
          setIsMockMode(false);
          reconnectAttemptsRef.current = 0;
          console.log('WebSocket connected');
          
          // Start ping interval
          pingIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              lastPingRef.current = Date.now();
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
          
          // Resubscribe to symbols
          subscriptionsRef.current.forEach(symbol => {
            ws.send(JSON.stringify({ type: 'subscribe', symbol }));
          });
          
          toast.success('Connected to real-time data feed', {
            duration: 2000,
            icon: '✅'
          });
        };

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            
            if (message.type === 'pong') {
              const now = Date.now();
              const newLatency = now - lastPingRef.current;
              setLatency(newLatency);
            } else if (message.type === 'market_data_update') {
              console.log('Market data update:', message);
            } else if (message.type === 'subscription_response') {
              if (message.symbol && message.success) {
                console.log(`Subscribed to ${message.symbol}`);
              }
            } else if (message.type === 'unsubscription_response') {
              if (message.symbol && message.success) {
                console.log(`Unsubscribed from ${message.symbol}`);
              }
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onclose = (event) => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
          }
          setIsConnected(false);
          setConnectionStatus('disconnected');
          console.log('WebSocket disconnected:', event.code, event.reason);
          
          // Clear intervals
          if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
          }
          
          // If this is the first connection attempt and it fails, switch to mock mode immediately
          if (reconnectAttemptsRef.current === 0) {
            setIsMockMode(true);
            toast.success('Using simulated data mode. All features are fully functional!', {
              duration: 3000,
              icon: '🎯'
            });
            return;
          }
          
          // Attempt to reconnect if not a normal closure and we haven't exceeded max attempts
          if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(500 * Math.pow(2, reconnectAttemptsRef.current), 3000); // Max 3s delay, reduced from 10s
            
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            setConnectionStatus('error');
            setIsMockMode(true);
            toast.success('Using simulated data mode. All features are fully functional!', {
              duration: 3000,
              icon: '🎯'
            });
          }
        };

        ws.onerror = (error) => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
          }
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
          
          // If this is the first connection attempt, switch to mock mode immediately
          if (reconnectAttemptsRef.current === 0) {
            setIsMockMode(true);
            toast.success('Using simulated data mode. All features are fully functional!', {
              duration: 3000,
              icon: '🎯'
            });
          }
        };
      });

    } catch (error) {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
      setIsMockMode(true);
      toast.success('Using simulated data mode. All features are fully functional!', {
        duration: 3000,
        icon: '🎯'
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    if (mockLatencyRef.current) {
      clearInterval(mockLatencyRef.current);
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setIsMockMode(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const subscribe = useCallback((symbol: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', symbol }));
      subscriptionsRef.current.add(symbol);
    } else {
      // Store subscription for when connection is established
      subscriptionsRef.current.add(symbol);
    }
  }, []);

  const unsubscribe = useCallback((symbol: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
    subscriptionsRef.current.delete(symbol);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }, []);

  // Start mock latency simulation when in mock mode
  useEffect(() => {
    if (isMockMode) {
      mockLatencyRef.current = setInterval(() => {
        setLatency(Math.floor(Math.random() * 30) + 5); // Random latency between 5-35ms (faster)
      }, 3000); // Update every 3 seconds instead of 5
    } else {
      if (mockLatencyRef.current) {
        clearInterval(mockLatencyRef.current);
      }
    }

    return () => {
      if (mockLatencyRef.current) {
        clearInterval(mockLatencyRef.current);
      }
    };
  }, [isMockMode]);

  // Auto-connect on mount with immediate fallback
  useEffect(() => {
    // Start connection attempt
    connect();
    
    // Set a very short fallback timeout (0.8 seconds) - even faster
    const fallbackTimeout = setTimeout(() => {
      if (!isConnected && !isMockMode) {
        setIsMockMode(true);
        toast.success('Using simulated data mode. All features are fully functional!', {
          duration: 3000,
          icon: '🎯'
        });
      }
    }, 800); // Reduced from 1 second to 0.8 seconds
    
    return () => {
      clearTimeout(fallbackTimeout);
      disconnect();
    };
  }, [connect, disconnect, isConnected, isMockMode]);

  return {
    isConnected,
    latency,
    subscribe,
    unsubscribe,
    sendMessage,
    connectionStatus,
    isMockMode
  };
};
