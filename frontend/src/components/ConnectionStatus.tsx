import React from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

const ConnectionStatus: React.FC = () => {
  const { isConnected, latency, connectionStatus } = useWebSocket();
  const { isOnline, connectionType, downlink, rtt } = useConnectionStatus();

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-market-up" />;
      case 'connecting':
        return <Clock className="w-5 h-5 text-market-alert" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-market-down" />;
      default:
        return <WifiOff className="w-5 h-5 text-dark-text-secondary" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-market-up';
      case 'connecting':
        return 'text-market-alert';
      case 'error':
        return 'text-market-down';
      default:
        return 'text-dark-text-secondary';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to MarketVision Pro Backend';
      case 'connecting':
        return 'Connecting to backend...';
      case 'error':
        return 'Connection failed. Backend may not be running.';
      default:
        return 'Disconnected from backend';
    }
  };

  const getTroubleshootingSteps = () => {
    if (connectionStatus === 'error') {
      return [
        '1. Ensure the backend server is running (./start_backend.sh)',
        '2. Check if port 8000 is available',
        '3. Verify firewall settings',
        '4. Check backend logs for errors'
      ];
    }
    if (connectionStatus === 'connecting') {
      return [
        '1. Backend is starting up...',
        '2. Please wait a few moments',
        '3. Check backend terminal for any error messages'
      ];
    }
    return [];
  };

  return (
    <div className="market-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-text">Connection Status</h3>
        {getStatusIcon()}
      </div>

      {/* WebSocket Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-text-secondary">Backend Connection:</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-market-up' : 
              connectionStatus === 'connecting' ? 'bg-market-alert' : 
              connectionStatus === 'error' ? 'bg-market-down' : 'bg-dark-text-secondary'
            }`}></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 
               connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-text-secondary">Network Status:</span>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-market-up" />
            ) : (
              <WifiOff className="w-4 h-4 text-market-down" />
            )}
            <span className={`text-sm font-medium ${isOnline ? 'text-market-up' : 'text-market-down'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Connection Details */}
        {connectionStatus === 'connected' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-text-secondary">Latency:</span>
              <span className="text-sm font-medium text-dark-text">{latency}ms</span>
            </div>
            
            {connectionType && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-text-secondary">Connection Type:</span>
                <span className="text-sm font-medium text-dark-text">{connectionType}</span>
              </div>
            )}
            
            {downlink && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-text-secondary">Download Speed:</span>
                <span className="text-sm font-medium text-dark-text">{downlink.toFixed(1)} Mbps</span>
              </div>
            )}
            
            {rtt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-text-secondary">Network RTT:</span>
                <span className="text-sm font-medium text-dark-text">{rtt}ms</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Message */}
      <div className="mt-4 p-3 rounded-lg bg-dark-bg-secondary">
        <p className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </p>
      </div>

      {/* Troubleshooting Steps */}
      {getTroubleshootingSteps().length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-dark-bg-secondary border-l-4 border-market-alert">
          <h4 className="text-sm font-medium text-dark-text mb-2">Troubleshooting Steps:</h4>
          <ul className="space-y-1">
            {getTroubleshootingSteps().map((step, index) => (
              <li key={index} className="text-xs text-dark-text-secondary">{step}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => window.open('http://localhost:8000/health', '_blank')}
          className="px-3 py-2 text-xs bg-market-info text-white rounded-md hover:bg-market-info/80 transition-colors"
        >
          Check Backend Health
        </button>
        <button
          onClick={() => window.open('http://localhost:8000/docs', '_blank')}
          className="px-3 py-2 text-xs bg-market-info text-white rounded-md hover:bg-market-info/80 transition-colors"
        >
          View API Docs
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
