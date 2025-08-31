import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  RefreshCw,
  BarChart3,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

const OptimizationTools: React.FC = () => {
  const [optimizationData, setOptimizationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningOptimization, setRunningOptimization] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const mockOptimizationData = {
        score: 85,
        recommendations: [
          {
            id: 'cache_optimization',
            title: 'Cache Optimization',
            description: 'Increase Redis cache size to improve query performance',
            impact: 'High',
            effort: 'Low',
            status: 'pending',
            estimatedImprovement: 15
          },
          {
            id: 'database_indexing',
            title: 'Database Indexing',
            description: 'Add missing indexes on frequently queried columns',
            impact: 'Medium',
            effort: 'Medium',
            status: 'pending',
            estimatedImprovement: 25
          },
          {
            id: 'connection_pooling',
            title: 'Connection Pooling',
            description: 'Optimize database connection pool settings',
            impact: 'High',
            effort: 'Low',
            status: 'completed',
            estimatedImprovement: 20
          },
          {
            id: 'memory_cleanup',
            title: 'Memory Cleanup',
            description: 'Implement automatic memory cleanup for unused objects',
            impact: 'Medium',
            effort: 'High',
            status: 'pending',
            estimatedImprovement: 10
          }
        ],
        recentOptimizations: [
          {
            name: 'Query Optimization',
            date: '2024-06-15',
            improvement: 12,
            status: 'completed'
          },
          {
            name: 'Cache Warming',
            date: '2024-06-14',
            improvement: 8,
            status: 'completed'
          },
          {
            name: 'Index Rebuild',
            date: '2024-06-13',
            improvement: 15,
            status: 'completed'
          }
        ],
        systemHealth: {
          cpu: 85,
          memory: 78,
          disk: 92,
          network: 88
        }
      };
      
      setOptimizationData(mockOptimizationData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRunOptimization = (id: string) => {
    setRunningOptimization(true);
    setTimeout(() => {
      setOptimizationData((prev: any) => ({
        ...prev,
        recommendations: prev.recommendations.map((rec: any) => 
          rec.id === id ? { ...rec, status: 'completed' } : rec
        )
      }));
      setRunningOptimization(false);
    }, 3000);
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-market-down';
      case 'medium': return 'text-market-alert';
      case 'low': return 'text-market-up';
      default: return 'text-dark-text-secondary';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case 'high': return 'text-market-down';
      case 'medium': return 'text-market-alert';
      case 'low': return 'text-market-up';
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
      {/* Optimization Score */}
      <div className="market-card text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-market-up mb-2">{optimizationData.score}</div>
          <div className="text-xl text-dark-text-secondary">Optimization Score</div>
          <div className="text-sm text-dark-text-secondary mt-2">
            Based on system performance and optimization opportunities
          </div>
        </div>
        
        <div className="w-full bg-dark-bg-secondary rounded-full h-3 mb-4">
          <div className="bg-gradient-to-r from-market-down via-market-alert to-market-up h-3 rounded-full" style={{ width: `${optimizationData.score}%` }}></div>
        </div>
        
        <div className="flex justify-between text-xs text-dark-text-secondary">
          <span>Poor</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">CPU Health</p>
              <p className="text-2xl font-bold text-market-up">{optimizationData.systemHealth.cpu}%</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <Cpu className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Good performance
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Memory Health</p>
              <p className="text-2xl font-bold text-market-alert">{optimizationData.systemHealth.memory}%</p>
            </div>
            <div className="p-3 bg-market-alert/10 rounded-full">
              <MemoryStick className="w-6 h-6 text-market-alert" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Needs attention
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Disk Health</p>
              <p className="text-2xl font-bold text-market-up">{optimizationData.systemHealth.disk}%</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <HardDrive className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Excellent
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Network Health</p>
              <p className="text-2xl font-bold text-market-up">{optimizationData.systemHealth.network}%</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <Wifi className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Good connection
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Optimization Recommendations</h3>
        <div className="space-y-4">
          {optimizationData.recommendations.map((rec: any) => (
            <div key={rec.id} className="p-4 bg-dark-bg-secondary rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    rec.status === 'completed' ? 'bg-market-up/10' : 'bg-market-alert/10'
                  }`}>
                    {rec.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-market-up" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-market-alert" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-dark-text">{rec.title}</h4>
                    <p className="text-sm text-dark-text-secondary">{rec.description}</p>
                  </div>
                </div>
                
                {rec.status === 'pending' && (
                  <button
                    onClick={() => handleRunOptimization(rec.id)}
                    disabled={runningOptimization}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    {runningOptimization ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>{runningOptimization ? 'Running...' : 'Run'}</span>
                  </button>
                )}
                
                {rec.status === 'completed' && (
                  <div className="flex items-center space-x-2 text-market-up">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-dark-text-secondary">Impact:</span>
                  <span className={`ml-2 font-medium ${getImpactColor(rec.impact)}`}>
                    {rec.impact}
                  </span>
                </div>
                <div>
                  <span className="text-dark-text-secondary">Effort:</span>
                  <span className={`ml-2 font-medium ${getEffortColor(rec.effort)}`}>
                    {rec.effort}
                  </span>
                </div>
                <div>
                  <span className="text-dark-text-secondary">Improvement:</span>
                  <span className="ml-2 font-medium text-market-up">
                    +{rec.estimatedImprovement}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Optimizations */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Recent Optimizations</h3>
        <div className="space-y-3">
          {optimizationData.recentOptimizations.map((opt: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-dark-bg-secondary rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-market-up/10 rounded-full">
                  <CheckCircle className="w-4 h-4 text-market-up" />
                </div>
                <div>
                  <div className="text-sm font-medium text-dark-text">{opt.name}</div>
                  <div className="text-xs text-dark-text-secondary">{opt.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-market-up">+{opt.improvement}%</div>
                <div className="text-xs text-dark-text-secondary">improvement</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Optimization Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Run All</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analyze</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationTools;
