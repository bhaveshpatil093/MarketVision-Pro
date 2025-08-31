import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface PriceChartProps {
  symbol: string;
  timeframe: string;
  isConnected: boolean;
}

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, timeframe, isConnected }) => {
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(true);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');

  // Generate mock candlestick data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockData: CandleData[] = [];
      const now = Date.now();
      const interval = getTimeframeInterval(timeframe);
      
      for (let i = 100; i >= 0; i--) {
        const basePrice = 150 + Math.sin(i * 0.1) * 10;
        const volatility = 2;
        
        const open = basePrice + (Math.random() - 0.5) * volatility;
        const close = basePrice + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;
        const volume = Math.floor(Math.random() * 1000000) + 100000;
        
        mockData.push({
          timestamp: now - i * interval,
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume
        });
      }
      
      setChartData(mockData);
      setLoading(false);
    }, 1000);
  }, [symbol, timeframe]);

  const getTimeframeInterval = (tf: string): number => {
    switch (tf) {
      case '1m': return 60 * 1000;
      case '5m': return 5 * 60 * 1000;
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '1d': return 24 * 60 * 60 * 1000;
      default: return 5 * 60 * 1000;
    }
  };

  const getLatestPrice = (): CandleData | null => {
    return chartData.length > 0 ? chartData[chartData.length - 1] : null;
  };

  const getPriceChange = (): { change: number; changePercent: number } => {
    if (chartData.length < 2) return { change: 0, changePercent: 0 };
    
    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    
    const change = latest.close - previous.close;
    const changePercent = (change / previous.close) * 100;
    
    return {
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };
  };

  const getChangeColor = (change: number) => {
    if (change === 0) return 'text-dark-text-secondary';
    return change > 0 ? 'text-market-up' : 'text-market-down';
  };

  const getChangeBgColor = (change: number) => {
    if (change === 0) return 'bg-dark-text-secondary/10';
    return change > 0 ? 'bg-market-up/10' : 'bg-market-down/10';
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  };

  const latestPrice = getLatestPrice();
  const priceChange = getPriceChange();

  if (loading) {
    return (
      <div className="market-card">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="market-card">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-xl font-semibold text-dark-text">{symbol} Chart</h3>
            <p className="text-sm text-dark-text-secondary">{timeframe} timeframe</p>
          </div>
          
          {/* Price Display */}
          {latestPrice && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-dark-text">
                  ${latestPrice.close.toFixed(2)}
                </div>
                <div className={`text-sm ${getChangeColor(priceChange.change)}`}>
                  {priceChange.change > 0 ? '+' : ''}{priceChange.change.toFixed(2)} ({priceChange.changePercent > 0 ? '+' : ''}{priceChange.changePercent.toFixed(2)}%)
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full ${getChangeBgColor(priceChange.change)}`}>
                <div className={`text-sm font-medium ${getChangeColor(priceChange.change)}`}>
                  {priceChange.change > 0 ? '↗' : priceChange.change < 0 ? '↘' : '→'}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Chart Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`p-2 rounded-lg transition-colors ${
              showVolume ? 'bg-market-info/20 text-market-info' : 'bg-dark-bg-secondary text-dark-text-secondary'
            }`}
            title={showVolume ? 'Hide Volume' : 'Show Volume'}
          >
            {showVolume ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`p-2 rounded-lg transition-colors ${
              showIndicators ? 'bg-market-info/20 text-market-info' : 'bg-dark-bg-secondary text-dark-text-secondary'
            }`}
            title={showIndicators ? 'Hide Indicators' : 'Show Indicators'}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          
          <button className="p-2 rounded-lg bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          
          <button className="p-2 rounded-lg bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex space-x-2 mb-4">
        {[
          { value: 'candlestick', label: 'Candlestick' },
          { value: 'line', label: 'Line' },
          { value: 'area', label: 'Area' }
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setChartType(value as typeof chartType)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === value
                ? 'bg-market-info text-white'
                : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Connection Status Overlay */}
        {!isConnected && (
          <div className="absolute top-4 right-4 z-10 bg-market-down/90 text-white px-3 py-1 rounded-lg text-sm">
            Disconnected
          </div>
        )}
        
        {/* Chart Placeholder */}
        <div className="bg-dark-bg-secondary rounded-lg p-8 text-center">
          <div className="w-full h-96 bg-gradient-to-br from-dark-bg-secondary to-dark-bg rounded-lg border border-dark-border relative overflow-hidden">
            {/* Mock Candlestick Chart */}
            <div className="absolute inset-0 p-4">
              <div className="flex items-end justify-between h-full space-x-1">
                {chartData.slice(-20).map((candle, index) => {
                  const isUp = candle.close >= candle.open;
                  const height = Math.abs(candle.close - candle.open) * 10;
                  const maxHeight = 100;
                  const normalizedHeight = Math.min(height, maxHeight);
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-1">
                      {/* Wick */}
                      <div className={`w-0.5 h-8 ${isUp ? 'bg-market-up' : 'bg-market-down'}`}></div>
                      
                      {/* Body */}
                      <div 
                        className={`w-3 rounded-sm ${
                          isUp ? 'bg-market-up' : 'bg-market-down'
                        }`}
                        style={{ height: `${normalizedHeight}px` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Volume Bars */}
            {showVolume && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-dark-bg/50">
                <div className="flex items-end justify-between h-full space-x-1 px-4 pb-2">
                  {chartData.slice(-20).map((candle, index) => {
                    const volumeHeight = (candle.volume / 1000000) * 50;
                    return (
                      <div
                        key={index}
                        className="w-3 bg-market-info/30 rounded-sm"
                        style={{ height: `${volumeHeight}px` }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Technical Indicators Overlay */}
            {showIndicators && (
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-market-up/20 text-market-up px-2 py-1 rounded text-xs">
                  SMA(20): ${(chartData.slice(-20).reduce((sum, c) => sum + c.close, 0) / 20).toFixed(2)}
                </div>
                <div className="bg-market-alert/20 text-market-alert px-2 py-1 rounded text-xs">
                  RSI: {(Math.random() * 40 + 30).toFixed(1)}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-dark-text-secondary">
            <p className="text-sm">Interactive chart with {chartData.length} data points</p>
            <p className="text-xs mt-1">
              {showVolume && 'Volume bars enabled'} • {showIndicators && 'Technical indicators visible'}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">High</div>
          <div className="font-semibold text-dark-text">
            ${Math.max(...chartData.map(c => c.high)).toFixed(2)}
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Low</div>
          <div className="font-semibold text-dark-text">
            ${Math.min(...chartData.map(c => c.low)).toFixed(2)}
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Avg Volume</div>
          <div className="font-semibold text-dark-text">
            {formatVolume(Math.floor(chartData.reduce((sum, c) => sum + c.volume, 0) / chartData.length))}
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Volatility</div>
          <div className="font-semibold text-dark-text">
            {((Math.max(...chartData.map(c => c.high)) - Math.min(...chartData.map(c => c.low))) / Math.min(...chartData.map(c => c.low)) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="mt-6 pt-4 border-t border-dark-border">
        <div className="flex items-center justify-between text-sm text-dark-text-secondary">
          <span>Last updated: {latestPrice ? new Date(latestPrice.timestamp).toLocaleTimeString() : 'N/A'}</span>
          <span>Data points: {chartData.length}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
