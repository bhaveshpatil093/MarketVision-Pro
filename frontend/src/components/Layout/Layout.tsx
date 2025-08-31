import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Settings, 
  Menu, 
  X,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';

import { useWebSocket } from '../../hooks/useWebSocket';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isConnected, latency, connectionStatus } = useWebSocket();
  const { isOnline } = useConnectionStatus();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Market Data', href: '/market-data', icon: TrendingUp },
    { name: 'Analytics', href: '/analytics', icon: Activity },
    { name: 'Performance', href: '/performance', icon: Zap },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-dark-card border-r border-dark-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-dark-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-market-up to-market-info rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-dark-text">MarketVision Pro</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-dark-text-secondary hover:text-dark-text hover:bg-dark-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive 
                      ? 'bg-dark-accent text-white' 
                      : 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-border'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-dark-text-secondary group-hover:text-dark-text'}
                  `} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Connection Status */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-dark-text-secondary">Connection Status</span>
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-market-up" />
                ) : (
                  <WifiOff className="w-4 h-4 text-market-down" />
                )}
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-market-up' : 
                  connectionStatus === 'connecting' ? 'bg-market-alert' : 
                  connectionStatus === 'error' ? 'bg-market-down' : 'bg-dark-text-secondary'
                }`}></div>
              </div>
            </div>
            <div className="text-xs text-dark-text-secondary">
              {connectionStatus === 'connected' ? (
                <span>WebSocket: {latency}ms</span>
              ) : connectionStatus === 'connecting' ? (
                <span>WebSocket: Connecting...</span>
              ) : connectionStatus === 'error' ? (
                <span>WebSocket: Connection Error</span>
              ) : (
                <span>WebSocket: Disconnected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-dark-card border-b border-dark-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-dark-text-secondary hover:text-dark-text hover:bg-dark-border"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-dark-text">
                {navigation.find(item => isActiveRoute(item.href))?.name || 'MarketVision Pro'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-market-up' : 
                  connectionStatus === 'connecting' ? 'bg-market-alert' : 
                  connectionStatus === 'error' ? 'bg-market-down' : 'bg-dark-text-secondary'
                }`}></div>
                <span className={`${
                  connectionStatus === 'connected' ? 'text-market-up' : 
                  connectionStatus === 'connecting' ? 'text-market-alert' : 
                  connectionStatus === 'error' ? 'text-market-down' : 'text-dark-text-secondary'
                }`}>
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 
                   connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
                </span>
                {connectionStatus === 'connected' && (
                  <span className="text-dark-text-secondary">({latency}ms)</span>
                )}
              </div>
              
              {/* Performance indicator */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-dark-text-secondary">
                <div className="w-2 h-2 bg-market-up rounded-full animate-pulse"></div>
                <span>System: Optimal</span>
              </div>
              
              {/* User menu placeholder */}
              <div className="w-8 h-8 bg-dark-border rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-dark-text">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
