import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  RefreshCw,
  Palette,
  Bell,
  Database,
  Shield,
  Wifi
} from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

const Settings: React.FC = () => {
  const { isConnected, latency } = useWebSocket();
  const { isOnline } = useConnectionStatus();
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'data' | 'security' | 'advanced'>('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & API', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'advanced', label: 'Advanced', icon: Wifi }
  ];

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    autoRefresh: true,
    refreshInterval: 5000,
    defaultTimeframe: '5m',
    maxSymbols: 50,
    enableSounds: false,
    enableHaptic: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    fontSize: 'medium',
    chartTheme: 'dark',
    showGrid: true,
    showAnimations: true,
    compactMode: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    priceAlerts: true,
    volumeSpikes: true,
    anomalyDetection: true,
    systemAlerts: true,
    emailNotifications: false,
    pushNotifications: true
  });

  const [dataSettings, setDataSettings] = useState({
    dataRetention: 30,
    maxDataPoints: 10000,
    enableCompression: true,
    backupFrequency: 'daily',
    exportFormat: 'csv'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 3600,
    requirePassword: true,
    logActivity: true,
    encryptData: true
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    enableDebug: false,
    logLevel: 'info',
    maxConnections: 100,
    enableMetrics: true,
    autoOptimize: true
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as typeof activeTab);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // Show success message
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    // Reset to default settings
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setGeneralSettings({
        autoRefresh: true,
        refreshInterval: 5000,
        defaultTimeframe: '5m',
        maxSymbols: 50,
        enableSounds: false,
        enableHaptic: false
      });
      setAppearanceSettings({
        theme: 'dark',
        fontSize: 'medium',
        chartTheme: 'dark',
        showGrid: true,
        showAnimations: true,
        compactMode: false
      });
      setNotificationSettings({
        priceAlerts: true,
        volumeSpikes: true,
        anomalyDetection: true,
        systemAlerts: true,
        emailNotifications: false,
        pushNotifications: true
      });
      setDataSettings({
        dataRetention: 30,
        maxDataPoints: 10000,
        enableCompression: true,
        backupFrequency: 'daily',
        exportFormat: 'csv'
      });
      setSecuritySettings({
        twoFactorAuth: false,
        sessionTimeout: 3600,
        requirePassword: true,
        logActivity: true,
        encryptData: true
      });
      setAdvancedSettings({
        enableDebug: false,
        logLevel: 'info',
        maxConnections: 100,
        enableMetrics: true,
        autoOptimize: true
      });
      alert('Settings reset to defaults!');
    }
  };

  const handleExport = () => {
    // Export settings
    const settingsData = {
      general: generalSettings,
      appearance: appearanceSettings,
      notifications: notificationSettings,
      data: dataSettings,
      security: securitySettings,
      advanced: advancedSettings,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(settingsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marketvision-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('Settings exported successfully!');
  };

  const handleImport = () => {
    // Import settings
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settingsData = JSON.parse(e.target?.result as string);
            if (settingsData.general) setGeneralSettings(settingsData.general);
            if (settingsData.appearance) setAppearanceSettings(settingsData.appearance);
            if (settingsData.notifications) setNotificationSettings(settingsData.notifications);
            if (settingsData.data) setDataSettings(settingsData.data);
            if (settingsData.security) setSecuritySettings(settingsData.security);
            if (settingsData.advanced) setAdvancedSettings(settingsData.advanced);
            alert('Settings imported successfully!');
          } catch (error) {
            alert('Error importing settings. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Settings</h1>
          <p className="text-dark-text-secondary mt-2">
            Configure application preferences and system settings
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
              <Wifi className="w-4 h-4" />
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-3">
          <div className="market-card">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-dark-text">General Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Auto-refresh</label>
                      <p className="text-xs text-dark-text-secondary">Automatically refresh market data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.autoRefresh}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Refresh Interval</label>
                      <p className="text-xs text-dark-text-secondary">How often to refresh data (milliseconds)</p>
                    </div>
                    <select
                      value={generalSettings.refreshInterval}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, refreshInterval: Number(e.target.value) }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text"
                    >
                      <option value={1000}>1 second</option>
                      <option value={5000}>5 seconds</option>
                      <option value={10000}>10 seconds</option>
                      <option value={30000}>30 seconds</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Default Timeframe</label>
                      <p className="text-xs text-dark-text-secondary">Default chart timeframe</p>
                    </div>
                    <select
                      value={generalSettings.defaultTimeframe}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, defaultTimeframe: e.target.value }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text"
                    >
                      <option value="1m">1 minute</option>
                      <option value="5m">5 minutes</option>
                      <option value="15m">15 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="1d">1 day</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Max Symbols</label>
                      <p className="text-xs text-dark-text-secondary">Maximum number of symbols to track</p>
                    </div>
                    <input
                      type="number"
                      value={generalSettings.maxSymbols}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, maxSymbols: Number(e.target.value) }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text w-20"
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-dark-text">Appearance Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Theme</label>
                      <p className="text-xs text-dark-text-secondary">Application color scheme</p>
                    </div>
                    <select
                      value={appearanceSettings.theme}
                      onChange={(e) => setAppearanceSettings(prev => ({ ...prev, theme: e.target.value }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Font Size</label>
                      <p className="text-xs text-dark-text-secondary">Text size preference</p>
                    </div>
                    <select
                      value={appearanceSettings.fontSize}
                      onChange={(e) => setAppearanceSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Show Grid</label>
                      <p className="text-xs text-dark-text-secondary">Display grid lines on charts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appearanceSettings.showGrid}
                        onChange={(e) => setAppearanceSettings(prev => ({ ...prev, showGrid: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Show Animations</label>
                      <p className="text-xs text-dark-text-secondary">Enable smooth transitions and animations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appearanceSettings.showAnimations}
                        onChange={(e) => setAppearanceSettings(prev => ({ ...prev, showAnimations: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-dark-text">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Price Alerts</label>
                      <p className="text-xs text-dark-text-secondary">Notify when prices reach target levels</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.priceAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, priceAlerts: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Volume Spikes</label>
                      <p className="text-xs text-dark-text-secondary">Alert on unusual volume activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.volumeSpikes}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, volumeSpikes: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Anomaly Detection</label>
                      <p className="text-xs text-dark-text-secondary">AI-powered anomaly alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.anomalyDetection}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, anomalyDetection: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Push Notifications</label>
                      <p className="text-xs text-dark-text-secondary">Browser push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-dark-text">Data & API Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Data Retention</label>
                      <p className="text-xs text-dark-text-secondary">How long to keep historical data (days)</p>
                    </div>
                    <select
                      value={dataSettings.dataRetention}
                      onChange={(e) => setDataSettings(prev => ({ ...prev, dataRetention: Number(e.target.value) }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Max Data Points</label>
                      <p className="text-xs text-dark-text-secondary">Maximum data points per chart</p>
                    </div>
                    <input
                      type="number"
                      value={dataSettings.maxDataPoints}
                      onChange={(e) => setDataSettings(prev => ({ ...prev, maxDataPoints: Number(e.target.value) }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text w-24"
                      min="1000"
                      max="100000"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Enable Compression</label>
                      <p className="text-xs text-dark-text-secondary">Compress data for storage efficiency</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dataSettings.enableCompression}
                        onChange={(e) => setDataSettings(prev => ({ ...prev, enableCompression: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Export Format</label>
                      <p className="text-xs text-dark-text-secondary">Default export file format</p>
                    </div>
                    <select
                      value={dataSettings.exportFormat}
                      onChange={(e) => setDataSettings(prev => ({ ...prev, exportFormat: e.target.value }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text"
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                      <option value="xlsx">Excel</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-dark-text">Security Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Two-Factor Authentication</label>
                      <p className="text-xs text-dark-text-secondary">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Session Timeout</label>
                      <p className="text-xs text-dark-text-secondary">Auto-logout after inactivity (seconds)</p>
                    </div>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text"
                    >
                      <option value={1800}>30 minutes</option>
                      <option value={3600}>1 hour</option>
                      <option value={7200}>2 hours</option>
                      <option value={86400}>24 hours</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Log Activity</label>
                      <p className="text-xs text-dark-text-secondary">Track user actions for security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.logActivity}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, logActivity: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Encrypt Data</label>
                      <p className="text-xs text-dark-text-secondary">Encrypt sensitive data at rest</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.encryptData}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, encryptData: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-dark-text">Advanced Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Debug Mode</label>
                      <p className="text-xs text-dark-text-secondary">Enable detailed logging and debugging</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedSettings.enableDebug}
                        onChange={(e) => setAdvancedSettings(prev => ({ ...prev, enableDebug: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Log Level</label>
                      <p className="text-xs text-dark-text-secondary">Application logging verbosity</p>
                    </div>
                    <select
                      value={advancedSettings.logLevel}
                      onChange={(e) => setAdvancedSettings(prev => ({ ...prev, logLevel: e.target.value }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text"
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Max Connections</label>
                      <p className="text-xs text-dark-text-secondary">Maximum concurrent connections</p>
                    </div>
                    <input
                      type="number"
                      value={advancedSettings.maxConnections}
                      onChange={(e) => setAdvancedSettings(prev => ({ ...prev, maxConnections: Number(e.target.value) }))}
                      className="bg-dark-bg-secondary border border-dark-border rounded px-3 py-2 text-sm text-dark-text w-20"
                      min="10"
                      max="1000"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-dark-text">Auto-optimize</label>
                      <p className="text-xs text-dark-text-secondary">Automatically optimize performance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={advancedSettings.autoOptimize}
                        onChange={(e) => setAdvancedSettings(prev => ({ ...prev, autoOptimize: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-market-info rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-market-info"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1">
          <div className="market-card">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
              
              <button
                onClick={handleReset}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </button>
              
              <button
                onClick={handleExport}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Settings</span>
              </button>
              
              <button
                onClick={handleImport}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import Settings</span>
              </button>
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="market-card mt-6">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Current Settings</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-dark-text-secondary">Theme:</span>
                <span className="text-dark-text capitalize">{appearanceSettings.theme}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-dark-text-secondary">Auto-refresh:</span>
                <span className={`${generalSettings.autoRefresh ? 'text-market-up' : 'text-market-down'}`}>
                  {generalSettings.autoRefresh ? 'On' : 'Off'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-dark-text-secondary">Notifications:</span>
                <span className="text-dark-text">
                  {Object.values(notificationSettings).filter(Boolean).length} enabled
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-dark-text-secondary">Debug Mode:</span>
                <span className={`${advancedSettings.enableDebug ? 'text-market-up' : 'text-market-down'}`}>
                  {advancedSettings.enableDebug ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
