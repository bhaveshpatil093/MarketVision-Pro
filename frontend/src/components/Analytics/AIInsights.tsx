import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Activity,
  BarChart3,
  RefreshCw,
  Settings,
  Eye,
  Lightbulb,
  Target
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AIInsights: React.FC = () => {
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockAiData = {
        confidence: 87,
        lastUpdated: new Date().toISOString(),
        modelVersion: 'GPT-4.5',
        
        predictions: {
          shortTerm: [
            { symbol: 'AAPL', prediction: 2.5, confidence: 85, timeframe: '1 week', reason: 'Strong earnings momentum' },
            { symbol: 'TSLA', prediction: -1.8, confidence: 78, timeframe: '1 week', reason: 'Supply chain concerns' },
            { symbol: 'MSFT', prediction: 1.2, confidence: 82, timeframe: '1 week', reason: 'Cloud growth acceleration' },
            { symbol: 'GOOGL', prediction: 0.8, confidence: 75, timeframe: '1 week', reason: 'Ad revenue stabilization' }
          ],
          mediumTerm: [
            { symbol: 'NVDA', prediction: 8.5, confidence: 88, timeframe: '1 month', reason: 'AI chip demand surge' },
            { symbol: 'AMZN', prediction: 4.2, confidence: 80, timeframe: '1 month', reason: 'E-commerce recovery' },
            { symbol: 'META', prediction: 3.8, confidence: 77, timeframe: '1 month', reason: 'Metaverse investments' }
          ]
        },
        
        patterns: [
          {
            id: 'pattern_1',
            name: 'Golden Cross Formation',
            description: 'AAPL showing 50-day MA crossing above 200-day MA',
            confidence: 92,
            impact: 'Bullish',
            timeframe: '2-4 weeks',
            affected: ['AAPL', 'Technology sector'],
            chart: [
              { date: '2024-05-01', price: 150, ma50: 148, ma200: 152 },
              { date: '2024-05-15', price: 152, ma50: 149, ma200: 151 },
              { date: '2024-06-01', price: 155, ma50: 151, ma200: 150 },
              { date: '2024-06-15', price: 158, ma50: 153, ma200: 149 }
            ]
          },
          {
            id: 'pattern_2',
            name: 'Volume Divergence',
            description: 'TSLA showing price increase with declining volume',
            confidence: 78,
            impact: 'Bearish',
            timeframe: '1-2 weeks',
            affected: ['TSLA', 'EV sector'],
            chart: [
              { date: '2024-06-01', price: 800, volume: 50000000 },
              { date: '2024-06-08', price: 820, volume: 45000000 },
              { date: '2024-06-15', price: 840, volume: 40000000 }
            ]
          }
        ],
        
        anomalies: [
          {
            symbol: 'NVDA',
            type: 'Volume Spike',
            severity: 'High',
            description: 'Unusual 300% volume increase with minimal price movement',
            confidence: 94,
            recommendation: 'Monitor for potential breakout or breakdown',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            symbol: 'SPY',
            type: 'Price Gap',
            severity: 'Medium',
            description: 'Gap up opening with no significant news catalyst',
            confidence: 76,
            recommendation: 'Watch for gap fill or continuation',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ],
        
        sentiment: {
          overall: 65, // Bullish percentage
          sectors: [
            { sector: 'Technology', sentiment: 72, change: 5 },
            { sector: 'Healthcare', sentiment: 58, change: -2 },
            { sector: 'Financials', sentiment: 45, change: -8 },
            { sector: 'Energy', sentiment: 38, change: -12 },
            { sector: 'Consumer', sentiment: 62, change: 3 }
          ],
          timeline: [
            { date: '2024-06-01', bullish: 60, neutral: 25, bearish: 15 },
            { date: '2024-06-08', bullish: 62, neutral: 24, bearish: 14 },
            { date: '2024-06-15', bullish: 65, neutral: 22, bearish: 13 }
          ]
        },
        
        recommendations: [
          {
            action: 'BUY',
            symbol: 'NVDA',
            confidence: 88,
            reasoning: 'Strong AI momentum with technical breakout',
            risk: 'Medium',
            target: 950,
            stopLoss: 820,
            timeframe: '2-4 weeks'
          },
          {
            action: 'SELL',
            symbol: 'TSLA',
            confidence: 75,
            reasoning: 'Technical weakness and volume decline',
            risk: 'Medium',
            target: 750,
            stopLoss: 880,
            timeframe: '1-2 weeks'
          },
          {
            action: 'HOLD',
            symbol: 'AAPL',
            confidence: 82,
            reasoning: 'Stable trend with golden cross formation',
            risk: 'Low',
            target: 165,
            stopLoss: 150,
            timeframe: '1-3 months'
          }
        ]
      };
      
      setAiData(mockAiData);
      setLoading(false);
    }, 1500);
  }, []);

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

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-market-up';
    if (confidence >= 70) return 'text-market-alert';
    return 'text-market-down';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'text-market-down';
      case 'medium': return 'text-market-alert';
      case 'low': return 'text-market-up';
      default: return 'text-dark-text-secondary';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'BUY': return 'text-market-up';
      case 'SELL': return 'text-market-down';
      case 'HOLD': return 'text-market-alert';
      default: return 'text-dark-text-secondary';
    }
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
      {/* AI Status Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">AI Confidence</p>
              <p className={`text-2xl font-bold ${getConfidenceColor(aiData.confidence)}`}>
                {aiData.confidence}%
              </p>
            </div>
            <div className="p-3 bg-market-info/10 rounded-full">
              <Brain className="w-6 h-6 text-market-info" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Model: {aiData.modelVersion}
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Market Sentiment</p>
              <p className="text-2xl font-bold text-dark-text">{aiData.sentiment.overall}%</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Bullish sentiment
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Active Patterns</p>
              <p className="text-2xl font-bold text-dark-text">{aiData.patterns.length}</p>
            </div>
            <div className="p-3 bg-market-alert/10 rounded-full">
              <Eye className="w-6 h-6 text-market-alert" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Detected patterns
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Anomalies</p>
              <p className="text-2xl font-bold text-dark-text">{aiData.anomalies.length}</p>
            </div>
            <div className="p-3 bg-market-down/10 rounded-full">
              <AlertTriangle className="w-6 h-6 text-market-down" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Detected today
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Short-term Predictions (1 Week)</h3>
          <div className="space-y-3">
            {aiData.predictions.shortTerm.map((pred: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
                <div>
                  <div className="text-sm font-medium text-dark-text">{pred.symbol}</div>
                  <div className="text-xs text-dark-text-secondary">{pred.reason}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${pred.prediction > 0 ? 'text-market-up' : 'text-market-down'}`}>
                    {pred.prediction > 0 ? '+' : ''}{pred.prediction}%
                  </div>
                  <div className={`text-xs ${getConfidenceColor(pred.confidence)}`}>
                    {pred.confidence}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Medium-term Predictions (1 Month)</h3>
          <div className="space-y-3">
            {aiData.predictions.mediumTerm.map((pred: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
                <div>
                  <div className="text-sm font-medium text-dark-text">{pred.symbol}</div>
                  <div className="text-xs text-dark-text-secondary">{pred.reason}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${pred.prediction > 0 ? 'text-market-up' : 'text-market-down'}`}>
                    {pred.prediction > 0 ? '+' : ''}{pred.prediction}%
                  </div>
                  <div className={`text-xs ${getConfidenceColor(pred.confidence)}`}>
                    {pred.confidence}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Patterns */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Detected Patterns</h3>
        <div className="space-y-4">
          {aiData.patterns.map((pattern: any, index: number) => (
            <div key={index} className="border border-dark-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-md font-medium text-dark-text">{pattern.name}</h4>
                  <p className="text-sm text-dark-text-secondary">{pattern.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getConfidenceColor(pattern.confidence)}`}>
                    {pattern.confidence}% confidence
                  </div>
                  <div className="text-xs text-dark-text-secondary">{pattern.timeframe}</div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={pattern.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94A3B8"
                    fontSize={10}
                    tick={{ fill: '#94A3B8' }}
                  />
                  <YAxis 
                    stroke="#94A3B8"
                    fontSize={10}
                    tick={{ fill: '#94A3B8' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Price"
                  />
                  {pattern.chart[0].ma50 && (
                    <Line 
                      type="monotone" 
                      dataKey="ma50" 
                      stroke="#10B981" 
                      strokeWidth={1}
                      name="MA50"
                    />
                  )}
                  {pattern.chart[0].ma200 && (
                    <Line 
                      type="monotone" 
                      dataKey="ma200" 
                      stroke="#F59E0B" 
                      strokeWidth={1}
                      name="MA200"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">AI Trading Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Analysis</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Lightbulb className="w-4 h-4" />
            <span>Get Insights</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Set Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
