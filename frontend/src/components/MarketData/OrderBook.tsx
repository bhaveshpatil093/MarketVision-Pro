import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw,
  Settings,
  Download
} from 'lucide-react';

interface OrderBookProps {
  symbol: string;
  isConnected: boolean;
}

interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  orders: number;
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol, isConnected }) => {
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    spread: number;
    spreadPercent: number;
    lastPrice: number;
    lastChange: number;
  }>({
    bids: [],
    asks: [],
    spread: 0,
    spreadPercent: 0,
    lastPrice: 0,
    lastChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [depth, setDepth] = useState(10);
  const [showCumulative, setShowCumulative] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Generate mock order book data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const basePrice = 150.45;
      const lastPrice = basePrice + (Math.random() - 0.5) * 2;
      const lastChange = (Math.random() - 0.5) * 4;
      
      const bids: OrderBookLevel[] = [];
      const asks: OrderBookLevel[] = [];
      
      // Generate bid levels (below last price)
      for (let i = 0; i < depth; i++) {
        const price = lastPrice - (i + 1) * 0.01;
        const size = Math.floor(Math.random() * 10000) + 100;
        const orders = Math.floor(Math.random() * 50) + 1;
        
        bids.push({
          price: parseFloat(price.toFixed(2)),
          size,
          total: i === 0 ? size : bids[i - 1].total + size,
          orders
        });
      }
      
      // Generate ask levels (above last price)
      for (let i = 0; i < depth; i++) {
        const price = lastPrice + (i + 1) * 0.01;
        const size = Math.floor(Math.random() * 10000) + 100;
        const orders = Math.floor(Math.random() * 50) + 1;
        
        asks.push({
          price: parseFloat(price.toFixed(2)),
          size,
          total: i === 0 ? size : asks[i - 1].total + size,
          orders
        });
      }
      
      const spread = asks[0].price - bids[0].price;
      const spreadPercent = (spread / lastPrice) * 100;
      
      setOrderBook({
        bids: bids.reverse(), // Show highest bid first
        asks,
        spread: parseFloat(spread.toFixed(4)),
        spreadPercent: parseFloat(spreadPercent.toFixed(4)),
        lastPrice: parseFloat(lastPrice.toFixed(2)),
        lastChange: parseFloat(lastChange.toFixed(2))
      });
      
      setLoading(false);
    }, 1000);
  }, [symbol, depth]);

  // Auto-refresh order book
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;
    
    const interval = setInterval(() => {
      // Simulate real-time updates
      setOrderBook(prev => ({
        ...prev,
        bids: prev.bids.map(bid => ({
          ...bid,
          size: bid.size + Math.floor((Math.random() - 0.5) * 100),
          orders: bid.orders + Math.floor((Math.random() - 0.5) * 5)
        })),
        asks: prev.asks.map(ask => ({
          ...ask,
          size: ask.size + Math.floor((Math.random() - 0.5) * 100),
          orders: ask.orders + Math.floor((Math.random() - 0.5) * 5)
        }))
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, isConnected]);

  const formatSize = (size: number) => {
    if (size >= 1000000) {
      return (size / 1000000).toFixed(1) + 'M';
    } else if (size >= 1000) {
      return (size / 1000).toFixed(1) + 'K';
    }
    return size.toString();
  };

  const getChangeColor = (change: number) => {
    if (change === 0) return 'text-dark-text-secondary';
    return change > 0 ? 'text-market-up' : 'text-market-down';
  };

  const getChangeBgColor = (change: number) => {
    if (change === 0) return 'bg-dark-text-secondary/10';
    return change > 0 ? 'bg-market-up/10' : 'bg-market-down/10';
  };

  const getMaxTotal = () => {
    const maxBid = Math.max(...orderBook.bids.map(b => b.total));
    const maxAsk = Math.max(...orderBook.asks.map(a => a.total));
    return Math.max(maxBid, maxAsk);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

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
          <h3 className="text-xl font-semibold text-dark-text">{symbol} Order Book</h3>
          <p className="text-sm text-dark-text-secondary">Real-time market depth</p>
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
            title="Refresh order book"
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

      {/* Market Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Last Price</div>
          <div className="text-xl font-bold text-dark-text">
            ${orderBook.lastPrice.toFixed(2)}
          </div>
          <div className={`text-sm ${getChangeColor(orderBook.lastChange)}`}>
            {orderBook.lastChange > 0 ? '+' : ''}{orderBook.lastChange.toFixed(2)}
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Spread</div>
          <div className="text-xl font-bold text-dark-text">
            ${orderBook.spread.toFixed(4)}
          </div>
          <div className="text-sm text-dark-text-secondary">
            {orderBook.spreadPercent.toFixed(4)}%
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Bid Volume</div>
          <div className="text-xl font-bold text-market-up">
            {formatSize(orderBook.bids.reduce((sum, b) => sum + b.size, 0))}
          </div>
        </div>
        
        <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
          <div className="text-sm text-dark-text-secondary mb-1">Ask Volume</div>
          <div className="text-xl font-bold text-market-down">
            {formatSize(orderBook.asks.reduce((sum, a) => sum + a.size, 0))}
          </div>
        </div>
      </div>

      {/* Depth Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-dark-text-secondary">Depth:</span>
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="bg-dark-bg-secondary border border-dark-border rounded px-2 py-1 text-sm text-dark-text"
          >
            <option value={5}>5 levels</option>
            <option value={10}>10 levels</option>
            <option value={20}>20 levels</option>
            <option value={50}>50 levels</option>
          </select>
        </div>
        
        <label className="flex items-center space-x-2 text-sm text-dark-text-secondary">
          <input
            type="checkbox"
            checked={showCumulative}
            onChange={(e) => setShowCumulative(e.target.checked)}
            className="rounded border-dark-border text-market-info focus:ring-market-info"
          />
          <span>Show cumulative</span>
        </label>
      </div>

      {/* Order Book Table */}
      <div className="grid grid-cols-2 gap-6">
        {/* Asks (Sell Orders) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-market-down">Asks (Sell)</h4>
            <div className="text-xs text-dark-text-secondary">
              Price | Size | Orders
            </div>
          </div>
          
          <div className="space-y-1">
            {orderBook.asks.map((ask, index) => {
              const totalPercent = (ask.total / getMaxTotal()) * 100;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-bg-secondary transition-colors cursor-pointer group"
                >
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-mono text-market-down font-semibold">
                      ${ask.price.toFixed(2)}
                    </span>
                    <span className="font-mono text-dark-text">
                      {formatSize(ask.size)}
                    </span>
                    <span className="text-sm text-dark-text-secondary">
                      {ask.orders}
                    </span>
                  </div>
                  
                  {/* Cumulative volume bar */}
                  {showCumulative && (
                    <div className="absolute right-0 top-0 bottom-0 bg-market-down/10 rounded-r-lg transition-all duration-200 group-hover:bg-market-down/20"
                         style={{ width: `${totalPercent}%` }}>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-market-up">Bids (Buy)</h4>
            <div className="text-xs text-dark-text-secondary">
              Price | Size | Orders
            </div>
          </div>
          
          <div className="space-y-1">
            {orderBook.bids.map((bid, index) => {
              const totalPercent = (bid.total / getMaxTotal()) * 100;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-dark-bg-secondary transition-colors cursor-pointer group"
                >
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-mono text-market-up font-semibold">
                      ${bid.price.toFixed(2)}
                    </span>
                    <span className="font-mono text-dark-text">
                      {formatSize(bid.size)}
                    </span>
                    <span className="text-sm text-dark-text-secondary">
                      {bid.orders}
                    </span>
                  </div>
                  
                  {/* Cumulative volume bar */}
                  {showCumulative && (
                    <div className="absolute left-0 top-0 bottom-0 bg-market-up/10 rounded-l-lg transition-all duration-200 group-hover:bg-market-up/20"
                         style={{ width: `${totalPercent}%` }}>
                    </div>
                  )}
                </div>
              );
            })}
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
            {autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
