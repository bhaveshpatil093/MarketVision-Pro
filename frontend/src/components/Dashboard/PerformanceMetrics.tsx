import React, { useState, useEffect } from 'react';
import { Activity, Clock, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

const PerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    latency: 45,
    throughput: 1200,
    memory: 245,
    cpu: 28,
    errors: 0,
    uptime: 3600
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        latency: Math.max(20, Math.min(100, prev.latency + (Math.random() - 0.5) * 10)),
        throughput: Math.max(800, Math.min(1500, prev.throughput + (Math.random() - 0.5) * 100)),
        memory: Math.max(200, Math.min(300, prev.memory + (Math.random() - 0.5) * 10)),
        cpu: Math.max(20, Math.min(40, prev.cpu + (Math.random() - 0.5) * 5)),
        uptime: prev.uptime + 1
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-market-up';
    if (latency < 100) return 'text-market-alert';
    return 'text-market-down';
  };

  const getLatencyStatus = (latency: number) => {
    if (latency < 50) return 'Excellent';
    if (latency < 100) return 'Good';
    return 'Poor';
  };

  const getPerformanceScore = () => {
    const latencyScore = Math.max(0, 100 - metrics.latency);
    const memoryScore = Math.max(0, 100 - (metrics.memory - 200) * 2);
    const cpuScore = Math.max(0, 100 - metrics.cpu * 2);
    
    return Math.round((latencyScore + memoryScore + cpuScore) / 3);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-market-up';
    if (score >= 60) return 'text-market-alert';
    return 'text-market-down';
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="market-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-text">Performance Metrics</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 hover:bg-dark-bg-secondary rounded transition-colors"
        >
          <Zap className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Performance Score */}
      <div className="mb-6 text-center">
        <div className={`text-3xl font-bold ${getScoreColor(getPerformanceScore())}`}>
          {getPerformanceScore()}/100
        </div>
        <div className="text-sm text-dark-text-secondary">Performance Score</div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4">
        {/* Latency */}
        <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-market-info" />
            <span className="text-sm text-dark-text-secondary">Latency</span>
          </div>
          <div className="text-right">
            <div className={`font-semibold ${getLatencyColor(metrics.latency)}`}>
              {metrics.latency}ms
            </div>
            <div className="text-xs text-dark-text-secondary">
              {getLatencyStatus(metrics.latency)}
            </div>
          </div>
        </div>

        {/* Throughput */}
        <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-market-up" />
            <span className="text-sm text-dark-text-secondary">Throughput</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-dark-text">
              {metrics.throughput.toLocaleString()}/s
            </div>
            <div className="text-xs text-dark-text-secondary">Updates</div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-market-alert" />
            <span className="text-sm text-dark-text-secondary">Memory</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-dark-text">
              {metrics.memory}MB
            </div>
            <div className="text-xs text-dark-text-secondary">
              {Math.round((metrics.memory / 500) * 100)}% of limit
            </div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-market-info" />
            <span className="text-sm text-dark-text-secondary">CPU</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-dark-text">
              {metrics.cpu}%
            </div>
            <div className="text-xs text-dark-text-secondary">
              {metrics.cpu < 30 ? 'Optimal' : metrics.cpu < 50 ? 'Good' : 'High'}
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-market-down" />
            <span className="text-sm text-dark-text-secondary">Errors</span>
          </div>
          <div className="text-right">
            <div className={`font-semibold ${metrics.errors === 0 ? 'text-market-up' : 'text-market-down'}`}>
              {metrics.errors}
            </div>
            <div className="text-xs text-dark-text-secondary">
              {metrics.errors === 0 ? 'No errors' : 'Last 24h'}
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-market-up" />
            <span className="text-sm text-dark-text-secondary">Uptime</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-dark-text">
              {formatUptime(metrics.uptime)}
            </div>
            <div className="text-xs text-dark-text-secondary">Running</div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="mt-6 pt-6 border-t border-dark-border">
        <div className="text-center p-4 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-2">Performance Trend</div>
          <div className="w-full h-20 bg-gradient-to-r from-market-up via-market-alert to-market-down rounded opacity-20"></div>
          <div className="text-xs text-dark-text-secondary mt-2">
            Chart visualization coming soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
