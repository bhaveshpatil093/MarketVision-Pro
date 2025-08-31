import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  TrendingUp,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DatabasePerformance: React.FC = () => {
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'queries' | 'connections' | 'storage' | 'performance'>('queries');

  useEffect(() => {
    setTimeout(() => {
      const mockDbData = {
        queries: {
          total: 1250000,
          active: 45,
          slow: 12,
          failed: 3,
          avgResponseTime: 12,
          history: [
            { time: '00:00', queries: 1200, responseTime: 15, slow: 8 },
            { time: '06:00', queries: 1500, responseTime: 18, slow: 12 },
            { time: '12:00', queries: 2500, responseTime: 25, slow: 20 },
            { time: '18:00', queries: 2200, responseTime: 22, slow: 18 },
            { time: '22:00', queries: 1800, responseTime: 20, slow: 15 }
          ]
        },
        connections: {
          max: 1000,
          current: 245,
          active: 180,
          idle: 65,
          waiting: 5,
          history: [
            { time: '00:00', current: 200, active: 150, idle: 50 },
            { time: '06:00', current: 250, active: 180, idle: 70 },
            { time: '12:00', current: 400, active: 320, idle: 80 },
            { time: '18:00', current: 350, active: 280, idle: 70 },
            { time: '22:00', current: 280, active: 220, idle: 60 }
          ]
        },
        storage: {
          total: 1024000, // MB
          used: 512000,
          available: 512000,
          percentage: 50,
          tables: [
            { name: 'market_data', size: 256000, rows: 50000000, indexSize: 51200 },
            { name: 'user_portfolios', size: 128000, rows: 1000000, indexSize: 25600 },
            { name: 'transactions', size: 64000, rows: 5000000, indexSize: 12800 },
            { name: 'analytics_cache', size: 32000, rows: 100000, indexSize: 6400 }
          ]
        },
        performance: {
          cacheHitRatio: 85,
          indexUsage: 92,
          lockWaitTime: 5,
          deadlocks: 0,
          history: [
            { time: '00:00', cacheHit: 82, indexUsage: 88, locks: 3 },
            { time: '06:00', cacheHit: 85, indexUsage: 90, locks: 5 },
            { time: '12:00', cacheHit: 78, indexUsage: 85, locks: 8 },
            { time: '18:00', cacheHit: 80, indexUsage: 87, locks: 6 },
            { time: '22:00', cacheHit: 83, indexUsage: 89, locks: 4 }
          ]
        }
      };
      
      setDbData(mockDbData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-market-down';
    if (percentage >= 75) return 'text-market-alert';
    return 'text-market-up';
  };

  if (loading) {
    return (
      <div className="market-card">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Selector */}
      <div className="market-card">
        <div className="flex space-x-2">
          {[
            { id: 'queries', label: 'Queries', icon: Activity },
            { id: 'connections', label: 'Connections', icon: Database },
            { id: 'storage', label: 'Storage', icon: Database },
            { id: 'performance', label: 'Performance', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedMetric(id as typeof selectedMetric)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedMetric === id
                  ? 'bg-market-info text-white'
                  : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Queries Metrics */}
      {selectedMetric === 'queries' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Total Queries</p>
                  <p className="text-2xl font-bold text-dark-text">
                    {(dbData.queries.total / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-3 bg-market-info/10 rounded-full">
                  <Activity className="w-6 h-6 text-market-info" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                {dbData.queries.active} active
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Avg Response Time</p>
                  <p className="text-2xl font-bold text-market-up">{dbData.queries.avgResponseTime}ms</p>
                </div>
                <div className="p-3 bg-market-up/10 rounded-full">
                  {/* Clock icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Fast response
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Slow Queries</p>
                  <p className="text-2xl font-bold text-market-alert">{dbData.queries.slow}</p>
                </div>
                <div className="p-3 bg-market-alert/10 rounded-full">
                  {/* AlertTriangle icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                &gt; 100ms
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Failed Queries</p>
                  <p className="text-2xl font-bold text-market-down">{dbData.queries.failed}</p>
                </div>
                <div className="p-3 bg-market-down/10 rounded-full">
                  {/* TrendingDown icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Last hour
              </div>
            </div>
          </div>

          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Query Performance History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dbData.queries.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <YAxis stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <Tooltip />
                <Line type="monotone" dataKey="queries" stroke="#3B82F6" strokeWidth={2} name="Queries/min" />
                <Line type="monotone" dataKey="responseTime" stroke="#EF4444" strokeWidth={2} name="Response Time (ms)" />
                <Line type="monotone" dataKey="slow" stroke="#F59E0B" strokeWidth={2} name="Slow Queries" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Connections Metrics */}
      {selectedMetric === 'connections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Current Connections</p>
                  <p className={`text-2xl font-bold ${getStatusColor((dbData.connections.current / dbData.connections.max) * 100)}`}>
                    {dbData.connections.current}
                  </p>
                </div>
                <div className="p-3 bg-market-info/10 rounded-full">
                  <Database className="w-6 h-6 text-market-info" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                of {dbData.connections.max} max
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Active Connections</p>
                  <p className="text-2xl font-bold text-market-up">{dbData.connections.active}</p>
                </div>
                <div className="p-3 bg-market-up/10 rounded-full">
                  <Activity className="w-6 h-6 text-market-up" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Processing queries
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Idle Connections</p>
                  <p className="text-2xl font-bold text-dark-text">{dbData.connections.idle}</p>
                </div>
                <div className="p-3 bg-market-info/10 rounded-full">
                  {/* Clock icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Available pool
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Waiting Connections</p>
                  <p className="text-2xl font-bold text-market-alert">{dbData.connections.waiting}</p>
                </div>
                <div className="p-3 bg-market-alert/10 rounded-full">
                  {/* AlertTriangle icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Queue length
              </div>
            </div>
          </div>

          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Connection History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dbData.connections.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <YAxis stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <Tooltip />
                <Area type="monotone" dataKey="current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Total Connections" />
                <Area type="monotone" dataKey="active" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Active Connections" />
                <Area type="monotone" dataKey="idle" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="Idle Connections" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Storage Metrics */}
      {selectedMetric === 'storage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Storage Usage</p>
                  <p className={`text-2xl font-bold ${getStatusColor(dbData.storage.percentage)}`}>
                    {dbData.storage.percentage}%
                  </p>
                </div>
                <div className="p-3 bg-market-info/10 rounded-full">
                  <Database className="w-6 h-6 text-market-info" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                {formatBytes(dbData.storage.used * 1024 * 1024)} / {formatBytes(dbData.storage.total * 1024 * 1024)}
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Available Space</p>
                  <p className="text-2xl font-bold text-dark-text">
                    {formatBytes(dbData.storage.available * 1024 * 1024)}
                  </p>
                </div>
                <div className="p-3 bg-market-up/10 rounded-full">
                  {/* HardDrive icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Free space
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Total Tables</p>
                  <p className="text-2xl font-bold text-dark-text">{dbData.storage.tables.length}</p>
                </div>
                <div className="p-3 bg-market-info/10 rounded-full">
                  <Database className="w-6 h-6 text-market-info" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Active tables
              </div>
            </div>
          </div>

          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Table Storage Details</h3>
            <div className="space-y-3">
              {dbData.storage.tables.map((table: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-dark-text">{table.name}</div>
                    <div className="text-xs text-dark-text-secondary">
                      {table.rows.toLocaleString()} rows
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-dark-text">{formatBytes(table.size * 1024 * 1024)}</div>
                    <div className="text-xs text-dark-text-secondary">
                      Index: {formatBytes(table.indexSize * 1024 * 1024)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {selectedMetric === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Cache Hit Ratio</p>
                  <p className="text-2xl font-bold text-market-up">{dbData.performance.cacheHitRatio}%</p>
                </div>
                <div className="p-3 bg-market-up/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-market-up" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Excellent performance
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Index Usage</p>
                  <p className="text-2xl font-bold text-market-up">{dbData.performance.indexUsage}%</p>
                </div>
                <div className="p-3 bg-market-up/10 rounded-full">
                  {/* BarChart3 icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Well optimized
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Lock Wait Time</p>
                  <p className="text-2xl font-bold text-market-up">{dbData.performance.lockWaitTime}ms</p>
                </div>
                <div className="p-3 bg-market-up/10 rounded-full">
                  {/* Clock icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Low contention
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Deadlocks</p>
                  <p className="text-2xl font-bold text-market-up">{dbData.performance.deadlocks}</p>
                </div>
                <div className="p-3 bg-market-up/10 rounded-full">
                  {/* AlertTriangle icon removed */}
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                No issues
              </div>
            </div>
          </div>

          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Performance History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dbData.performance.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <YAxis stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <Tooltip />
                <Line type="monotone" dataKey="cacheHit" stroke="#10B981" strokeWidth={2} name="Cache Hit %" />
                <Line type="monotone" dataKey="indexUsage" stroke="#3B82F6" strokeWidth={2} name="Index Usage %" />
                <Line type="monotone" dataKey="locks" stroke="#F59E0B" strokeWidth={2} name="Lock Wait (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Database Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Stats</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Optimize DB</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
            <span>Clear Cache</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabasePerformance;
