import React from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

const ConnectionStatus: React.FC = () => {
  const { isOnline, connectionType, downlink, rtt } = useConnectionStatus();
  const { isConnected, latency, connectionStatus, isMockMode } = useWebSocket();

  const getStatusIcon = () => {
    if (isMockMode) {
      return <Database className="w-5 h-5 text-market-alert" />;
    }
    
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
    if (isMockMode) {
      return 'text-market-alert';
    }
    
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
    if (isMockMode) {
      return 'Simulated data mode - All features fully functional';
    }
    
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
    if (isMockMode) {
      return [
        '✅ Simulated data mode is active - all features are working perfectly',
        '💡 To connect to real backend:',
        '   1. Start the backend server (python main.py)',
        '   2. Refresh this page',
        '   3. The app will automatically switch to real-time mode',
        '🎯 You can continue using all features with simulated data'
      ];
    }
    
    if (connectionStatus === 'error') {
      return [
        '🔧 Troubleshooting steps:',
        '1. Ensure the backend server is running (python main.py)',
        '2. Check if port 8000 is available',
        '3. Verify firewall settings',
        '4. Check backend logs for errors',
        '💡 The app will automatically use mock data if backend is unavailable'
      ];
    }
    if (connectionStatus === 'connecting') {
      return [
        '⏳ Backend is starting up...',
        'Please wait a few moments',
        'Check backend terminal for any error messages'
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
              isMockMode ? 'bg-market-alert' :
              connectionStatus === 'connected' ? 'bg-market-up' : 
              connectionStatus === 'connecting' ? 'bg-market-alert' : 
              connectionStatus === 'error' ? 'bg-market-down' : 'bg-dark-text-secondary'
            }`}></div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {isMockMode ? 'Simulated Mode' :
               connectionStatus === 'connected' ? 'Connected' : 
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

        {/* Latency */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-text-secondary">Latency:</span>
          <span className={`text-sm font-medium ${latency < 100 ? 'text-market-up' : latency < 200 ? 'text-market-alert' : 'text-market-down'}`}>
            {latency}ms {isMockMode && '(simulated)'}
          </span>
        </div>
      </div>

      {/* Status Description */}
      <div className="mt-4 p-3 bg-dark-bg-secondary rounded-lg">
        <p className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </p>
      </div>

      {/* Connection Details */}
      {connectionStatus === 'connected' && (
        <>
          <div className="mt-4 space-y-2">
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
          </div>
        </>
      )}

      {/* Troubleshooting Steps */}
      {getTroubleshootingSteps().length > 0 && (
        <div className="mt-4 p-3 bg-dark-bg-secondary rounded-lg">
          <h4 className="text-sm font-medium text-dark-text mb-2">
            {isMockMode ? 'Mock Mode Active' : 'Troubleshooting'}
          </h4>
          <ul className="space-y-1">
            {getTroubleshootingSteps().map((step, index) => (
              <li key={index} className="text-xs text-dark-text-secondary">
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mock Mode Info */}
      {isMockMode && (
        <div className="mt-4 p-3 bg-market-alert/10 border border-market-alert/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-4 h-4 text-market-alert" />
            <span className="text-sm font-medium text-market-alert">Simulated Data Mode</span>
          </div>
          <p className="text-xs text-dark-text-secondary">
            All features are fully functional with high-quality simulated data. Perfect for testing and demonstration. Connect to the backend for real-time market data.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
