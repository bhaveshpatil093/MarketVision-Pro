import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  AlertTriangle,
  BarChart3,
  Clock,
  Wifi
} from 'lucide-react';

import { useWebSocket } from '../hooks/useWebSocket';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import PriceCard from '../components/Dashboard/PriceCard';
import MarketOverview from '../components/Dashboard/MarketOverview';
import PerformanceMetrics from '../components/Dashboard/PerformanceMetrics';
import RecentActivity from '../components/Dashboard/RecentActivity';
import ConnectionStatus from '../components/ConnectionStatus';

const Dashboard: React.FC = () => {
  const { isConnected, latency } = useWebSocket();
  const { isOnline, connectionType } = useConnectionStatus();
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockData = {
      totalSymbols: 5,
      symbols: {
        AAPL: {
          price: 150.45,
          change: 2.15,
          change_percent: 1.45,
          volume: 45678900,
          direction: 'up'
        },
        MSFT: {
          price: 280.12,
          change: -1.88,
          change_percent: -0.67,
          volume: 23456700,
          direction: 'down'
        },
        GOOGL: {
          price: 2450.00,
          change: 15.50,
          change_percent: 0.64,
          volume: 12345600,
          direction: 'up'
        },
        TSLA: {
          price: 800.55,
          change: -25.45,
          change_percent: -3.08,
          volume: 34567800,
          direction: 'down'
        },
        AMZN: {
          price: 3200.75,
          change: 45.25,
          change_percent: 1.43,
          volume: 5678900,
          direction: 'up'
        }
      },
      market_summary: {
        gainers: 3,
        losers: 2,
        unchanged: 0,
        total_volume: 121678000
      }
    };

    setMarketData(mockData);
    setLoading(false);
  }, []);

  const getConnectionStatusColor = () => {
    if (!isOnline) return 'text-market-down';
    if (!isConnected) return 'text-market-alert';
    return 'text-market-up';
  };

  const getConnectionStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!isConnected) return 'Connecting...';
    return 'Connected';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Market Dashboard</h1>
          <p className="text-dark-text-secondary mt-2">
            Real-time market data and performance metrics
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Wifi className={`w-5 h-5 ${getConnectionStatusColor()}`} />
            <span className={`text-sm font-medium ${getConnectionStatusColor()}`}>
              {getConnectionStatusText()}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Total Symbols</p>
              <p className="text-2xl font-bold text-dark-text">{marketData?.totalSymbols || 0}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Gainers</p>
              <p className="text-2xl font-bold text-market-up">{marketData?.market_summary?.gainers || 0}</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-market-up" />
            </div>
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Losers</p>
              <p className="text-2xl font-bold text-market-down">{marketData?.market_summary?.losers || 0}</p>
            </div>
            <div className="p-3 bg-market-down/10 rounded-full">
              <TrendingDown className="w-6 h-6 text-market-down" />
            </div>
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Total Volume</p>
              <p className="text-2xl font-bold text-dark-text">
                {marketData?.market_summary?.total_volume ? 
                  (marketData.market_summary.total_volume / 1000000).toFixed(1) + 'M' : '0M'
                }
              </p>
            </div>
            <div className="p-3 bg-market-info/10 rounded-full">
              <Activity className="w-6 h-6 text-market-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MarketOverview data={marketData} />
        </div>
        
        <div className="space-y-6">
          <PerformanceMetrics />
          <RecentActivity />
        </div>
      </div>

      {/* Price Grid */}
      <div className="market-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-dark-text">Live Prices</h2>
          <div className="flex items-center space-x-2 text-sm text-dark-text-secondary">
            <div className="status-indicator status-online"></div>
            <span>Real-time updates</span>
          </div>
        </div>
        
        <div className="market-grid">
          {marketData?.symbols && Object.entries(marketData.symbols).map(([symbol, data]: [string, any]) => (
            <PriceCard
              key={symbol}
              symbol={symbol}
              data={data}
              isConnected={isConnected}
            />
          ))}
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus />

      {/* Quick Actions */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full btn-primary flex items-center justify-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
          
          <button className="w-full btn-secondary flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>View Alerts</span>
          </button>
          
          <button className="w-full btn-secondary flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
