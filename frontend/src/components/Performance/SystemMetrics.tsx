import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Activity,
  TrendingUp,
  RefreshCw,
  Settings,
  AlertTriangle,
  Zap,
  Clock
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const SystemMetrics: React.FC = () => {
  const [systemData, setSystemData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'disk' | 'network'>('cpu');

  useEffect(() => {
    setTimeout(() => {
      const mockSystemData = {
        cpu: {
          current: 45,
          average: 42,
          max: 78,
          cores: 8,
          temperature: 65,
          history: [
            { time: '00:00', usage: 35, temp: 60 },
            { time: '06:00', usage: 38, temp: 62 },
            { time: '12:00', usage: 65, temp: 72 },
            { time: '18:00', usage: 55, temp: 69 },
            { time: '22:00', usage: 38, temp: 61 }
          ]
        },
        memory: {
          total: 32768,
          used: 24576,
          available: 8192,
          percentage: 75,
          history: [
            { time: '00:00', used: 22000, available: 10768 },
            { time: '06:00', used: 22500, available: 10268 },
            { time: '12:00', used: 25000, available: 7768 },
            { time: '18:00', used: 25200, available: 7568 },
            { time: '22:00', used: 24100, available: 8668 }
          ]
        },
        disk: {
          drives: [
            {
              name: 'System SSD',
              total: 512000,
              used: 256000,
              available: 256000,
              percentage: 50,
              readSpeed: 150,
              writeSpeed: 120
            }
          ]
        },
        network: {
          interfaces: [
            {
              name: 'eth0',
              ip: '192.168.1.100',
              status: 'up',
              rxBytes: 1024000000,
              txBytes: 512000000,
              rxSpeed: 15,
              txSpeed: 8
            }
          ],
          connections: 1250,
          activeConnections: 45
        }
      };
      
      setSystemData(mockSystemData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-market-down';
    if (percentage >= 75) return 'text-market-alert';
    return 'text-market-up';
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
      {/* Metric Selector */}
      <div className="market-card">
        <div className="flex space-x-2">
          {[
            { id: 'cpu', label: 'CPU', icon: Cpu },
            { id: 'memory', label: 'Memory', icon: MemoryStick },
            { id: 'disk', label: 'Disk', icon: HardDrive },
            { id: 'network', label: 'Network', icon: Activity }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedMetric(id as typeof selectedMetric)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedMetric === id
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

      {/* CPU Metrics */}
      {selectedMetric === 'cpu' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">CPU Usage</p>
                  <p className={`text-2xl font-bold ${getStatusColor(systemData.cpu.current)}`}>
                    {systemData.cpu.current}%
                  </p>
                </div>
                <div className="p-3 bg-market-info/10 rounded-full">
                  <Cpu className="w-6 h-6 text-market-info" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                {systemData.cpu.cores} cores • {systemData.cpu.temperature}°C
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Temperature</p>
                  <p className="text-2xl font-bold text-market-up">{systemData.cpu.temperature}°C</p>
                </div>
                <div className="p-3 bg-market-alert/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-market-alert" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Normal temperature
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Average Usage</p>
                  <p className="text-2xl font-bold text-dark-text">{systemData.cpu.average}%</p>
                </div>
                <div className="p-3 bg-market-info/10 rounded-full">
                  <Activity className="w-6 h-6 text-market-info" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Last 24 hours
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Peak Usage</p>
                  <p className="text-2xl font-bold text-market-down">{systemData.cpu.max}%</p>
                </div>
                <div className="p-3 bg-market-down/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-market-down" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Maximum recorded
              </div>
            </div>
          </div>

          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">CPU Usage History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={systemData.cpu.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <YAxis stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <Tooltip />
                <Line type="monotone" dataKey="usage" stroke="#3B82F6" strokeWidth={2} name="CPU Usage (%)" />
                <Line type="monotone" dataKey="temp" stroke="#EF4444" strokeWidth={2} name="Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Memory Metrics */}
      {selectedMetric === 'memory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Memory Usage</p>
                  <p className={`text-2xl font-bold ${getStatusColor(systemData.memory.percentage)}`}>
                    {systemData.memory.percentage}%
                  </p>
                </div>
                <div className="p-3 bg-market-info/10 rounded-full">
                  <MemoryStick className="w-6 h-6 text-market-info" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                {formatBytes(systemData.memory.used * 1024 * 1024)} / {formatBytes(systemData.memory.total * 1024 * 1024)}
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Available Memory</p>
                  <p className="text-2xl font-bold text-dark-text">
                    {formatBytes(systemData.memory.available * 1024 * 1024)}
                  </p>
                </div>
                <div className="p-3 bg-market-up/10 rounded-full">
                  <MemoryStick className="w-6 h-6 text-market-up" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                Free memory
              </div>
            </div>

            <div className="market-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark-text-secondary">Memory Pressure</p>
                  <p className={`text-2xl font-bold ${systemData.memory.percentage > 80 ? 'text-market-down' : 'text-market-up'}`}>
                    {systemData.memory.percentage > 80 ? 'High' : 'Normal'}
                  </p>
                </div>
                <div className="p-3 bg-market-alert/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-market-alert" />
                </div>
              </div>
              <div className="mt-2 text-sm text-dark-text-secondary">
                System load
              </div>
            </div>
          </div>

          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Memory Usage History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={systemData.memory.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <YAxis stroke="#94A3B8" fontSize={12} tick={{ fill: '#94A3B8' }} />
                <Tooltip />
                <Area type="monotone" dataKey="used" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Used Memory (MB)" />
                <Area type="monotone" dataKey="available" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Available Memory (MB)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="market-card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Metrics</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Optimize</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Schedule Tasks</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
