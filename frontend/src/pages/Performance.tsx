import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Settings,
  RefreshCw,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi,
  MemoryStick
} from 'lucide-react';

import { useWebSocket } from '../hooks/useWebSocket';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import SystemMetrics from '../components/Performance/SystemMetrics';
import DatabasePerformance from '../components/Performance/DatabasePerformance';
import WebSocketMetrics from '../components/Performance/WebSocketMetrics';
import OptimizationTools from '../components/Performance/OptimizationTools';

const Performance: React.FC = () => {
  const { isConnected, latency } = useWebSocket();
  const { isOnline } = useConnectionStatus();
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'database' | 'websocket' | 'optimization'>('overview');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'system', label: 'System', icon: Cpu },
    { id: 'database', label: 'Database', icon: HardDrive },
    { id: 'websocket', label: 'WebSocket', icon: Wifi },
    { id: 'optimization', label: 'Optimization', icon: Zap }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as typeof activeTab);
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Performance</h1>
          <p className="text-dark-text-secondary mt-2">
            System monitoring, performance metrics, and optimization tools
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-market-up' : 'bg-market-down'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-market-up' : 'text-market-down'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-2 text-sm text-dark-text-secondary">
              <Clock className="w-4 h-4" />
              <span>{latency}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="market-card">
        <div className="flex space-x-1 p-1 bg-dark-bg-secondary rounded-lg">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-market-info text-white shadow-lg'
                  : 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-bg-secondary/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="market-card">
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Score */}
              <div className="market-card text-center">
                <div className="mb-6">
                  <div className="text-6xl font-bold text-market-up mb-2">92</div>
                  <div className="text-xl text-dark-text-secondary">Performance Score</div>
                  <div className="text-sm text-dark-text-secondary mt-2">
                    Based on system health, latency, and throughput
                  </div>
                </div>
                
                <div className="w-full bg-dark-bg-secondary rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-market-down via-market-alert to-market-up h-3 rounded-full" style={{ width: '92%' }}></div>
                </div>
                
                <div className="flex justify-between text-xs text-dark-text-secondary">
                  <span>Poor</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="market-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-text-secondary">System Health</p>
                      <p className="text-2xl font-bold text-market-up">98%</p>
                    </div>
                    <div className="p-3 bg-market-up/10 rounded-full">
                      <Cpu className="w-6 h-6 text-market-up" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-dark-text-secondary">
                    <span className="text-market-up">↑ 2%</span> from last hour
                  </div>
                </div>

                <div className="market-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-text-secondary">Database Latency</p>
                      <p className="text-2xl font-bold text-market-up">12ms</p>
                    </div>
                    <div className="p-3 bg-market-up/10 rounded-full">
                      <HardDrive className="w-6 h-6 text-market-up" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-dark-text-secondary">
                    <span className="text-market-up">↓ 3ms</span> from last hour
                  </div>
                </div>

                <div className="market-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-text-secondary">WebSocket Latency</p>
                      <p className="text-2xl font-bold text-market-up">{latency}ms</p>
                    </div>
                    <div className="p-3 bg-market-up/10 rounded-full">
                      <Wifi className="w-6 h-6 text-market-up" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-dark-text-secondary">
                    <span className="text-market-up">↓ 5ms</span> from last hour
                  </div>
                </div>

                <div className="market-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-text-secondary">Memory Usage</p>
                      <p className="text-2xl font-bold text-market-alert">78%</p>
                    </div>
                    <div className="p-3 bg-market-alert/10 rounded-full">
                      <MemoryStick className="w-6 h-6 text-market-alert" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-dark-text-secondary">
                    <span className="text-market-down">↑ 5%</span> from last hour
                  </div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="market-card">
                  <h3 className="text-lg font-semibold text-dark-text mb-4">Latency Trends</h3>
                  <div className="h-48 bg-dark-bg-secondary rounded-lg flex items-center justify-center">
                    <div className="text-center text-dark-text-secondary">
                      <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Latency Trend Chart</p>
                      <p className="text-sm">Interactive visualization coming soon</p>
                    </div>
                  </div>
                </div>

                <div className="market-card">
                  <h3 className="text-lg font-semibold text-dark-text mb-4">Throughput Trends</h3>
                  <div className="h-48 bg-dark-bg-secondary rounded-lg flex items-center justify-center">
                    <div className="text-center text-dark-text-secondary">
                      <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Throughput Trend Chart</p>
                      <p className="text-sm">Interactive visualization coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="market-card">
                  <h3 className="text-lg font-semibold text-dark-text mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full btn-primary flex items-center justify-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Run Performance Test</span>
                    </button>
                    
                    <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Optimize Settings</span>
                    </button>
                    
                    <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Clear Cache</span>
                    </button>
                  </div>
                </div>

                <div className="market-card">
                  <h3 className="text-lg font-semibold text-dark-text mb-4">Recent Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-market-alert/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-market-alert" />
                      <div className="text-sm">
                        <div className="font-medium text-dark-text">Memory Usage High</div>
                        <div className="text-dark-text-secondary">78% of available memory</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 bg-market-up/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-market-up" />
                      <div className="text-sm">
                        <div className="font-medium text-dark-text">Performance Improved</div>
                        <div className="text-dark-text-secondary">Latency reduced by 15%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 bg-market-info/10 rounded-lg">
                      <Activity className="w-4 h-4 text-market-info" />
                      <div className="text-sm">
                        <div className="font-medium text-dark-text">System Check</div>
                        <div className="text-dark-text-secondary">All services running normally</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="market-card">
                  <h3 className="text-lg font-semibold text-dark-text mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-text-secondary">Backend API</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-market-up rounded-full"></div>
                        <span className="text-sm font-medium text-market-up">Healthy</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-text-secondary">Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-market-up rounded-full"></div>
                        <span className="text-sm font-medium text-market-up">Healthy</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-text-secondary">WebSocket</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-market-up' : 'bg-market-down'}`}></div>
                        <span className={`text-sm font-medium ${isConnected ? 'text-market-up' : 'text-market-down'}`}>
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-text-secondary">Cache</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-market-up rounded-full"></div>
                        <span className="text-sm font-medium text-market-up">Healthy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && <SystemMetrics />}
          {activeTab === 'database' && <DatabasePerformance />}
          {activeTab === 'websocket' && <WebSocketMetrics />}
          {activeTab === 'optimization' && <OptimizationTools />}
        </>
      )}
    </div>
  );
};

export default Performance;
