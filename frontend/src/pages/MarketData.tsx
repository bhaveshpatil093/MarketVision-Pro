import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Clock,
  Activity
} from 'lucide-react';

import { useWebSocket } from '../hooks/useWebSocket';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import SymbolSearch from '../components/MarketData/SymbolSearch';
import PriceChart from '../components/MarketData/PriceChart';
import OrderBook from '../components/MarketData/OrderBook';
import TimeSales from '../components/MarketData/TimeSales';
import TechnicalIndicators from '../components/MarketData/TechnicalIndicators';

const MarketData: React.FC = () => {
  const { isConnected, latency } = useWebSocket();
  const { isOnline } = useConnectionStatus();
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('5m');
  const [viewMode, setViewMode] = useState<'chart' | 'orderbook' | 'timesales'>('chart');
  const [loading, setLoading] = useState(false);

  const timeframes = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '1d', label: '1d' }
  ];

  const viewModes = [
    { value: 'chart', label: 'Chart', icon: BarChart3 },
    { value: 'orderbook', label: 'Order Book', icon: Activity },
    { value: 'timesales', label: 'Time & Sales', icon: Clock }
  ];

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  };

  const handleTimeframeChange = (newTimeframe: typeof timeframe) => {
    setTimeframe(newTimeframe);
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  };

  const handleViewModeChange = (newViewMode: typeof viewMode) => {
    setViewMode(newViewMode);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting data for', selectedSymbol);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Market Data</h1>
          <p className="text-dark-text-secondary mt-2">
            Real-time market data, charts, and order book analysis
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

      {/* Symbol Search and Controls */}
      <div className="market-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-dark-text">Symbol Selection</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <SymbolSearch
          selectedSymbol={selectedSymbol}
          onSymbolChange={handleSymbolChange}
          isConnected={isConnected}
        />
      </div>

      {/* Timeframe Selection */}
      <div className="market-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-text">Timeframe</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-dark-text-secondary" />
            <span className="text-sm text-dark-text-secondary">Select interval</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {timeframes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleTimeframeChange(value as typeof timeframe)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeframe === value
                  ? 'bg-market-info text-white'
                  : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Selection */}
      <div className="market-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-text">View Mode</h3>
          <span className="text-sm text-dark-text-secondary">Choose your analysis view</span>
        </div>
        
        <div className="flex space-x-2">
          {viewModes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleViewModeChange(value as typeof viewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === value
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Technical Indicators */}
        <div className="lg:col-span-1">
          <TechnicalIndicators
            symbol={selectedSymbol}
            timeframe={timeframe}
            isConnected={isConnected}
          />
        </div>

        {/* Main Content - Chart/Order Book/Time & Sales */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="market-card">
              <div className="flex items-center justify-center h-96">
                <div className="loading-spinner w-8 h-8"></div>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'chart' && (
                <PriceChart
                  symbol={selectedSymbol}
                  timeframe={timeframe}
                  isConnected={isConnected}
                />
              )}
              
              {viewMode === 'orderbook' && (
                <OrderBook
                  symbol={selectedSymbol}
                  isConnected={isConnected}
                />
              )}
              
              {viewMode === 'timesales' && (
                <TimeSales
                  symbol={selectedSymbol}
                  isConnected={isConnected}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Market Summary */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Market Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-dark-bg-secondary rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-market-up" />
              <span className="text-sm font-medium text-dark-text-secondary">Gainers</span>
            </div>
            <div className="text-2xl font-bold text-market-up">1,234</div>
            <div className="text-xs text-dark-text-secondary">+5.2% from yesterday</div>
          </div>
          
          <div className="text-center p-4 bg-dark-bg-secondary rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingDown className="w-5 h-5 text-market-down" />
              <span className="text-sm font-medium text-dark-text-secondary">Losers</span>
            </div>
            <div className="text-2xl font-bold text-market-down">987</div>
            <div className="text-xs text-dark-text-secondary">-2.1% from yesterday</div>
          </div>
          
          <div className="text-center p-4 bg-dark-bg-secondary rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-market-info" />
              <span className="text-sm font-medium text-dark-text-secondary">Volume</span>
            </div>
            <div className="text-2xl font-bold text-dark-text">45.2B</div>
            <div className="text-xs text-dark-text-secondary">+12.3% from yesterday</div>
          </div>
        </div>
      </div>

      {/* Data Quality Indicators */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Data Quality</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
            <span className="text-sm text-dark-text-secondary">Data Freshness</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-market-up rounded-full"></div>
              <span className="text-sm font-medium text-market-up">Excellent</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
            <span className="text-sm text-dark-text-secondary">Missing Ticks</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-market-up rounded-full"></div>
              <span className="text-sm font-medium text-market-up">0.01%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
            <span className="text-sm text-dark-text-secondary">Latency</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-market-up rounded-full"></div>
              <span className="text-sm font-medium text-market-up">{latency}ms</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
            <span className="text-sm text-dark-text-secondary">Uptime</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-market-up rounded-full"></div>
              <span className="text-sm font-medium text-market-up">99.99%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketData;
