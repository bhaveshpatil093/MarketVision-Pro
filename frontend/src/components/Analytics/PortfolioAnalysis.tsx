import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';
import {
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const PortfolioAnalysis: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'allocation' | 'performance' | 'sectors'>('allocation');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockPortfolioData = {
        totalValue: 1250000,
        totalReturn: 8.45,
        totalReturnAmount: 97500,
        benchmark: 'S&P 500',
        benchmarkReturn: 6.2,
        excessReturn: 2.25,
        
        allocation: [
          { name: 'Technology', value: 450000, percentage: 36, color: '#3B82F6', return: 12.5 },
          { name: 'Healthcare', value: 250000, percentage: 20, color: '#10B981', return: 8.2 },
          { name: 'Financials', value: 200000, percentage: 16, color: '#F59E0B', return: 5.8 },
          { name: 'Consumer', value: 150000, percentage: 12, color: '#EF4444', return: 6.5 },
          { name: 'Energy', value: 100000, percentage: 8, color: '#8B5CF6', return: 4.2 },
          { name: 'Cash', value: 100000, percentage: 8, color: '#6B7280', return: 2.1 }
        ],
        
        sectors: [
          { sector: 'Technology', weight: 36, return: 12.5, benchmark: 10.2, excess: 2.3 },
          { sector: 'Healthcare', weight: 20, return: 8.2, benchmark: 7.8, excess: 0.4 },
          { sector: 'Financials', weight: 16, return: 5.8, benchmark: 6.1, excess: -0.3 },
          { sector: 'Consumer', weight: 12, return: 6.5, benchmark: 5.9, excess: 0.6 },
          { sector: 'Energy', weight: 8, return: 4.2, benchmark: 4.5, excess: -0.3 },
          { sector: 'Materials', weight: 4, return: 3.8, benchmark: 4.1, excess: -0.3 },
          { sector: 'Utilities', weight: 4, return: 2.9, benchmark: 3.2, excess: -0.3 }
        ],
        
        performance: {
          daily: [
            { date: '2024-06-01', portfolio: 0.5, benchmark: 0.3 },
            { date: '2024-06-02', portfolio: -0.2, benchmark: -0.1 },
            { date: '2024-06-03', portfolio: 1.2, benchmark: 0.8 },
            { date: '2024-06-04', portfolio: 0.8, benchmark: 0.6 },
            { date: '2024-06-05', portfolio: -0.5, benchmark: -0.3 },
            { date: '2024-06-06', portfolio: 0.9, benchmark: 0.7 },
            { date: '2024-06-07', portfolio: 1.1, benchmark: 0.9 }
          ],
          monthly: [
            { month: 'Jan', portfolio: 2.1, benchmark: 1.8 },
            { month: 'Feb', portfolio: 1.8, benchmark: 1.5 },
            { month: 'Mar', portfolio: 3.2, benchmark: 2.8 },
            { month: 'Apr', portfolio: 2.5, benchmark: 2.1 },
            { month: 'May', portfolio: 1.9, benchmark: 1.7 },
            { month: 'Jun', portfolio: 2.8, benchmark: 2.4 }
          ]
        },
        
        topHoldings: [
          { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.5, return: 15.2, value: 106250 },
          { symbol: 'MSFT', name: 'Microsoft Corp.', weight: 7.8, return: 12.8, value: 97500 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', weight: 6.2, return: 10.5, value: 77500 },
          { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.9, return: 8.9, value: 73750 },
          { symbol: 'TSLA', name: 'Tesla Inc.', weight: 4.8, return: 6.2, value: 60000 }
        ],
        
        rebalancing: {
          needed: true,
          recommendations: [
            { action: 'Buy', symbol: 'AAPL', amount: 15000, reason: 'Underweight' },
            { action: 'Sell', symbol: 'TSLA', amount: 8000, reason: 'Overweight' },
            { action: 'Buy', symbol: 'JPM', amount: 12000, reason: 'Rebalance' }
          ]
        }
      };
      
      setPortfolioData(mockPortfolioData);
      setLoading(false);
    }, 1000);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-dark-text font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

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
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Total Value</p>
              <p className="text-2xl font-bold text-dark-text">{formatCurrency(portfolioData.totalValue)}</p>
            </div>
            <div className="p-3 bg-market-info/10 rounded-full">
              <DollarSign className="w-6 h-6 text-market-info" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            <span className="text-market-up">+{formatCurrency(portfolioData.totalReturnAmount)}</span> total gain
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Total Return</p>
              <p className="text-2xl font-bold text-market-up">{portfolioData.totalReturn}%</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            vs {portfolioData.benchmark}: {portfolioData.benchmarkReturn}%
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Excess Return</p>
              <p className="text-2xl font-bold text-market-up">{portfolioData.excessReturn}%</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <Settings className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Alpha vs benchmark
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Holdings</p>
              <p className="text-2xl font-bold text-dark-text">{portfolioData.allocation.length}</p>
            </div>
            <div className="p-3 bg-market-info/10 rounded-full">
              <PieChart className="w-6 h-6 text-market-info" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Diversified positions
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="market-card">
        <div className="flex space-x-2">
          {[
            { id: 'allocation', label: 'Asset Allocation', icon: PieChart },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'sectors', label: 'Sector Analysis', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedView(id as typeof selectedView)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedView === id
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

      {/* Content based on selected view */}
      {selectedView === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={portfolioData.allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.allocation.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {portfolioData.allocation.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-dark-text">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-dark-text font-medium">{item.percentage}%</div>
                    <div className="text-xs text-dark-text-secondary">{formatCurrency(item.value)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Top Holdings</h3>
            <div className="space-y-3">
              {portfolioData.topHoldings.map((holding: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-dark-text">{holding.symbol}</div>
                    <div className="text-xs text-dark-text-secondary">{holding.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-dark-text">{holding.weight}%</div>
                    <div className={`text-xs ${holding.return > 0 ? 'text-market-up' : 'text-market-down'}`}>
                      {formatPercentage(holding.return)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Daily Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioData.performance.daily}>
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
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Portfolio"
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#94A3B8" 
                  strokeWidth={2}
                  name="Benchmark"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Monthly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={portfolioData.performance.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="month" 
                  stroke="#94A3B8"
                  fontSize={12}
                  tick={{ fill: '#94A3B8' }}
                />
                <YAxis 
                  stroke="#94A3B8"
                  fontSize={12}
                  tick={{ fill: '#94A3B8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="portfolio" fill="#3B82F6" name="Portfolio" />
                <Bar dataKey="benchmark" fill="#94A3B8" name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedView === 'sectors' && (
        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Sector Performance vs Benchmark</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={portfolioData.sectors} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                type="number"
                stroke="#94A3B8"
                fontSize={12}
                tick={{ fill: '#94A3B8' }}
              />
              <YAxis 
                type="category"
                dataKey="sector" 
                stroke="#94A3B8"
                fontSize={12}
                tick={{ fill: '#94A3B8' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="return" fill="#3B82F6" name="Portfolio Return" />
              <Bar dataKey="benchmark" fill="#94A3B8" name="Benchmark Return" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rebalancing Recommendations */}
      {portfolioData.rebalancing.needed && (
        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Rebalancing Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {portfolioData.rebalancing.recommendations.map((rec: any, index: number) => (
              <div key={index} className="p-3 bg-dark-bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    rec.action === 'Buy' ? 'text-market-up' : 'text-market-down'
                  }`}>
                    {rec.action}
                  </span>
                  <span className="text-sm font-medium text-dark-text">{rec.symbol}</span>
                </div>
                <div className="text-sm text-dark-text">{formatCurrency(rec.amount)}</div>
                <div className="text-xs text-dark-text-secondary">{rec.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Portfolio Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Rebalance</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analyze</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Optimize</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysis;
