import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceCardProps {
  symbol: string;
  data: {
    price: number;
    change: number;
    change_percent: number;
    volume: number;
    direction: 'up' | 'down' | 'unchanged';
  };
  isConnected: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({ symbol, data, isConnected }) => {
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }
    return price.toFixed(2);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
  };

  const getDirectionIcon = () => {
    switch (data.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-market-up" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-market-down" />;
      default:
        return <Minus className="w-4 h-4 text-dark-text-secondary" />;
    }
  };

  const getChangeColor = () => {
    if (data.change === 0) return 'text-dark-text-secondary';
    return data.change > 0 ? 'text-market-up' : 'text-market-down';
  };

  const getChangeBgColor = () => {
    if (data.change === 0) return 'bg-dark-text-secondary/10';
    return data.change > 0 ? 'bg-market-up/10' : 'bg-market-down/10';
  };

  return (
    <div className="market-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-dark-text font-mono">{symbol}</h3>
        <div className="flex items-center space-x-2">
          {getDirectionIcon()}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-market-up' : 'bg-market-down'}`}></div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        <div className="text-2xl font-bold text-dark-text font-mono">
          ${formatPrice(data.price)}
        </div>
      </div>

      {/* Change */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getChangeBgColor()}`}>
          <span className={`text-sm font-semibold ${getChangeColor()}`}>
            {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}
          </span>
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            ({data.change_percent > 0 ? '+' : ''}{data.change_percent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-between text-sm text-dark-text-secondary">
        <span>Volume:</span>
        <span className="font-mono">{formatVolume(data.volume)}</span>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
    </div>
  );
};

export default PriceCard;
