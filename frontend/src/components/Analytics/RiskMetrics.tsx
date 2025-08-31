import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity,
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const RiskMetrics: React.FC = () => {
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockRiskData = {
        var: {
          current: 2.45,
          previous: 2.33,
          change: 0.12,
          trend: 'up',
          confidence: 95,
          breakdown: [
            { name: 'Equity', value: 1.2, color: '#10B981' },
            { name: 'Fixed Income', value: 0.8, color: '#3B82F6' },
            { name: 'Commodities', value: 0.45, color: '#F59E0B' }
          ]
        },
        sharpe: {
          current: 1.85,
          previous: 1.77,
          change: 0.08,
          trend: 'up',
          target: 2.0
        },
        maxDrawdown: {
          current: -8.32,
          previous: -8.77,
          change: 0.45,
          trend: 'up',
          worstPeriod: '2023-03-15 to 2023-04-20'
        },
        beta: {
          current: 0.95,
          previous: 0.92,
          change: 0.03,
          trend: 'up',
          benchmark: 'S&P 500'
        },
        volatility: {
          current: 15.2,
          previous: 14.8,
          change: 0.4,
          trend: 'up',
          annualized: true
        },
        stressTest: {
          scenarios: [
            { scenario: 'Market Crash (-20%)', impact: -12.5, probability: 5 },
            { scenario: 'Interest Rate Hike', impact: -3.2, probability: 15 },
            { scenario: 'Currency Crisis', impact: -8.1, probability: 8 },
            { scenario: 'Geopolitical Risk', impact: -5.7, probability: 12 }
          ]
        },
        historicalData: [
          { date: '2024-01', var: 2.1, sharpe: 1.6, drawdown: -6.2 },
          { date: '2024-02', var: 2.3, sharpe: 1.7, drawdown: -7.1 },
          { date: '2024-03', var: 2.8, sharpe: 1.8, drawdown: -8.3 },
          { date: '2024-04', var: 2.5, sharpe: 1.9, drawdown: -7.8 },
          { date: '2024-05', var: 2.2, sharpe: 1.85, drawdown: -6.9 },
          { date: '2024-06', var: 2.45, sharpe: 1.85, drawdown: -8.32 }
        ]
      };
      
      setRiskData(mockRiskData);
      setLoading(false);
    }, 1000);
  }, []);

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-market-up' : 'text-market-down';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-dark-border rounded-lg p-3 shadow-lg">
          <p className="text-dark-text font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
      {/* Key Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Value at Risk (VaR)</p>
              <p className="text-2xl font-bold text-dark-text">{riskData.var.current}%</p>
            </div>
            <div className="p-3 bg-market-down/10 rounded-full">
              <Shield className="w-6 h-6 text-market-down" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-sm">
            <span className={getTrendColor(riskData.var.trend)}>
              {getTrendIcon(riskData.var.trend)}
            </span>
            <span className={getTrendColor(riskData.var.trend)}>
              {riskData.var.change > 0 ? '+' : ''}{riskData.var.change}%
            </span>
            <span className="text-dark-text-secondary">from last month</span>
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Sharpe Ratio</p>
              <p className="text-2xl font-bold text-dark-text">{riskData.sharpe.current}</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <Shield className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-sm">
            <span className={getTrendColor(riskData.sharpe.trend)}>
              {getTrendIcon(riskData.sharpe.trend)}
            </span>
            <span className={getTrendColor(riskData.sharpe.trend)}>
              {riskData.sharpe.change > 0 ? '+' : ''}{riskData.sharpe.change}
            </span>
            <span className="text-dark-text-secondary">target: {riskData.sharpe.target}</span>
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Max Drawdown</p>
              <p className="text-2xl font-bold text-dark-text">{riskData.maxDrawdown.current}%</p>
            </div>
            <div className="p-3 bg-market-alert/10 rounded-full">
              <AlertTriangle className="w-6 h-6 text-market-alert" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-sm">
            <span className={getTrendColor(riskData.maxDrawdown.trend)}>
              {getTrendIcon(riskData.maxDrawdown.trend)}
            </span>
            <span className={getTrendColor(riskData.maxDrawdown.trend)}>
              {riskData.maxDrawdown.change > 0 ? '+' : ''}{riskData.maxDrawdown.change}%
            </span>
            <span className="text-dark-text-secondary">improvement</span>
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Beta</p>
              <p className="text-2xl font-bold text-dark-text">{riskData.beta.current}</p>
            </div>
            <div className="p-3 bg-market-info/10 rounded-full">
              <Activity className="w-6 h-6 text-market-info" />
            </div>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-sm">
            <span className={getTrendColor(riskData.beta.trend)}>
              {getTrendIcon(riskData.beta.trend)}
            </span>
            <span className={getTrendColor(riskData.beta.trend)}>
              {riskData.beta.change > 0 ? '+' : ''}{riskData.beta.change}
            </span>
            <span className="text-dark-text-secondary">vs {riskData.beta.benchmark}</span>
          </div>
        </div>
      </div>

      {/* Risk Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">VaR Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData.var.breakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {riskData.var.breakdown.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {riskData.var.breakdown.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-dark-text">{item.name}</span>
                </div>
                <span className="text-dark-text font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Historical Risk Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskData.historicalData}>
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
                dataKey="var" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="VaR (%)"
              />
              <Line 
                type="monotone" 
                dataKey="sharpe" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Sharpe Ratio"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stress Testing */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Stress Test Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-dark-text mb-3">Scenario Analysis</h4>
            <div className="space-y-3">
              {riskData.stressTest.scenarios.map((scenario: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-dark-text">{scenario.scenario}</div>
                    <div className="text-xs text-dark-text-secondary">
                      Probability: {scenario.probability}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${scenario.impact > 0 ? 'text-market-up' : 'text-market-down'}`}>
                      {scenario.impact > 0 ? '+' : ''}{scenario.impact}%
                    </div>
                    <div className="text-xs text-dark-text-secondary">Impact</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-dark-text mb-3">Risk Alerts</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-market-alert/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-market-alert" />
                <div>
                  <div className="text-sm font-medium text-dark-text">High Volatility Alert</div>
                  <div className="text-xs text-dark-text-secondary">Current volatility exceeds 15% threshold</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-market-up/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-market-up" />
                <div>
                  <div className="text-sm font-medium text-dark-text">Risk Improvement</div>
                  <div className="text-xs text-dark-text-secondary">VaR reduced by 0.12% this month</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-market-info/10 rounded-lg">
                <Shield className="w-5 h-5 text-market-info" />
                <div>
                  <div className="text-sm font-medium text-dark-text">Diversification Check</div>
                  <div className="text-xs text-dark-text-secondary">Portfolio well-diversified across sectors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Risk Management Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Run Risk Analysis</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Set Risk Limits</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskMetrics;
