import React, { useState } from 'react';
import { Puzzle, CreditCard, MessageSquare, Database, Zap, CheckCircle, XCircle, ExternalLink, Settings, RefreshCw } from 'lucide-react';
import Breadcrumbs from '@/features/settings/components/Breadcrumbs';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'pos' | 'payment' | 'communication' | 'analytics' | 'inventory';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  icon: string;
  color: string;
  lastSync?: string;
  configUrl?: string;
  docsUrl?: string;
}

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'square-pos',
      name: 'Square POS',
      description: 'Point of sale system for order management and payments',
      category: 'pos',
      status: 'connected',
      icon: '💳',
      color: 'text-green-600',
      lastSync: '2 minutes ago',
      configUrl: '/integrations/square/config',
      docsUrl: 'https://developer.squareup.com/docs'
    },
    {
      id: 'stripe-payments',
      name: 'Stripe Payments',
      description: 'Online payment processing and subscription management',
      category: 'payment',
      status: 'connected',
      icon: '💳',
      color: 'text-blue-600',
      lastSync: '5 minutes ago',
      configUrl: '/integrations/stripe/config',
      docsUrl: 'https://stripe.com/docs'
    },
    {
      id: 'zendesk-chat',
      name: 'Zendesk Chat',
      description: 'Customer support and live chat integration',
      category: 'communication',
      status: 'connected',
      icon: '💬',
      color: 'text-purple-600',
      lastSync: '1 hour ago',
      configUrl: '/integrations/zendesk/config',
      docsUrl: 'https://developer.zendesk.com/docs'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Accounting and financial management integration',
      category: 'analytics',
      status: 'disconnected',
      icon: '📊',
      color: 'text-green-600',
      configUrl: '/integrations/quickbooks/config',
      docsUrl: 'https://developer.intuit.com/docs'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'E-commerce platform for online ordering',
      category: 'pos',
      status: 'pending',
      icon: '🛒',
      color: 'text-green-600',
      configUrl: '/integrations/shopify/config',
      docsUrl: 'https://shopify.dev/docs'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Alternative payment gateway for online transactions',
      category: 'payment',
      status: 'disconnected',
      icon: '💳',
      color: 'text-blue-600',
      configUrl: '/integrations/paypal/config',
      docsUrl: 'https://developer.paypal.com/docs'
    },
    {
      id: 'intercom',
      name: 'Intercom',
      description: 'Customer messaging and support platform',
      category: 'communication',
      status: 'error',
      icon: '💬',
      color: 'text-blue-600',
      lastSync: '3 hours ago',
      configUrl: '/integrations/intercom/config',
      docsUrl: 'https://developers.intercom.com/docs'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Website and app analytics tracking',
      category: 'analytics',
      status: 'connected',
      icon: '📈',
      color: 'text-blue-600',
      lastSync: '30 minutes ago',
      configUrl: '/integrations/analytics/config',
      docsUrl: 'https://developers.google.com/analytics'
    }
  ]);

  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const breadcrumbItems = [
    { label: 'Settings', path: '/settings' },
    { label: 'Integrations' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(integrationId);
    setErrorMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'connected' as const, lastSync: 'Just now' }
            : integration
        )
      );
      setSuccessMessage(`${integrations.find(i => i.id === integrationId)?.name} connected successfully!`);
      setIsConnecting(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 2000);
  };

  const handleDisconnect = async (integrationId: string) => {
    setIsDisconnecting(integrationId);
    setErrorMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'disconnected' as const, lastSync: undefined }
            : integration
        )
      );
      setSuccessMessage(`${integrations.find(i => i.id === integrationId)?.name} disconnected successfully!`);
      setIsDisconnecting(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const handleRetry = async (integrationId: string) => {
    setIsConnecting(integrationId);
    setErrorMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'connected' as const, lastSync: 'Just now' }
            : integration
        )
      );
      setSuccessMessage(`${integrations.find(i => i.id === integrationId)?.name} reconnected successfully!`);
      setIsConnecting(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 2000);
  };

  const categories = [
    { id: 'all', name: 'All Integrations', count: integrations.length },
    { id: 'pos', name: 'POS Systems', count: integrations.filter(i => i.category === 'pos').length },
    { id: 'payment', name: 'Payment Gateways', count: integrations.filter(i => i.category === 'payment').length },
    { id: 'communication', name: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect your restaurant with third-party services and tools.</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(integration.status)}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      integration.status
                    )}`}
                  >
                    {integration.status}
                  </span>
                </div>
              </div>

              {integration.lastSync && (
                <div className="mb-4 text-sm text-gray-500">
                  Last sync: {integration.lastSync}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {integration.status === 'connected' && (
                    <>
                      <button
                        onClick={() => integration.configUrl && window.open(integration.configUrl, '_blank')}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        disabled={isDisconnecting === integration.id}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
                      >
                        {isDisconnecting === integration.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          'Disconnect'
                        )}
                      </button>
                    </>
                  )}
                  {integration.status === 'disconnected' && (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      disabled={isConnecting === integration.id}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
                    >
                      {isConnecting === integration.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                  {integration.status === 'error' && (
                    <button
                      onClick={() => handleRetry(integration.id)}
                      disabled={isConnecting === integration.id}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 disabled:opacity-50"
                    >
                      {isConnecting === integration.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </>
                      )}
                    </button>
                  )}
                  {integration.status === 'pending' && (
                    <div className="text-xs text-yellow-600">
                      <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />
                      Connecting...
                    </div>
                  )}
                </div>

                {integration.docsUrl && (
                  <button
                    onClick={() => window.open(integration.docsUrl, '_blank')}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <Puzzle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No integrations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCategory === 'all' 
                ? 'No integrations are available at the moment.'
                : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} integrations found.`
              }
            </p>
          </div>
        )}

        {/* Integration Benefits */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Why Integrate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Automation</h3>
              <p className="text-sm text-gray-500">Automate repetitive tasks and streamline your workflow</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Data Sync</h3>
              <p className="text-sm text-gray-500">Keep your data synchronized across all platforms</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Better Communication</h3>
              <p className="text-sm text-gray-500">Improve customer communication and support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
