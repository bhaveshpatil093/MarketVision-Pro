import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  RefreshCw,
  Settings,
  BarChart3
} from 'lucide-react';

const CorrelationMatrix: React.FC = () => {
  const [correlationData, setCorrelationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [filterThreshold, setFilterThreshold] = useState(0.3);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockCorrelationData = {
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'JPM', 'BAC'],
        timeframes: {
          '1m': {
            matrix: [
              [1.00, 0.85, 0.78, 0.72, 0.65, 0.68, 0.71, 0.69, 0.45, 0.42],
              [0.85, 1.00, 0.82, 0.75, 0.67, 0.70, 0.73, 0.71, 0.48, 0.45],
              [0.78, 0.82, 1.00, 0.68, 0.62, 0.65, 0.68, 0.66, 0.42, 0.39],
              [0.72, 0.75, 0.68, 1.00, 0.58, 0.61, 0.64, 0.62, 0.38, 0.35],
              [0.65, 0.67, 0.62, 0.58, 1.00, 0.55, 0.58, 0.56, 0.32, 0.29],
              [0.68, 0.70, 0.65, 0.61, 0.55, 1.00, 0.61, 0.59, 0.35, 0.32],
              [0.71, 0.73, 0.68, 0.64, 0.58, 0.61, 1.00, 0.62, 0.38, 0.35],
              [0.69, 0.71, 0.66, 0.62, 0.56, 0.59, 0.62, 1.00, 0.36, 0.33],
              [0.45, 0.48, 0.42, 0.38, 0.32, 0.35, 0.38, 0.36, 1.00, 0.85],
              [0.42, 0.45, 0.39, 0.35, 0.29, 0.32, 0.35, 0.33, 0.85, 1.00]
            ]
          },
          '3m': {
            matrix: [
              [1.00, 0.88, 0.82, 0.78, 0.72, 0.75, 0.78, 0.76, 0.52, 0.49],
              [0.88, 1.00, 0.85, 0.81, 0.75, 0.78, 0.81, 0.79, 0.55, 0.52],
              [0.82, 0.85, 1.00, 0.75, 0.69, 0.72, 0.75, 0.73, 0.49, 0.46],
              [0.78, 0.81, 0.75, 1.00, 0.65, 0.68, 0.71, 0.69, 0.45, 0.42],
              [0.72, 0.75, 0.69, 0.65, 1.00, 0.62, 0.65, 0.63, 0.38, 0.35],
              [0.75, 0.78, 0.72, 0.68, 0.62, 1.00, 0.68, 0.66, 0.42, 0.39],
              [0.78, 0.81, 0.75, 0.71, 0.65, 0.68, 1.00, 0.69, 0.45, 0.42],
              [0.76, 0.79, 0.73, 0.69, 0.63, 0.66, 0.69, 1.00, 0.43, 0.40],
              [0.52, 0.55, 0.49, 0.45, 0.38, 0.42, 0.45, 0.43, 1.00, 0.88],
              [0.49, 0.52, 0.46, 0.42, 0.35, 0.39, 0.42, 0.40, 0.88, 1.00]
            ]
          },
          '6m': {
            matrix: [
              [1.00, 0.92, 0.88, 0.85, 0.78, 0.82, 0.85, 0.83, 0.58, 0.55],
              [0.92, 1.00, 0.89, 0.86, 0.79, 0.83, 0.86, 0.84, 0.61, 0.58],
              [0.88, 0.89, 1.00, 0.82, 0.75, 0.79, 0.82, 0.80, 0.55, 0.52],
              [0.85, 0.86, 0.82, 1.00, 0.72, 0.76, 0.79, 0.77, 0.52, 0.49],
              [0.78, 0.79, 0.75, 0.72, 1.00, 0.68, 0.71, 0.69, 0.45, 0.42],
              [0.82, 0.83, 0.79, 0.76, 0.68, 1.00, 0.75, 0.73, 0.49, 0.46],
              [0.85, 0.86, 0.82, 0.79, 0.71, 0.75, 1.00, 0.76, 0.52, 0.49],
              [0.83, 0.84, 0.80, 0.77, 0.69, 0.73, 0.76, 1.00, 0.50, 0.47],
              [0.58, 0.61, 0.55, 0.52, 0.45, 0.49, 0.52, 0.50, 1.00, 0.92],
              [0.55, 0.58, 0.52, 0.49, 0.42, 0.46, 0.49, 0.47, 0.92, 1.00]
            ]
          },
          '1y': {
            matrix: [
              [1.00, 0.95, 0.92, 0.89, 0.82, 0.86, 0.89, 0.87, 0.65, 0.62],
              [0.95, 1.00, 0.93, 0.90, 0.83, 0.87, 0.90, 0.88, 0.68, 0.65],
              [0.92, 0.93, 1.00, 0.86, 0.79, 0.83, 0.86, 0.84, 0.62, 0.59],
              [0.89, 0.90, 0.86, 1.00, 0.75, 0.79, 0.82, 0.80, 0.58, 0.55],
              [0.82, 0.83, 0.79, 0.75, 1.00, 0.72, 0.75, 0.73, 0.52, 0.49],
              [0.86, 0.87, 0.83, 0.79, 0.72, 1.00, 0.79, 0.77, 0.55, 0.52],
              [0.89, 0.90, 0.86, 0.82, 0.75, 0.79, 1.00, 0.80, 0.58, 0.55],
              [0.87, 0.88, 0.84, 0.80, 0.73, 0.77, 0.80, 1.00, 0.56, 0.53],
              [0.65, 0.68, 0.62, 0.58, 0.52, 0.55, 0.58, 0.56, 1.00, 0.95],
              [0.62, 0.65, 0.59, 0.55, 0.49, 0.52, 0.55, 0.53, 0.95, 1.00]
            ]
          }
        },
        
        insights: {
          highestCorrelation: { pair: 'AAPL-MSFT', value: 0.95, timeframe: '1y' },
          lowestCorrelation: { pair: 'TSLA-BAC', value: 0.29, timeframe: '1m' },
          sectorClusters: [
            { name: 'Technology', symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'], avgCorrelation: 0.89 },
            { name: 'Financials', symbols: ['JPM', 'BAC'], avgCorrelation: 0.95 },
            { name: 'Consumer', symbols: ['AMZN', 'NFLX'], avgCorrelation: 0.76 }
          ]
        },
        
        trends: [
          { pair: 'AAPL-MSFT', '1m': 0.85, '3m': 0.88, '6m': 0.92, '1y': 0.95, trend: 'increasing' },
          { pair: 'TSLA-NVDA', '1m': 0.55, '3m': 0.62, '6m': 0.68, '1y': 0.72, trend: 'increasing' },
          { pair: 'JPM-BAC', '1m': 0.85, '3m': 0.88, '6m': 0.92, '1y': 0.95, trend: 'stable' }
        ]
      };
      
      setCorrelationData(mockCorrelationData);
      setLoading(false);
    }, 1000);
  }, []);

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return 'bg-market-up text-white';
    if (absValue >= 0.6) return 'bg-market-up/20 text-market-up';
    if (absValue >= 0.4) return 'bg-market-alert/20 text-market-alert';
    if (absValue >= 0.2) return 'bg-market-down/20 text-market-down';
    return 'bg-dark-bg-secondary text-dark-text-secondary';
  };

  const getCorrelationIntensity = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return 'Very Strong';
    if (absValue >= 0.6) return 'Strong';
    if (absValue >= 0.4) return 'Moderate';
    if (absValue >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const filteredSymbols = correlationData?.symbols.filter((symbol: string) =>
    symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredMatrix = filteredSymbols.map((symbol: string, i: number) => {
    const originalIndex = correlationData.symbols.indexOf(symbol);
    return filteredSymbols.map((_: string, j: number) => {
      const originalJ = correlationData.symbols.indexOf(filteredSymbols[j]);
      return correlationData.timeframes[selectedTimeframe].matrix[originalIndex][originalJ];
    });
  });

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
    <div className="space-y-6">
      {/* Controls */}
      <div className="market-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-dark-text">Timeframe</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as typeof selectedTimeframe)}
                className="ml-2 bg-dark-bg-secondary border border-dark-border rounded px-3 py-1 text-sm text-dark-text"
              >
                <option value="1m">1 Month</option>
                <option value="3m">3 Months</option>
                <option value="6m">6 Months</option>
                <option value="1y">1 Year</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-dark-text">Filter Threshold</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filterThreshold}
                onChange={(e) => setFilterThreshold(parseFloat(e.target.value))}
                className="ml-2 w-24"
              />
              <span className="ml-2 text-sm text-dark-text-secondary">{filterThreshold}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-secondary" />
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-dark-bg-secondary border border-dark-border rounded-lg text-sm text-dark-text"
              />
            </div>
            
            <button className="btn-secondary flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Correlation Matrix</h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header Row */}
            <div className="flex">
              <div className="w-20 h-10 flex items-center justify-center text-sm font-medium text-dark-text-secondary border-r border-b border-dark-border">
                Symbol
              </div>
              {filteredSymbols.map((symbol: string) => (
                <div key={symbol} className="w-16 h-10 flex items-center justify-center text-xs font-medium text-dark-text border-r border-b border-dark-border">
                  {symbol}
                </div>
              ))}
            </div>
            
            {/* Matrix Rows */}
            {filteredMatrix.map((row: number[], i: number) => (
              <div key={i} className="flex">
                <div className="w-20 h-10 flex items-center justify-center text-sm font-medium text-dark-text border-r border-b border-dark-border">
                  {filteredSymbols[i]}
                </div>
                {row.map((value: number, j: number) => (
                  <div
                    key={j}
                    className={`w-16 h-10 flex items-center justify-center text-xs border-r border-b border-dark-border cursor-pointer hover:opacity-80 transition-opacity ${
                      getCorrelationColor(value)
                    }`}
                    title={`${filteredSymbols[i]} vs ${filteredSymbols[j]}: ${value.toFixed(3)} (${getCorrelationIntensity(value)})`}
                  >
                    {Math.abs(value) >= filterThreshold ? value.toFixed(2) : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="p-3 bg-market-up/10 rounded-lg">
              <div className="text-sm font-medium text-dark-text">Highest Correlation</div>
              <div className="text-lg font-bold text-market-up">
                {correlationData.insights.highestCorrelation.pair}: {correlationData.insights.highestCorrelation.value.toFixed(3)}
              </div>
              <div className="text-xs text-dark-text-secondary">
                {correlationData.insights.highestCorrelation.timeframe} timeframe
              </div>
            </div>
            
            <div className="p-3 bg-market-down/10 rounded-lg">
              <div className="text-sm font-medium text-dark-text">Lowest Correlation</div>
              <div className="text-lg font-bold text-market-down">
                {correlationData.insights.lowestCorrelation.pair}: {correlationData.insights.lowestCorrelation.value.toFixed(3)}
              </div>
              <div className="text-xs text-dark-text-secondary">
                {correlationData.insights.lowestCorrelation.timeframe} timeframe
              </div>
            </div>
          </div>
        </div>

        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Sector Clusters</h3>
          <div className="space-y-3">
            {correlationData.insights.sectorClusters.map((cluster: any, index: number) => (
              <div key={index} className="p-3 bg-dark-bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-dark-text">{cluster.name}</div>
                  <div className="text-sm font-bold text-market-up">
                    {cluster.avgCorrelation.toFixed(2)}
                  </div>
                </div>
                <div className="text-xs text-dark-text-secondary">
                  {cluster.symbols.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Correlation Trends */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Correlation Trends</h3>
        <div className="overflow-x-auto">
          <table className="w-full market-table">
            <thead>
              <tr>
                <th>Symbol Pair</th>
                <th>1M</th>
                <th>3M</th>
                <th>6M</th>
                <th>1Y</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {correlationData.trends.map((trend: any, index: number) => (
                <tr key={index}>
                  <td className="font-medium text-dark-text">{trend.pair}</td>
                  <td className={getCorrelationColor(trend['1m'])}>{trend['1m'].toFixed(2)}</td>
                  <td className={getCorrelationColor(trend['3m'])}>{trend['3m'].toFixed(2)}</td>
                  <td className={getCorrelationColor(trend['6m'])}>{trend['6m'].toFixed(2)}</td>
                  <td className={getCorrelationColor(trend['1y'])}>{trend['1y'].toFixed(2)}</td>
                  <td>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      trend.trend === 'increasing' ? 'bg-market-up/20 text-market-up' :
                      trend.trend === 'decreasing' ? 'bg-market-down/20 text-market-down' :
                      'bg-market-alert/20 text-market-alert'
                    }`}>
                      {trend.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Correlation Analysis Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Run Analysis</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Set Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
