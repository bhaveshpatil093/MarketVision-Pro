import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  MessageSquare, 
  TrendingUp,
  RefreshCw,
  Settings
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const WebSocketMetrics: React.FC = () => {
  const [wsData, setWsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const mockWsData = {
        connections: {
          total: 1250,
          active: 1180,
          disconnected: 70,
          max: 2000,
          history: [
            { time: '00:00', total: 1200, active: 1150, disconnected: 50 },
            { time: '06:00', total: 1250, active: 1180, disconnected: 70 },
            { time: '12:00', total: 1500, active: 1420, disconnected: 80 },
            { time: '18:00', total: 1400, active: 1320, disconnected: 80 },
            { time: '22:00', total: 1300, active: 1220, disconnected: 80 }
          ]
        },
        messages: {
          sent: 2500000,
          received: 2480000,
          failed: 20000,
          avgLatency: 15,
          history: [
            { time: '00:00', sent: 2000, received: 1980, latency: 12 },
            { time: '06:00', total: 2500, received: 2480, latency: 15 },
            { time: '12:00', total: 3500, received: 3450, latency: 18 },
            { time: '18:00', total: 3200, received: 3180, latency: 16 },
            { time: '22:00', total: 2800, received: 2780, latency: 14 }
          ]
        },
        performance: {
          uptime: 99.95,
          errorRate: 0.05,
          avgResponseTime: 15,
          throughput: 2500
        }
      };
      
      setWsData(mockWsData);
      setLoading(false);
    }, 1000);
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Active Connections</p>
              <p className="text-2xl font-bold text-market-up">{wsData.connections.active}</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <Wifi className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            of {wsData.connections.total} total
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Avg Latency</p>
              <p className="text-2xl font-bold text-market-up">{wsData.messages.avgLatency}ms</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <MessageSquare className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Fast response
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Uptime</p>
              <p className="text-2xl font-bold text-market-up">{wsData.performance.uptime}%</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Excellent reliability
          </div>
        </div>

        <div className="market-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-text-secondary">Error Rate</p>
              <p className="text-2xl font-bold text-market-up">{wsData.performance.errorRate}%</p>
            </div>
            <div className="p-3 bg-market-up/10 rounded-full">
              <MessageSquare className="w-6 h-6 text-market-up" />
            </div>
          </div>
          <div className="mt-2 text-sm text-dark-text-secondary">
            Very low
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Connection History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={wsData.connections.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
              <YAxis stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Total Connections" />
              <Area type="monotone" dataKey="active" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Active Connections" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="market-card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Message Throughput</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={wsData.messages.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
              <YAxis stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} name="Messages Sent" />
              <Line type="monotone" dataKey="received" stroke="#10B981" strokeWidth={2} name="Messages Received" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">WebSocket Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Stats</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Restart</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebSocketMetrics;
