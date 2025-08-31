import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Settings, 
  Download,
  RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart
} from 'recharts';
import { useWebSocket } from '../../hooks/useWebSocket';

interface PriceChartProps {
  symbol: string;
  timeframe: string;
}

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, timeframe }) => {
  const { isConnected, latency, isMockMode } = useWebSocket();
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const date = new Date(now - i * interval);
        
        mockData.push({
          timestamp: now - i * interval,
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume,
          date: date.toLocaleTimeString()
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-dark-text font-medium">{label}</p>
          <p className="text-market-up">High: ${data.high}</p>
          <p className="text-market-down">Low: ${data.low}</p>
          <p className="text-dark-text">Open: ${data.open}</p>
          <p className="text-dark-text">Close: ${data.close}</p>
          <p className="text-market-info">Volume: {formatVolume(data.volume)}</p>
        </div>
      );
    }
    return null;
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

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94A3B8"
                fontSize={12}
                tick={{ fill: '#94A3B8' }}
              />
              <YAxis 
                stroke="#94A3B8"
                fontSize={12}
                tick={{ fill: '#94A3B8' }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94A3B8"
                fontSize={12}
                tick={{ fill: '#94A3B8' }}
              />
              <YAxis 
                stroke="#94A3B8"
                fontSize={12}
                tick={{ fill: '#94A3B8' }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#3B82F6" 
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'candlestick':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94A3B8"
                fontSize={10}
                tick={{ fill: '#94A3B8' }}
              />
              <YAxis 
                stroke="#94A3B8"
                fontSize={10}
                tick={{ fill: '#94A3B8' }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              {showVolume && (
                <YAxis 
                  yAxisId={1}
                  orientation="right"
                  stroke="#3B82F6"
                  fontSize={10}
                  tick={{ fill: '#3B82F6' }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              
              {/* Candlestick wicks */}
              <Bar 
                dataKey="high" 
                fill="transparent" 
                stroke="#94A3B8" 
                strokeWidth={1}
                stackId="candlestick"
              />
              <Bar 
                dataKey="low" 
                fill="transparent" 
                stroke="#94A3B8" 
                strokeWidth={1}
                stackId="candlestick"
              />
              
              {/* Candlestick bodies */}
              <Bar 
                dataKey="close" 
                fill="#10B981"
                stroke="none"
                stackId="candlestick"
              />
              
              {/* Volume bars */}
              {showVolume && (
                <Bar 
                  dataKey="volume" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  yAxisId={1}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

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
            {showVolume ? <RefreshCw className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
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
            {isMockMode ? 'Simulated Mode' : 'Disconnected'}
          </div>
        )}
        
        {/* Real Chart */}
        <div className="bg-dark-bg-secondary rounded-lg p-4">
          {renderChart()}
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