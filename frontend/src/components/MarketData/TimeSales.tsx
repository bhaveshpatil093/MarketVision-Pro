import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RefreshCw,
  Settings,
  Download,
  Clock
} from 'lucide-react';

interface TimeSalesProps {
  symbol: string;
  isConnected: boolean;
}

interface Trade {
  id: string;
  timestamp: number;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  exchange: string;
  condition: string;
  priceChange: number;
}

const TimeSales: React.FC<TimeSalesProps> = ({ symbol, isConnected }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [maxTrades, setMaxTrades] = useState(100);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showConditions, setShowConditions] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate mock trade data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockTrades: Trade[] = [];
      const now = Date.now();
      const basePrice = 150.45;
      
      for (let i = 0; i < maxTrades; i++) {
        const timestamp = now - i * 1000; // 1 second intervals
        const price = basePrice + (Math.random() - 0.5) * 2;
        const size = Math.floor(Math.random() * 10000) + 100;
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const exchanges = ['NYSE', 'NASDAQ', 'ARCA', 'BATS'];
        const conditions = ['Regular', 'Cash', 'NextDay', 'Seller'];
        
        mockTrades.push({
          id: `trade_${i}`,
          timestamp,
          price: parseFloat(price.toFixed(2)),
          size,
          side,
          exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          priceChange: parseFloat((price - basePrice).toFixed(2))
        });
      }
      
      setTrades(mockTrades);
      setLoading(false);
    }, 1000);
  }, [symbol, maxTrades]);

  // Auto-refresh trades
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const interval = setInterval(() => {
      // Add new trade
      const newTrade: Trade = {
        id: `trade_${Date.now()}`,
        timestamp: Date.now(),
        price: 150.45 + (Math.random() - 0.5) * 2,
        size: Math.floor(Math.random() * 10000) + 100,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        exchange: ['NYSE', 'NASDAQ', 'ARCA', 'BATS'][Math.floor(Math.random() * 4)],
        condition: ['Regular', 'Cash', 'NextDay', 'Seller'][Math.floor(Math.random() * 4)],
        priceChange: parseFloat((Math.random() - 0.5 * 4).toFixed(2))
      };
      
      setTrades(prev => [newTrade, ...prev.slice(0, maxTrades - 1)]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, maxTrades]);

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    return trade.side === filter;
  });

  const formatSize = (size: number) => {
    if (size >= 1000000) {
      return (size / 1000000).toFixed(1) + 'M';
    } else if (size >= 1000) {
      return (size / 1000).toFixed(1) + 'K';
    }
    return size.toString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getChangeColor = (change: number) => {
    if (change === 0) return 'text-dark-text-secondary';
    return change > 0 ? 'text-market-up' : 'text-market-down';
  };

  const getSideColor = (side: 'buy' | 'sell') => {
    return side === 'buy' ? 'text-market-up' : 'text-market-down';
  };

  const getSideBgColor = (side: 'buy' | 'sell') => {
    return side === 'buy' ? 'bg-market-up/10' : 'bg-market-down/10';
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Regular':
        return 'text-market-info';
      case 'Cash':
        return 'text-market-up';
      case 'NextDay':
        return 'text-market-alert';
      case 'Seller':
        return 'text-market-down';
      default:
        return 'text-dark-text-secondary';
    }
  };

  const getTradeStats = () => {
    const buyTrades = trades.filter(t => t.side === 'buy');
    const sellTrades = trades.filter(t => t.side === 'sell');
    
    return {
      totalTrades: trades.length,
      buyTrades: buyTrades.length,
      sellTrades: sellTrades.length,
      totalVolume: trades.reduce((sum, t) => sum + t.size, 0),
      buyVolume: buyTrades.reduce((sum, t) => sum + t.size, 0),
      sellVolume: sellTrades.reduce((sum, t) => sum + t.size, 0),
      avgPrice: trades.reduce((sum, t) => sum + t.price, 0) / trades.length
    };
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const stats = getTradeStats();

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-dark-text">{symbol} Time & Sales</h3>
          <p className="text-sm text-dark-text-secondary">Real-time trade data</p>
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
            title="Refresh trades"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button className="p-2 rounded-lg bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          
          <button className="p-2 rounded-lg bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Trade Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Total Trades</div>
          <div className="text-xl font-bold text-dark-text">
            {stats.totalTrades.toLocaleString()}
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Buy/Sell Ratio</div>
          <div className="text-xl font-bold text-dark-text">
            {(stats.buyTrades / stats.totalTrades * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Total Volume</div>
          <div className="text-xl font-bold text-dark-text">
            {formatSize(stats.totalVolume)}
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Avg Price</div>
          <div className="text-xl font-bold text-dark-text">
            ${stats.avgPrice.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Side Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-dark-text-secondary">Filter:</span>
            <div className="flex space-x-1">
              {[
                { value: 'all', label: 'All', color: 'text-dark-text' },
                { value: 'buy', label: 'Buy', color: 'text-market-up' },
                { value: 'sell', label: 'Sell', color: 'text-market-down' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as typeof filter)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filter === value
                      ? 'bg-market-info text-white'
                      : 'bg-dark-bg-secondary text-dark-text-secondary hover:bg-dark-bg-secondary/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Max Trades */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-dark-text-secondary">Max Trades:</span>
            <select
              value={maxTrades}
              onChange={(e) => setMaxTrades(Number(e.target.value))}
              className="bg-dark-bg-secondary border border-dark-border rounded px-2 py-1 text-sm text-dark-text"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>
        
        {/* Display Options */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-dark-text-secondary">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-dark-border text-market-info focus:ring-market-info"
            />
            <span>Auto-scroll</span>
          </label>
          
          <label className="flex items-center space-x-2 text-sm text-dark-text-secondary">
            <input
              type="checkbox"
              checked={showConditions}
              onChange={(e) => setShowConditions(e.target.checked)}
              className="rounded border-dark-border text-market-info focus:ring-market-info"
            />
            <span>Show conditions</span>
          </label>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-dark-bg-secondary rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 p-3 bg-dark-bg border-b border-dark-border text-sm font-medium text-dark-text-secondary">
          <div>Time</div>
          <div>Price</div>
          <div>Size</div>
          <div>Side</div>
          <div>Exchange</div>
          {showConditions && <div>Condition</div>}
          <div>Change</div>
        </div>
        
        {/* Table Body */}
        <div className="max-h-96 overflow-y-auto">
          {filteredTrades.length === 0 ? (
            <div className="text-center py-8 text-dark-text-secondary">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No trades found</p>
            </div>
          ) : (
            filteredTrades.map((trade) => (
              <div
                key={trade.id}
                className={`grid grid-cols-7 gap-4 p-3 border-b border-dark-border/20 hover:bg-dark-bg/50 transition-colors ${
                  trade.side === 'buy' ? 'border-l-4 border-l-market-up/50' : 'border-l-4 border-l-market-down/50'
                }`}
              >
                <div className="text-sm text-dark-text-secondary font-mono">
                  {formatTime(trade.timestamp)}
                </div>
                
                <div className="font-mono font-semibold text-dark-text">
                  ${trade.price.toFixed(2)}
                </div>
                
                <div className="font-mono text-dark-text">
                  {formatSize(trade.size)}
                </div>
                
                <div className={`font-medium ${getSideColor(trade.side)}`}>
                  {trade.side.toUpperCase()}
                </div>
                
                <div className="text-sm text-dark-text-secondary">
                  {trade.exchange}
                </div>
                
                {showConditions && (
                  <div className={`text-sm ${getConditionColor(trade.condition)}`}>
                    {trade.condition}
                  </div>
                )}
                
                <div className={`font-mono text-sm ${getChangeColor(trade.priceChange)}`}>
                  {trade.priceChange > 0 ? '+' : ''}{trade.priceChange.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Volume Analysis */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-dark-bg-secondary rounded-lg">
          <h4 className="font-semibold text-dark-text mb-3">Volume by Side</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-text-secondary">Buy Volume</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-dark-bg rounded-full h-2">
                  <div 
                    className="bg-market-up h-2 rounded-full"
                    style={{ width: `${(stats.buyVolume / stats.totalVolume) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-market-up">
                  {formatSize(stats.buyVolume)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-text-secondary">Sell Volume</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-dark-bg rounded-full h-2">
                  <div 
                    className="bg-market-down h-2 rounded-full"
                    style={{ width: `${(stats.sellVolume / stats.totalVolume) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-market-down">
                  {formatSize(stats.sellVolume)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-dark-bg-secondary rounded-lg">
          <h4 className="font-semibold text-dark-text mb-3">Trade Distribution</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-text-secondary">Buy Trades</span>
              <span className="text-sm font-medium text-market-up">
                {stats.buyTrades} ({(stats.buyTrades / stats.totalTrades * 100).toFixed(1)}%)
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-text-secondary">Sell Trades</span>
              <span className="text-sm font-medium text-market-down">
                {stats.sellTrades} ({(stats.sellTrades / stats.totalTrades * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mt-6 pt-4 border-t border-dark-border">
        <div className="flex items-center justify-between text-sm text-dark-text-secondary">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-market-up' : 'bg-market-down'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <span>
            {autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'} • {filteredTrades.length} trades shown
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeSales;
