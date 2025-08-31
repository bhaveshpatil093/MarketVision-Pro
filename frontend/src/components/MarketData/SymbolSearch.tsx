import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SymbolSearchProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
  isConnected: boolean;
}

interface SymbolData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  direction: 'up' | 'down' | 'unchanged';
}

const SymbolSearch: React.FC<SymbolSearchProps> = ({ 
  selectedSymbol, 
  onSymbolChange, 
  isConnected 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredSymbols, setFilteredSymbols] = useState<SymbolData[]>([]);
  const [recentSymbols, setRecentSymbols] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock popular symbols data
  const popularSymbols: SymbolData[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 150.45, change: 2.15, change_percent: 1.45, volume: 45678900, direction: 'up' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 280.12, change: -1.88, change_percent: -0.67, volume: 23456700, direction: 'down' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2450.00, change: 15.50, change_percent: 0.64, volume: 12345600, direction: 'up' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 800.55, change: -25.45, change_percent: -3.08, volume: 34567800, direction: 'down' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3200.75, change: 45.25, change_percent: 1.43, volume: 5678900, direction: 'up' },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 180.25, change: 3.75, change_percent: 2.12, volume: 34567800, direction: 'up' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 450.80, change: -12.30, change_percent: -2.66, volume: 23456700, direction: 'down' },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 320.45, change: 8.90, change_percent: 2.86, volume: 12345600, direction: 'up' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 420.15, change: 2.85, change_percent: 0.68, volume: 56789000, direction: 'up' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 380.90, change: -1.20, change_percent: -0.31, volume: 34567800, direction: 'down' }
  ];

  // Load recent symbols from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSymbols');
    if (saved) {
      setRecentSymbols(JSON.parse(saved));
    }
  }, []);

  // Save recent symbols to localStorage
  const saveRecentSymbol = (symbol: string) => {
    const updated = [symbol, ...recentSymbols.filter(s => s !== symbol)].slice(0, 5);
    setRecentSymbols(updated);
    localStorage.setItem('recentSymbols', JSON.stringify(updated));
  };

  // Filter symbols based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSymbols([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = popularSymbols.filter(symbol => 
      symbol.symbol.toLowerCase().includes(query) ||
      symbol.name.toLowerCase().includes(query)
    );
    setFilteredSymbols(filtered);
  }, [searchQuery]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSymbolSelect = (symbol: string) => {
    onSymbolChange(symbol);
    saveRecentSymbol(symbol);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchFocus = () => {
    setIsSearchOpen(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredSymbols([]);
  };

  const getDirectionIcon = (direction: 'up' | 'down' | 'unchanged') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-market-up" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-market-down" />;
      default:
        return <Minus className="w-4 h-4 text-dark-text-secondary" />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change === 0) return 'text-dark-text-secondary';
    return change > 0 ? 'text-market-up' : 'text-market-down';
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-dark-text-secondary" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleSearchFocus}
          placeholder="Search symbols (e.g., AAPL, MSFT)..."
          className="w-full pl-10 pr-10 py-3 bg-dark-bg-secondary border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-market-info focus:border-transparent transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-dark-text-secondary hover:text-dark-text transition-colors" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isSearchOpen && (
        <div className="absolute z-50 w-full mt-2 bg-dark-bg border border-dark-border rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {/* Recent Symbols */}
          {recentSymbols.length > 0 && searchQuery === '' && (
            <div className="p-3 border-b border-dark-border">
              <div className="text-sm font-medium text-dark-text-secondary mb-2">Recent</div>
              <div className="space-y-2">
                {recentSymbols.map(symbol => {
                  const symbolData = popularSymbols.find(s => s.symbol === symbol);
                  if (!symbolData) return null;
                  
                  return (
                    <button
                      key={symbol}
                      onClick={() => handleSymbolSelect(symbol)}
                      className="w-full flex items-center justify-between p-2 hover:bg-dark-bg-secondary rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        {getDirectionIcon(symbolData.direction)}
                        <div>
                          <div className="font-semibold text-dark-text">{symbol}</div>
                          <div className="text-sm text-dark-text-secondary">{symbolData.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-dark-text">${symbolData.price.toFixed(2)}</div>
                        <div className={`text-sm ${getChangeColor(symbolData.change)}`}>
                          {symbolData.change > 0 ? '+' : ''}{symbolData.change.toFixed(2)} ({symbolData.change_percent.toFixed(2)}%)
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="p-3">
              <div className="text-sm font-medium text-dark-text-secondary mb-2">
                Search Results ({filteredSymbols.length})
              </div>
              {filteredSymbols.length === 0 ? (
                <div className="text-center py-4 text-dark-text-secondary">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No symbols found</p>
                  <p className="text-xs">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSymbols.map(symbolData => (
                    <button
                      key={symbolData.symbol}
                      onClick={() => handleSymbolSelect(symbolData.symbol)}
                      className="w-full flex items-center justify-between p-2 hover:bg-dark-bg-secondary rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        {getDirectionIcon(symbolData.direction)}
                        <div>
                          <div className="font-semibold text-dark-text">{symbolData.symbol}</div>
                          <div className="text-sm text-dark-text-secondary">{symbolData.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-dark-text">${symbolData.price.toFixed(2)}</div>
                        <div className={`text-sm ${getChangeColor(symbolData.change)}`}>
                          {symbolData.change > 0 ? '+' : ''}{symbolData.change.toFixed(2)} ({symbolData.change_percent.toFixed(2)}%)
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Popular Symbols */}
          {searchQuery === '' && (
            <div className="p-3 border-t border-dark-border">
              <div className="text-sm font-medium text-dark-text-secondary mb-2">Popular</div>
              <div className="grid grid-cols-2 gap-2">
                {popularSymbols.slice(0, 6).map(symbolData => (
                  <button
                    key={symbolData.symbol}
                    onClick={() => handleSymbolSelect(symbolData.symbol)}
                    className="flex items-center space-x-2 p-2 hover:bg-dark-bg-secondary rounded-lg transition-colors text-left"
                  >
                    {getDirectionIcon(symbolData.direction)}
                    <div>
                      <div className="font-semibold text-dark-text text-sm">{symbolData.symbol}</div>
                      <div className={`text-xs ${getChangeColor(symbolData.change)}`}>
                        {symbolData.change > 0 ? '+' : ''}{symbolData.change_percent.toFixed(1)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Symbol Display */}
      <div className="mt-4 p-4 bg-dark-bg-secondary rounded-lg border border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-market-up' : 'bg-market-down'}`}></div>
            <div>
              <div className="font-semibold text-dark-text">{selectedSymbol}</div>
              <div className="text-sm text-dark-text-secondary">
                {popularSymbols.find(s => s.symbol === selectedSymbol)?.name || 'Symbol not found'}
              </div>
            </div>
          </div>
          
          {popularSymbols.find(s => s.symbol === selectedSymbol) && (
            <div className="text-right">
              <div className="font-bold text-lg text-dark-text">
                ${popularSymbols.find(s => s.symbol === selectedSymbol)?.price.toFixed(2)}
              </div>
              <div className={`text-sm ${getChangeColor(popularSymbols.find(s => s.symbol === selectedSymbol)?.change || 0)}`}>
                {popularSymbols.find(s => s.symbol === selectedSymbol)?.change && 
                  (popularSymbols.find(s => s.symbol === selectedSymbol)!.change > 0 ? '+' : '') +
                  popularSymbols.find(s => s.symbol === selectedSymbol)!.change.toFixed(2)
                } ({popularSymbols.find(s => s.symbol === selectedSymbol)?.change_percent.toFixed(2)}%)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymbolSearch;
