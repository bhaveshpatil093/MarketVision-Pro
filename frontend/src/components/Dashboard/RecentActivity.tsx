import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info,
  Clock,
  Zap
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'price_alert' | 'volume_spike' | 'anomaly' | 'system' | 'news';
  symbol?: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
}

const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'alerts' | 'anomalies' | 'system'>('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'price_alert',
        symbol: 'TSLA',
        message: 'Price dropped below $800 support level',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        priority: 'high',
        isRead: false
      },
      {
        id: '2',
        type: 'volume_spike',
        symbol: 'AAPL',
        message: 'Volume increased 150% above average',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        priority: 'medium',
        isRead: false
      },
      {
        id: '3',
        type: 'anomaly',
        symbol: 'GOOGL',
        message: 'Unusual price pattern detected',
        timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
        priority: 'high',
        isRead: true
      },
      {
        id: '4',
        type: 'system',
        message: 'WebSocket connection restored',
        timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
        priority: 'low',
        isRead: true
      },
      {
        id: '5',
        type: 'news',
        symbol: 'MSFT',
        message: 'Earnings announcement in 30 minutes',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        priority: 'medium',
        isRead: false
      },
      {
        id: '6',
        type: 'price_alert',
        symbol: 'AMZN',
        message: 'Price broke above $3200 resistance',
        timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        priority: 'medium',
        isRead: true
      }
    ];

    setActivities(mockActivities);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'price_alert':
        return <TrendingDown className="w-4 h-4 text-market-down" />;
      case 'volume_spike':
        return <Zap className="w-4 h-4 text-market-alert" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4 text-market-down" />;
      case 'system':
        return <Info className="w-4 h-4 text-market-info" />;
      case 'news':
        return <Bell className="w-4 h-4 text-market-up" />;
      default:
        return <Info className="w-4 h-4 text-dark-text-secondary" />;
    }
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-market-down';
      case 'medium':
        return 'border-l-market-alert';
      case 'low':
        return 'border-l-market-info';
      default:
        return 'border-l-dark-border';
    }
  };

  const getPriorityText = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'alerts') return ['price_alert', 'volume_spike'].includes(activity.type);
    if (filter === 'anomalies') return activity.type === 'anomaly';
    if (filter === 'system') return ['system', 'news'].includes(activity.type);
    return true;
  });

  const markAsRead = (id: string) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id ? { ...activity, isRead: true } : activity
      )
    );
  };

  const unreadCount = activities.filter(activity => !activity.isRead).length;

  return (
    <div className="market-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-market-info" />
          <h3 className="text-lg font-semibold text-dark-text">Recent Activity</h3>
          {unreadCount > 0 && (
            <span className="bg-market-down text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-4 p-1 bg-dark-bg-secondary rounded-lg">
        {[
          { key: 'all', label: 'All' },
          { key: 'alerts', label: 'Alerts' },
          { key: 'anomalies', label: 'Anomalies' },
          { key: 'system', label: 'System' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              filter === key
                ? 'bg-market-info text-white'
                : 'text-dark-text-secondary hover:text-dark-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-dark-text-secondary">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activities to show</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div
              key={activity.id}
              className={`p-3 rounded-lg border-l-4 transition-all duration-200 cursor-pointer hover:bg-dark-bg-secondary ${
                getPriorityColor(activity.priority)
              } ${!activity.isRead ? 'bg-dark-bg-secondary/50' : ''}`}
              onClick={() => markAsRead(activity.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {activity.symbol && (
                        <span className="text-sm font-semibold text-dark-text bg-dark-bg-secondary px-2 py-1 rounded">
                          {activity.symbol}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.priority === 'high' ? 'bg-market-down/20 text-market-down' :
                        activity.priority === 'medium' ? 'bg-market-alert/20 text-market-alert' :
                        'bg-market-info/20 text-market-info'
                      }`}>
                        {getPriorityText(activity.priority)}
                      </span>
                    </div>
                    
                    <span className="text-xs text-dark-text-secondary">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className={`text-sm ${activity.isRead ? 'text-dark-text-secondary' : 'text-dark-text'}`}>
                    {activity.message}
                  </p>
                  
                  {!activity.isRead && (
                    <div className="mt-2">
                      <div className="w-2 h-2 bg-market-down rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-dark-border">
        <div className="flex items-center justify-between text-sm text-dark-text-secondary">
          <span>{filteredActivities.length} activities</span>
          <button className="text-market-info hover:text-market-info/80 transition-colors">
            View All
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
