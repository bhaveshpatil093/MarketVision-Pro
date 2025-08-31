import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw,
  Settings,
  CheckCircle,
  Info,
  XCircle,
  BarChart3
} from 'lucide-react';

interface TechnicalIndicatorsProps {
  symbol: string;
  timeframe: string;
  isConnected: boolean;
}

interface Indicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral' | 'strong_buy' | 'strong_sell';
  previous: number;
  change: number;
  description: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume';
}

const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({ 
  symbol, 
  timeframe, 
  isConnected 
}) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trend' | 'momentum' | 'volatility' | 'volume'>('all');
  const [showSignals, setShowSignals] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate mock technical indicators
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockIndicators: Indicator[] = [
        // Trend Indicators
        {
          name: 'SMA (20)',
          value: 149.85,
          signal: 'neutral',
          previous: 149.72,
          change: 0.13,
          description: 'Simple Moving Average over 20 periods',
          category: 'trend'
        },
        {
          name: 'EMA (20)',
          value: 150.12,
          signal: 'buy',
          previous: 149.95,
          change: 0.17,
          description: 'Exponential Moving Average over 20 periods',
          category: 'trend'
        },
        {
          name: 'MACD',
          value: 0.45,
          signal: 'buy',
          previous: 0.32,
          change: 0.13,
          description: 'Moving Average Convergence Divergence',
          category: 'trend'
        },
        {
          name: 'Bollinger Upper',
          value: 152.30,
          signal: 'neutral',
          previous: 152.15,
          change: 0.15,
          description: 'Upper Bollinger Band',
          category: 'trend'
        },
        {
          name: 'Bollinger Lower',
          value: 147.60,
          signal: 'neutral',
          previous: 147.45,
          change: 0.15,
          description: 'Lower Bollinger Band',
          category: 'trend'
        },
        
        // Momentum Indicators
        {
          name: 'RSI (14)',
          value: 58.5,
          signal: 'neutral',
          previous: 55.2,
          change: 3.3,
          description: 'Relative Strength Index over 14 periods',
          category: 'momentum'
        },
        {
          name: 'Stochastic %K',
          value: 72.3,
          signal: 'sell',
          previous: 78.9,
          change: -6.6,
          description: 'Stochastic Oscillator %K',
          category: 'momentum'
        },
        {
          name: 'Williams %R',
          value: -28.5,
          signal: 'buy',
          previous: -35.2,
          change: 6.7,
          description: 'Williams %R Oscillator',
          category: 'momentum'
        },
        {
          name: 'CCI',
          value: 45.2,
          signal: 'neutral',
          previous: 38.7,
          change: 6.5,
          description: 'Commodity Channel Index',
          category: 'momentum'
        },
        
        // Volatility Indicators
        {
          name: 'ATR (14)',
          value: 2.85,
          signal: 'neutral',
          previous: 2.72,
          change: 0.13,
          description: 'Average True Range over 14 periods',
          category: 'volatility'
        },
        {
          name: 'Bollinger Width',
          value: 4.70,
          signal: 'neutral',
          previous: 4.65,
          change: 0.05,
          description: 'Bollinger Band Width',
          category: 'volatility'
        },
        
        // Volume Indicators
        {
          name: 'OBV',
          value: 1250000,
          signal: 'buy',
          previous: 1180000,
          change: 70000,
          description: 'On-Balance Volume',
          category: 'volume'
        },
        {
          name: 'VWAP',
          value: 150.28,
          signal: 'neutral',
          previous: 150.15,
          change: 0.13,
          description: 'Volume Weighted Average Price',
          category: 'volume'
        },
        {
          name: 'Volume SMA',
          value: 450000,
          signal: 'neutral',
          previous: 445000,
          change: 5000,
          description: 'Volume Simple Moving Average',
          category: 'volume'
        }
      ];
      
      setIndicators(mockIndicators);
      setLoading(false);
    }, 1000);
  }, [symbol, timeframe]);

  // Auto-refresh indicators
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const interval = setInterval(() => {
      setIndicators(prev => prev.map(indicator => ({
        ...indicator,
        value: indicator.value + (Math.random() - 0.5) * 0.1,
        previous: indicator.value,
        change: (Math.random() - 0.5) * 0.2
      })));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, isConnected]);

  const filteredIndicators = indicators.filter(indicator => {
    if (selectedCategory === 'all') return true;
    return indicator.category === selectedCategory;
  });

  const getSignalIcon = (signal: Indicator['signal']) => {
    switch (signal) {
      case 'strong_buy':
        return <CheckCircle className="w-4 h-4 text-market-up" />;
      case 'buy':
        return <TrendingUp className="w-4 h-4 text-market-up" />;
      case 'neutral':
        return <Info className="w-4 h-4 text-dark-text-secondary" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-market-down" />;
      case 'strong_sell':
        return <XCircle className="w-4 h-4 text-market-down" />;
      default:
        return <Info className="w-4 h-4 text-dark-text-secondary" />;
    }
  };

  const getSignalColor = (signal: Indicator['signal']) => {
    switch (signal) {
      case 'strong_buy':
      case 'buy':
        return 'text-market-up';
      case 'neutral':
        return 'text-dark-text-secondary';
      case 'sell':
      case 'strong_sell':
        return 'text-market-down';
      default:
        return 'text-dark-text-secondary';
    }
  };

  const getSignalBgColor = (signal: Indicator['signal']) => {
    switch (signal) {
      case 'strong_buy':
      case 'buy':
        return 'bg-market-up/10';
      case 'neutral':
        return 'bg-dark-text-secondary/10';
      case 'sell':
      case 'strong_sell':
        return 'bg-market-down/10';
      default:
        return 'bg-dark-text-secondary/10';
    }
  };

  const getChangeColor = (change: number) => {
    if (change === 0) return 'text-dark-text-secondary';
    return change > 0 ? 'text-market-up' : 'text-market-down';
  };

  const formatValue = (value: number, name: string) => {
    if (name.includes('Volume') || name === 'OBV') {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      return value.toString();
    }
    return value.toFixed(2);
  };

  const getSignalSummary = () => {
    const buySignals = indicators.filter(i => i.signal === 'buy' || i.signal === 'strong_buy').length;
    const sellSignals = indicators.filter(i => i.signal === 'sell' || i.signal === 'strong_sell').length;
    const neutralSignals = indicators.filter(i => i.signal === 'neutral').length;
    
    if (buySignals > sellSignals) return 'Bullish';
    if (sellSignals > buySignals) return 'Bearish';
    return 'Neutral';
  };

  const getSignalSummaryColor = (summary: string) => {
    switch (summary) {
      case 'Bullish':
        return 'text-market-up';
      case 'Bearish':
        return 'text-market-down';
      default:
        return 'text-dark-text-secondary';
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const categories = [
    { value: 'all', label: 'All', count: indicators.length },
    { value: 'trend', label: 'Trend', count: indicators.filter(i => i.category === 'trend').length },
    { value: 'momentum', label: 'Momentum', count: indicators.filter(i => i.category === 'momentum').length },
    { value: 'volatility', label: 'Volatility', count: indicators.filter(i => i.category === 'volatility').length },
    { value: 'volume', label: 'Volume', count: indicators.filter(i => i.category === 'volume').length }
  ];

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
    <div className="market-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-dark-text">Technical Indicators</h3>
          <p className="text-sm text-dark-text-secondary">{symbol} • {timeframe}</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh ? 'bg-market-info/20 text-market-info' : 'bg-dark-bg-secondary text-dark-text-secondary'
            }`}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <Activity className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80 transition-colors"
            title="Refresh indicators"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button className="p-2 rounded-lg bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Signal Summary */}
      <div className="mb-6 p-4 bg-dark-bg-secondary rounded-lg">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getSignalSummaryColor(getSignalSummary())}`}>
            {getSignalSummary()}
          </div>
          <div className="text-sm text-dark-text-secondary">Overall Signal</div>
          
          <div className="flex items-center justify-center space-x-6 mt-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-market-up rounded-full"></div>
              <span className="text-market-up">
                {indicators.filter(i => i.signal === 'buy' || i.signal === 'strong_buy').length} Buy
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-market-down rounded-full"></div>
              <span className="text-market-down">
                {indicators.filter(i => i.signal === 'sell' || i.signal === 'strong_sell').length} Sell
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-dark-text-secondary rounded-full"></div>
              <span className="text-dark-text-secondary">
                {indicators.filter(i => i.signal === 'neutral').length} Neutral
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-1 mb-4 p-1 bg-dark-bg-secondary rounded-lg">
        {categories.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setSelectedCategory(value as typeof selectedCategory)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedCategory === value
                ? 'bg-market-info text-white'
                : 'text-dark-text-secondary hover:text-dark-text'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Display Options */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center space-x-2 text-sm text-dark-text-secondary">
          <input
            type="checkbox"
            checked={showSignals}
            onChange={(e) => setShowSignals(e.target.checked)}
            className="rounded border-dark-border text-market-info focus:ring-market-info"
          />
          <span>Show signals</span>
        </label>
      </div>

      {/* Indicators List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredIndicators.length === 0 ? (
          <div className="text-center py-8 text-dark-text-secondary">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No indicators found</p>
          </div>
        ) : (
          filteredIndicators.map((indicator) => (
            <div
              key={indicator.name}
              className={`p-3 rounded-lg border-l-4 transition-all duration-200 cursor-pointer hover:bg-dark-bg-secondary ${
                getSignalBgColor(indicator.signal)
              }`}
              style={{ borderLeftColor: getSignalColor(indicator.signal).replace('text-', '') }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {showSignals && getSignalIcon(indicator.signal)}
                  <span className="font-medium text-dark-text">{indicator.name}</span>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-dark-text">
                    {formatValue(indicator.value, indicator.name)}
                  </div>
                  <div className={`text-xs ${getChangeColor(indicator.change)}`}>
                    {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-dark-text-secondary">
                {indicator.description}
              </div>
              
              {showSignals && (
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${getSignalBgColor(indicator.signal)} ${getSignalColor(indicator.signal)}`}>
                    {indicator.signal.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  <span className="text-xs text-dark-text-secondary">
                    {indicator.category}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-dark-border">
        <div className="flex items-center justify-between text-sm text-dark-text-secondary">
          <span>{filteredIndicators.length} indicators</span>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-market-up' : 'bg-market-down'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicators;
