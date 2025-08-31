import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Brain,
  Shield,
  Target,
  Activity,
  PieChart,
  LineChart,
  Zap
} from 'lucide-react';

import { useWebSocket } from '../hooks/useWebSocket';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import RiskMetrics from '../components/Analytics/RiskMetrics';
import PortfolioAnalysis from '../components/Analytics/PortfolioAnalysis';
import AIInsights from '../components/Analytics/AIInsights';
import CorrelationMatrix from '../components/Analytics/CorrelationMatrix';

const Analytics: React.FC = () => {
  const { isConnected, latency } = useWebSocket();
  const { isOnline } = useConnectionStatus();
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'portfolio' | 'ai' | 'correlation'>('overview');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'risk', label: 'Risk Metrics', icon: Shield },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'ai', label: 'AI Insights', icon: Brain },
    { id: 'correlation', label: 'Correlation', icon: LineChart }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as typeof activeTab);
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Analytics</h1>
          <p className="text-dark-text-secondary mt-2">
            Advanced risk analysis, portfolio insights, and AI-powered market intelligence
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-market-up' : 'bg-market-down'}`}></div>
            <span className={`text-sm font-medium ${isConnected ? 'text-market-up' : 'text-market-down'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-2 text-sm text-dark-text-secondary">
              <Activity className="w-4 h-4" />
              <span>{latency}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="market-card">
        <div className="flex space-x-1 p-1 bg-dark-bg-secondary rounded-lg">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-market-info text-white shadow-lg'
                  : 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-bg-secondary/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="market-card">
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="market-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-text-secondary">Portfolio VaR</p>
                      <p className="text-2xl font-bold text-dark-text">2.45%</p>
                    </div>
                    <div className="p-3 bg-market-down/10 rounded-full">
                      <Shield className="w-6 h-6 text-market-down" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-dark-text-secondary">
                    <span className="text-market-down">↑ 0.12%</span> from yesterday
                  </div>
                </div>

                <div className="market-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-text-secondary">Sharpe Ratio</p>
                      <p className="text-2xl font-bold text-dark-text">1.85</p>
                    </div>
                    <div className="p-3 bg-market-up/10 rounded-full">
                      <TrendingUp className="w-6 h-6 text-market-up" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-dark-text-secondary">
                    <span className="text-market-up">↑ 0.08</span> from yesterday
                  </div>
                </div>

                <div className="market-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-text-secondary">Max Drawdown</p>
                      <p className="text-2xl font-bold text-dark-text">-8.32%</p>
                    </div>
                    <div className="p-3 bg-market-alert/10 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-market-alert" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-dark-text-secondary">
                    <span className="text-market-up">↓ 0.45%</span> from yesterday
                  </div>
                </div>

                <div className="market-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-dark-text-secondary">AI Confidence</p>
                      <p className="text-2xl font-bold text-dark-text">87%</p>
                    </div>
                    <div className="p-3 bg-market-info/10 rounded-full">
                      <Brain className="w-6 h-6 text-market-info" />
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-dark-text-secondary">
                    <span className="text-market-up">↑ 3%</span> from yesterday
                  </div>
                </div>
              </div>

              {/* Risk vs Return Chart */}
              <div className="market-card">
                <h3 className="text-lg font-semibold text-dark-text mb-4">Risk vs Return Analysis</h3>
                <div className="h-64 bg-dark-bg-secondary rounded-lg flex items-center justify-center">
                  <div className="text-center text-dark-text-secondary">
                    <LineChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Risk vs Return Chart</p>
                    <p className="text-sm">Interactive visualization coming soon</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="market-card">
                  <h3 className="text-lg font-semibold text-dark-text mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full btn-primary flex items-center justify-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Run Risk Analysis</span>
                    </button>
                    
                    <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Optimize Portfolio</span>
                    </button>
                    
                    <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Generate AI Report</span>
                    </button>
                  </div>
                </div>

                <div className="market-card">
                  <h3 className="text-lg font-semibold text-dark-text mb-4">Recent Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-market-down/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-market-down" />
                      <div className="text-sm">
                        <div className="font-medium text-dark-text">High Volatility Alert</div>
                        <div className="text-dark-text-secondary">TSLA volatility increased 25%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 bg-market-up/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-market-up" />
                      <div className="text-sm">
                        <div className="font-medium text-dark-text">Portfolio Performance</div>
                        <div className="text-dark-text-secondary">+2.3% above benchmark</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-2 bg-market-info/10 rounded-lg">
                      <Brain className="w-4 h-4 text-market-info" />
                      <div className="text-sm">
                        <div className="font-medium text-dark-text">AI Insight</div>
                        <div className="text-dark-text-secondary">New pattern detected in AAPL</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="market-card">
                  <h3 className="text-lg font-semibold text-dark-text mb-4">Market Sentiment</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-dark-text-secondary">Bullish</span>
                        <span className="text-sm font-medium text-market-up">65%</span>
                      </div>
                      <div className="w-full bg-dark-bg-secondary rounded-full h-2">
                        <div className="bg-market-up h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-dark-text-secondary">Neutral</span>
                        <span className="text-sm font-medium text-dark-text-secondary">25%</span>
                      </div>
                      <div className="w-full bg-dark-bg-secondary rounded-full h-2">
                        <div className="bg-dark-text-secondary h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-dark-text-secondary">Bearish</span>
                        <span className="text-sm font-medium text-market-down">10%</span>
                      </div>
                      <div className="w-full bg-dark-bg-secondary rounded-full h-2">
                        <div className="bg-market-down h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && <RiskMetrics />}
          {activeTab === 'portfolio' && <PortfolioAnalysis />}
          {activeTab === 'ai' && <AIInsights />}
          {activeTab === 'correlation' && <CorrelationMatrix />}
        </>
      )}
    </div>
  );
};

export default Analytics;
