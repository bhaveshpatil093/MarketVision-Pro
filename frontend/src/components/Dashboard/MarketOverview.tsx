import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MarketOverviewProps {
  data: any;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ data }) => {
  if (!data) return null;

  const symbols = Object.entries(data.symbols || {});
  const gainers = symbols.filter(([_, symbolData]: [string, any]) => symbolData.direction === 'up');
  const losers = symbols.filter(([_, symbolData]: [string, any]) => symbolData.direction === 'down');

  const getTopGainers = () => {
    return gainers
      .sort(([_, a]: [string, any], [__, b]: [string, any]) => b.change_percent - a.change_percent)
      .slice(0, 3);
  };

  const getTopLosers = () => {
    return losers
      .sort(([_, a]: [string, any], [__, b]: [string, any]) => a.change_percent - b.change_percent)
      .slice(0, 3);
  };

  const getMarketSentiment = () => {
    const upCount = gainers.length;
    const downCount = losers.length;
    
    if (upCount > downCount) return 'Bullish';
    if (downCount > upCount) return 'Bearish';
    return 'Neutral';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish':
        return 'text-market-up';
      case 'Bearish':
        return 'text-market-down';
      default:
        return 'text-dark-text-secondary';
    }
  };

  return (
    <div className="market-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-dark-text">Market Overview</h2>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-market-info" />
          <span className="text-sm text-dark-text-secondary">Live Data</span>
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-dark-text-secondary">Market Sentiment</span>
          <span className={`text-lg font-bold ${getSentimentColor(getMarketSentiment())}`}>
            {getMarketSentiment()}
          </span>
        </div>
        
        <div className="w-full bg-dark-bg-secondary rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-market-down via-dark-text-secondary to-market-up h-2 rounded-full"
            style={{ 
              background: `linear-gradient(to right, 
                #ef4444 0%, 
                #6b7280 ${(gainers.length / symbols.length) * 50}%, 
                #22c55e 100%)` 
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-dark-text-secondary mt-2">
          <span>Bearish</span>
          <span>Neutral</span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-market-up" />
            <h3 className="font-semibold text-dark-text">Top Gainers</h3>
          </div>
          
          <div className="space-y-2">
            {getTopGainers().map(([symbol, symbolData]: [string, any]) => (
              <div key={symbol} className="flex items-center justify-between p-2 bg-market-up/5 rounded-lg">
                <span className="font-medium text-dark-text">{symbol}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-market-up">
                    +{symbolData.change_percent.toFixed(2)}%
                  </div>
                  <div className="text-xs text-dark-text-secondary">
                    ${symbolData.change.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingDown className="w-5 h-5 text-market-down" />
            <h3 className="font-semibold text-dark-text">Top Losers</h3>
          </div>
          
          <div className="space-y-2">
            {getTopLosers().map(([symbol, symbolData]: [string, any]) => (
              <div key={symbol} className="flex items-center justify-between p-2 bg-market-down/5 rounded-lg">
                <span className="font-medium text-dark-text">{symbol}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-market-down">
                    {symbolData.change_percent.toFixed(2)}%
                  </div>
                  <div className="text-xs text-dark-text-secondary">
                    ${symbolData.change.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Volume Analysis */}
      <div className="mt-6 pt-6 border-t border-dark-border">
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="w-5 h-5 text-market-info" />
          <h3 className="font-semibold text-dark-text">Volume Analysis</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
            <div className="text-2xl font-bold text-dark-text">
              {data.market_summary?.total_volume ? 
                (data.market_summary.total_volume / 1000000).toFixed(1) + 'M' : '0M'
              }
            </div>
            <div className="text-xs text-dark-text-secondary">Total Volume</div>
          </div>
          
          <div className="text-center p-3 bg-dark-bg-secondary rounded-lg">
            <div className="text-2xl font-bold text-dark-text">
              {data.market_summary?.total_volume && data.market_summary?.total_volume > 0 ? 
                (data.market_summary.total_volume / symbols.length / 1000000).toFixed(1) + 'M' : '0M'
              }
            </div>
            <div className="text-xs text-dark-text-secondary">Avg per Symbol</div>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      <div className="mt-6 pt-6 border-t border-dark-border">
        <h3 className="font-semibold text-dark-text mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-market-up">{gainers.length}</div>
            <div className="text-xs text-dark-text-secondary">Gainers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-market-down">{losers.length}</div>
            <div className="text-xs text-dark-text-secondary">Losers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-dark-text-secondary">
              {symbols.length - gainers.length - losers.length}
            </div>
            <div className="text-xs text-dark-text-secondary">Unchanged</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
