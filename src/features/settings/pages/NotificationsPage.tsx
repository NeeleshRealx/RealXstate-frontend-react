import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, ToggleLeft, ToggleRight, Save, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import Breadcrumbs from '@/features/settings/components/Breadcrumbs';

interface NotificationSettings {
  email: {
    newOrders: boolean;
    orderUpdates: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    systemAlerts: boolean;
  };
  sms: {
    newOrders: boolean;
    orderUpdates: boolean;
    urgentAlerts: boolean;
  };
  inApp: {
    newOrders: boolean;
    orderUpdates: boolean;
    systemAlerts: boolean;
    menuChanges: boolean;
    tableAssignments: boolean;
  };
}

interface NotificationHistory {
  id: string;
  type: 'order' | 'system' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

const NotificationsPage = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      newOrders: true,
      orderUpdates: true,
      dailyReports: false,
      weeklyReports: true,
      systemAlerts: true,
    },
    sms: {
      newOrders: true,
      orderUpdates: false,
      urgentAlerts: true,
    },
    inApp: {
      newOrders: true,
      orderUpdates: true,
      systemAlerts: true,
      menuChanges: false,
      tableAssignments: true,
    },
  });

  const [notificationHistory] = useState<NotificationHistory[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #1234 has been placed for Table 5',
      timestamp: '2 minutes ago',
      read: false,
      priority: 'high',
    },
    {
      id: '2',
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2 AM',
      timestamp: '1 hour ago',
      read: true,
      priority: 'medium',
    },
    {
      id: '3',
      type: 'alert',
      title: 'Low Inventory Alert',
      message: 'Chicken breast is running low (5 items remaining)',
      timestamp: '3 hours ago',
      read: false,
      priority: 'high',
    },
    {
      id: '4',
      type: 'order',
      title: 'Order Updated',
      message: 'Order #1230 has been modified by customer',
      timestamp: '5 hours ago',
      read: true,
      priority: 'medium',
    },
    {
      id: '5',
      type: 'system',
      title: 'Backup Completed',
      message: 'Daily backup has been completed successfully',
      timestamp: '1 day ago',
      read: true,
      priority: 'low',
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');

  const breadcrumbItems = [
    { label: 'Settings', path: '/settings' },
    { label: 'Notifications' },
  ];

  const handleToggle = (category: keyof NotificationSettings, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]],
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSuccessMessage('Notification settings saved successfully!');
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Bell className="w-4 h-4 text-blue-600" />;
      case 'system':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const unreadCount = notificationHistory.filter(n => !n.read).length;

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Manage your notification preferences and view notification history.</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notification Settings
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Notification History
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(settings.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {key === 'newOrders' && 'Get notified when new orders are placed'}
                        {key === 'orderUpdates' && 'Receive updates when orders are modified'}
                        {key === 'dailyReports' && 'Daily summary of restaurant activities'}
                        {key === 'weeklyReports' && 'Weekly analytics and insights'}
                        {key === 'systemAlerts' && 'Important system notifications'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle('email', key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">SMS Notifications</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(settings.sms).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {key === 'newOrders' && 'SMS alerts for new orders'}
                        {key === 'orderUpdates' && 'SMS updates for order changes'}
                        {key === 'urgentAlerts' && 'Critical alerts via SMS'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle('sms', key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Bell className="w-5 h-5 mr-2 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">In-App Notifications</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(settings.inApp).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {key === 'newOrders' && 'Real-time notifications for new orders'}
                        {key === 'orderUpdates' && 'Updates when orders are modified'}
                        {key === 'systemAlerts' && 'System notifications and alerts'}
                        {key === 'menuChanges' && 'Notifications when menu items are updated'}
                        {key === 'tableAssignments' && 'Table assignment notifications'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle('inApp', key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Notification History</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {notificationHistory.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              notification.priority
                            )}`}
                          >
                            {notification.priority}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {notification.timestamp}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {notificationHistory.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
