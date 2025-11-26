import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Clock,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { useBranchContext } from '@/contexts/BranchContext';
import { orderService } from '@/services/orderService';
import { tableService } from '@/services/tableService';
import { menuIntegrationService, MenuItem, MenuCategory } from '@/services/menuIntegrationService';
import { OrderItem, CreateOrderData } from '@/types/order';
import { Table as ApiTable } from '@/types/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ErrorPlaceholder from '@/components/ui/ErrorPlaceholder';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';
import { SkeletonLoader, SkeletonCard } from '@/components/ui/SkeletonLoader';
import ChatMessage from '@/features/orders/components/ChatMessage';
import QuickActionButtons from '@/features/orders/components/QuickActionButtons';
import MessageInput from '@/features/orders/components/MessageInput';
import OrderContextHeader from '@/features/orders/components/OrderContextHeader';
import ItemCustomizationModal from '@/features/orders/components/ItemCustomizationModal';
import OrderStatusIndicator from '@/features/orders/components/OrderStatusIndicator';

// Types for chat simulation
interface ChatMessageType {
  id: string;
  type: 'customer' | 'system';
  content: string;
  timestamp: Date;
  isNotification?: boolean;
}

interface OrderContext {
  branchId: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
}

const ManualOrderEntry: React.FC = () => {
  const { selectedBranch, branches, isLoadingBranches } = useBranchContext();
  
  // State management
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [orderContext, setOrderContext] = useState<OrderContext>({
    branchId: '',
    tableId: '',
    customerName: '',
    customerPhone: ''
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [kitchenNote, setKitchenNote] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [discount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Show Menu');
  const [showMenuItems, setShowMenuItems] = useState(false);
  const [showOpenOrders, setShowOpenOrders] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [isLoadingOpenOrders, setIsLoadingOpenOrders] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Load tables when branch changes
  useEffect(() => {
    if (!selectedBranch) return;

    const loadTables = async () => {
      try {
        const response = await tableService.getTables(selectedBranch.id.toString());
        if (response.success && response.data && response.data.tables) {
          setTables(response.data.tables);
        }
      } catch (err) {
        console.error('Error loading tables:', err);
      }
    };

    loadTables();
  }, [selectedBranch]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (selectedBranch && chatMessages.length === 0) {
      setChatMessages([
        {
          id: '1',
          type: 'system',
          content: 'Welcome! What would you like to order today?',
          timestamp: new Date()
        }
      ]);
    }
  }, [selectedBranch, chatMessages.length]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Load menu data when branch changes
  useEffect(() => {
    const loadMenuData = async () => {
      if (!selectedBranch) return;

      try {
        setIsLoadingMenu(true);
        const { categories, items } = await menuIntegrationService.getMenuData(selectedBranch.id.toString());
        setMenuCategories(categories);
        setMenuItems(items);
      } catch (err) {
        console.error('Error loading menu data:', err);
        toast.error('Failed to load menu data');
      } finally {
        setIsLoadingMenu(false);
      }
    };

    loadMenuData();
  }, [selectedBranch]);

  // Load open orders when modal is opened
  const loadOpenOrders = async () => {
    if (!selectedBranch) return;

    try {
      setIsLoadingOpenOrders(true);
      const response = await orderService.getPendingOrders(selectedBranch.id.toString());
      if (response.success && response.data) {
        setOpenOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading open orders:', error);
      toast.error('Failed to load open orders');
    } finally {
      setIsLoadingOpenOrders(false);
    }
  };

  // Load open orders when modal is opened
  useEffect(() => {
    if (showOpenOrders) {
      loadOpenOrders();
    }
  }, [showOpenOrders, selectedBranch]);

  // Handle order status update
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    if (!selectedBranch) return;

    try {
      setIsLoading(true);
      const response = await orderService.updateOrder(orderId, { status: newStatus as any });
      
      if (response.success) {
        toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
        // Reload open orders to reflect the change
        await loadOpenOrders();
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pricing
  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
  const serviceCharge = subtotal * 0.1; // 10% service charge
  const tax = (subtotal + serviceCharge - discount) * 0.07; // 7% tax
  const total = subtotal + serviceCharge + tax - discount;

  // Generate order ID
  const orderId = `#TNC-${Math.floor(Math.random() * 90000) + 10000}`;

  // Handle context changes
  const handleContextChange = (field: keyof OrderContext, value: string) => {
    setOrderContext(prev => ({ ...prev, [field]: value }));
  };

  // Handle message input
  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    // Add customer message
    const customerMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'customer',
      content: messageInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, customerMessage]);

    // Process message and generate response
    processMessage(messageInput);
    setMessageInput('');
  };

  // Process customer message and generate system response
  const processMessage = async (message: string) => {
    if (!selectedBranch) return;

    try {
      // Use the menu integration service to process natural language
      const { items, response } = await menuIntegrationService.processNaturalLanguageOrder(
        selectedBranch.id.toString(), 
        message
      );
      
      // Add items to order if any were detected
      if (items.length > 0) {
        setOrderItems(prev => [...prev, ...items]);
        
        // Add notifications for each item
        items.forEach(item => {
          const notificationMessage: ChatMessageType = {
            id: `${Date.now()}-${item.id}`,
            type: 'customer',
            content: `Item added: ${item.menu_item_name} x${item.quantity} — $${item.total_price.toFixed(2)}`,
            timestamp: new Date(),
            isNotification: true
          };
          setChatMessages(prev => [...prev, notificationMessage]);
        });
      }

      // Add system response
      const systemMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessageType = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle item quantity change
  const handleQuantityChange = (itemId: string, change: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        if (newQuantity === 0) return null;
        return {
          ...item,
          quantity: newQuantity,
          total_price: item.price * newQuantity
        };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  // Handle item removal
  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle item customization
  const handleItemCustomization = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setShowCustomizationModal(true);
  };

  // Handle adding customized item to order
  const handleAddCustomizedItem = (orderItem: any) => {
    setOrderItems(prev => [...prev, orderItem]);
    setChatMessages(prev => [...prev, {
      id: `custom-${Date.now()}`,
      type: 'customer',
      content: `Item added: ${orderItem.menu_item_name}${orderItem.variant_name ? ` (${orderItem.variant_name})` : ''} x${orderItem.quantity} — $${orderItem.total_price.toFixed(2)}`,
      timestamp: new Date(),
      isNotification: true
    }]);
    toast.success(`${orderItem.menu_item_name} added to order`);
  };

  // Handle order actions
  const handleSaveDraft = async () => {
    if (!selectedBranch) {
      toast.error('Please select a branch');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item to save the order');
      return;
    }

    setIsLoading(true);
    try {
      const orderData: CreateOrderData = {
        branch_id: selectedBranch.id.toString(),
        table_id: orderContext.tableId || undefined,
        customer_name: orderContext.customerName || undefined,
        customer_phone: orderContext.customerPhone || undefined,
        order_type: 'dine_in',
        status: 'draft',
        items: orderItems.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.total_price,
          special_instructions: item.special_instructions,
          variant_id: item.variant_id,
          modifiers: item.modifiers?.map(mod => ({
            modifier_option_id: mod.modifier_option_id,
            extra_price: mod.extra_price
          }))
        })),
        subtotal: subtotal,
        discount_amount: discount,
        service_charge: serviceCharge,
        tax_amount: tax,
        total_amount: total,
        kitchen_notes: kitchenNote,
        customer_notes: customerNote
      };

      const response = await orderService.createOrder(selectedBranch.id.toString(), orderData);
      if (response.success) {
        toast.success('Order saved as draft successfully');
        // Reset form
        setOrderItems([]);
        setChatMessages([{
          id: '1',
          type: 'system',
          content: 'Order saved! What would you like to order next?',
          timestamp: new Date()
        }]);
        setKitchenNote('');
        setCustomerNote('');
      } else {
        toast.error('Failed to save order');
      }
    } catch (err) {
      console.error('Error saving order:', err);
      toast.error('Failed to save order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToKitchen = async () => {
    if (!selectedBranch) {
      toast.error('Please select a branch');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item to send to kitchen');
      return;
    }

    setIsLoading(true);
    try {
      const orderData: CreateOrderData = {
        branch_id: selectedBranch.id.toString(),
        table_id: orderContext.tableId || undefined,
        customer_name: orderContext.customerName || undefined,
        customer_phone: orderContext.customerPhone || undefined,
        order_type: 'dine_in',
        status: 'sent_to_kitchen',
        items: orderItems.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.total_price,
          special_instructions: item.special_instructions,
          variant_id: item.variant_id,
          modifiers: item.modifiers?.map(mod => ({
            modifier_option_id: mod.modifier_option_id,
            extra_price: mod.extra_price
          }))
        })),
        subtotal: subtotal,
        discount_amount: discount,
        service_charge: serviceCharge,
        tax_amount: tax,
        total_amount: total,
        kitchen_notes: kitchenNote,
        customer_notes: customerNote
      };

      const response = await orderService.createOrder(selectedBranch.id.toString(), orderData);
      if (response.success) {
        toast.success('Order sent to kitchen successfully');
        // Reset form
        setOrderItems([]);
        setChatMessages([{
          id: '1',
          type: 'system',
          content: 'Order sent to kitchen! What would you like to order next?',
          timestamp: new Date()
        }]);
        setKitchenNote('');
        setCustomerNote('');
      } else {
        toast.error('Failed to send order to kitchen');
      }
    } catch (err) {
      console.error('Error sending order to kitchen:', err);
      toast.error('Failed to send order to kitchen');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessageSubmit(e);
    }
  };

  // Handle keyboard navigation
  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    // Focus message input with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      messageInputRef.current?.focus();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Loading state
  if (isLoadingBranches) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <SkeletonLoader height="h-8" width="w-64" className="mb-2" />
            <SkeletonLoader height="h-4" width="w-96" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content area skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            
            {/* Sidebar skeleton */}
            <div className="lg:col-span-1">
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorPlaceholder
        title="Error Loading Order Entry"
        subtitle={error}
        actionText="Try Again"
        onAction={() => setError(null)}
        size="lg"
      />
    );
  }

  // No branches state
  if (branches.length === 0) {
    return (
      <EmptyPlaceholder
        icon={Building2}
        title="No Branches Found"
        subtitle="You need to create a branch before you can create orders."
        actionText="Create Your First Branch"
        onAction={() => window.location.href = '/settings/branches'}
        size="lg"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col p-6" role="main" aria-label="Manual Order Entry">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manual Order Entry</h1>
            <p className="text-gray-600">Simulate customer ordering experience</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="border-gray-300"
              aria-label="View existing orders"
              onClick={() => setShowOpenOrders(true)}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Open Orders
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              aria-label="Start new order"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>
      </header>

      {/* Order Context Header */}
      <div className="flex-shrink-0">
        <OrderContextHeader
          branchId={orderContext.branchId}
          tableId={orderContext.tableId}
          customerName={orderContext.customerName}
          onBranchChange={(branchId) => handleContextChange('branchId', branchId)}
          onTableChange={(tableId) => handleContextChange('tableId', tableId)}
          onCustomerChange={(customerName) => handleContextChange('customerName', customerName)}
          branches={branches.map(branch => ({ id: branch.id.toString(), name: branch.name }))}
          tables={tables.map(table => ({ id: table.id.toString(), table_name: table.table_name }))}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Left Panel - Chat Simulation */}
        <section className="flex-1 flex flex-col bg-white border-r border-gray-200 min-h-0" aria-label="Order simulation chat">
          {/* Chat Header */}
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Order Simulation</h2>
            <p className="text-xs text-gray-600">Chat with customer to take their order</p>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 min-h-0"
            role="log"
            aria-label="Chat conversation"
            aria-live="polite"
          >
            {chatMessages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                type={message.type}
                content={message.content}
                timestamp={message.timestamp}
                isNotification={message.isNotification}
              />
            ))}
          </div>

          {/* Quick Action Buttons and Message Input */}
          <div className="p-3 border-t border-gray-200 flex-shrink-0">
            <QuickActionButtons
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              showMenuItems={showMenuItems}
              onToggleMenuItems={() => setShowMenuItems(!showMenuItems)}
              categories={menuCategories}
              isLoading={isLoadingMenu}
            />
            
            {/* Menu Items Display - Fixed height with scroll */}
            {showMenuItems && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {activeCategory === 'Popular Items' ? 'Popular Items' : `${activeCategory} Menu`}
                  </h3>
                  <button
                    onClick={() => setShowMenuItems(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    ✕ Close
                  </button>
                </div>
                {isLoadingMenu ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading menu...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {activeCategory === 'Popular Items' 
                      ? menuItems.filter(item => item.isPopular).map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              // Check if item has variants or modifiers
                              if ((item.variants && item.variants.length > 0) || (item.modifiers && item.modifiers.length > 0)) {
                                handleItemCustomization(item);
                              } else {
                                const orderItem = menuIntegrationService.menuItemToOrderItem(item, 1);
                                setOrderItems(prev => [...prev, orderItem]);
                                setChatMessages(prev => [...prev, {
                                  id: `menu-${Date.now()}`,
                                  type: 'customer',
                                  content: `Item added: ${item.name} x1 — $${item.base_price.toFixed(2)}`,
                                  timestamp: new Date(),
                                  isNotification: true
                                }]);
                                toast.success(`${item.name} added to order`);
                              }
                            }}
                            className="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            <div className="font-medium text-xs">{item.name}</div>
                            <div className="text-xs text-gray-600">${item.base_price.toFixed(2)}</div>
                          </button>
                        ))
                      : menuItems.filter(item => item.category === activeCategory).map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              // Check if item has variants or modifiers
                              if ((item.variants && item.variants.length > 0) || (item.modifiers && item.modifiers.length > 0)) {
                                handleItemCustomization(item);
                              } else {
                                const orderItem = menuIntegrationService.menuItemToOrderItem(item, 1);
                                setOrderItems(prev => [...prev, orderItem]);
                                setChatMessages(prev => [...prev, {
                                  id: `menu-${Date.now()}`,
                                  type: 'customer',
                                  content: `Item added: ${item.name} x1 — $${item.base_price.toFixed(2)}`,
                                  timestamp: new Date(),
                                  isNotification: true
                                }]);
                                toast.success(`${item.name} added to order`);
                              }
                            }}
                            className="text-left p-2 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            <div className="font-medium text-xs">{item.name}</div>
                            <div className="text-xs text-gray-600">${item.base_price.toFixed(2)}</div>
                          </button>
                        ))
                    }
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <MessageInput
                value={messageInput}
                onChange={setMessageInput}
                onSubmit={handleMessageSubmit}
                onKeyDown={handleKeyDown}
                maxLength={500}
                placeholder="Type a message... or type /add to add items"
                disabled={isLoading}
              />
            </div>
          </div>
        </section>

        {/* Right Panel - Order Summary */}
        <section className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col min-h-0" aria-label="Order summary">
          {/* Order Header - Fixed */}
          <div className="p-3 border-b border-gray-200 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{orderId} (Draft)</p>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-3">
              {orderItems.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 sticky top-0 bg-gray-50 py-2">Order Items ({orderItems.length})</h3>
                  <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs truncate">
                          {item.menu_item_name}
                          {item.variant_name && <span className="text-gray-500 ml-1">({item.variant_name})</span>}
                        </h4>
                        <p className="text-xs text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="text-xs text-gray-500">
                            {item.modifiers.map((mod, index) => (
                              <span key={mod.id}>
                                {mod.option_name}{mod.extra_price > 0 && ` (+$${mod.extra_price.toFixed(2)})`}
                                {index < item.modifiers!.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.special_instructions && (
                          <p className="text-xs text-gray-500 italic truncate">"{item.special_instructions}"</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 ml-2 flex-shrink-0"
                        aria-label={`Remove ${item.menu_item_name}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-xs font-medium min-w-[16px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                        <p className="font-semibold text-gray-900 text-xs">${item.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No items in order yet</p>
                <p className="text-xs text-gray-400">Start chatting to add items</p>
              </div>
            )}
            
            {/* Pricing Breakdown */}
            {orderItems.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Pricing Breakdown</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    {discount > 0 ? (
                      <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
                    ) : (
                      <button 
                        onClick={() => toast.info('Discount feature coming soon!')}
                        className="text-blue-600 hover:underline flex items-center text-xs"
                      >
                        <svg className="w-2 h-2 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add
                      </button>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service charge (10%)</span>
                    <span className="font-medium">${serviceCharge.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (7%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-semibold text-sm border-t border-gray-200 pt-1">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Add Item Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 py-3 h-auto"
                onClick={() => setShowAddItemModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Notes Section */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Notes</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Kitchen Note
                  </label>
                  <Textarea
                    value={kitchenNote}
                    onChange={(e) => setKitchenNote(e.target.value)}
                    placeholder="Instructions for the kitchen..."
                    className="text-xs"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Customer Note
                  </label>
                  <Textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Will appear on receipt..."
                    className="text-xs"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Order Actions</h3>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isLoading || orderItems.length === 0}
                  className="flex-1 border-gray-300 text-xs py-1 h-8"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handleSendToKitchen}
                  disabled={isLoading || orderItems.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs py-1 h-8"
                >
                  Send to Kitchen
                </Button>
              </div>
              
                             <div className="flex space-x-1">
                 <Button
                   variant="outline"
                   onClick={() => toast.info('Order status management available in Open Orders modal')}
                   className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50 text-xs py-1 h-8"
                 >
                   <Clock className="w-3 h-3 mr-1" />
                   Manage Status
                 </Button>
                 <Button
                   variant="outline"
                   onClick={() => setShowOpenOrders(true)}
                   className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 text-xs py-1 h-8"
                 >
                   View Orders
                 </Button>
                 <Button
                   variant="outline"
                   onClick={() => {
                     if (confirm('Are you sure you want to clear the current order?')) {
                       setOrderItems([]);
                       setKitchenNote('');
                       setCustomerNote('');
                       setChatMessages([{
                         id: '1',
                         type: 'system',
                         content: 'Order cleared! What would you like to order next?',
                         timestamp: new Date()
                       }]);
                     }
                   }}
                   className="flex-1 border-red-300 text-red-700 hover:bg-red-50 text-xs py-1 h-8"
                 >
                   Clear Order
                 </Button>
               </div>
              
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50 text-xs py-1 h-8"
                disabled
              >
                Cancel Order
              </Button>
            </div>
            </div>
          </div>
        </section>
      </div>

             {/* Open Orders Modal */}
       {showOpenOrders && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900">Open Orders</h3>
               <div className="flex items-center space-x-2">
                 <button
                   onClick={loadOpenOrders}
                   disabled={isLoadingOpenOrders}
                   className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                   title="Refresh orders"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                   </svg>
                 </button>
                 <button
                   onClick={() => setShowOpenOrders(false)}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             </div>
             <div className="p-4 overflow-y-auto max-h-[60vh]">
               {isLoadingOpenOrders ? (
                 <div className="flex items-center justify-center py-8">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                   <span className="ml-2 text-gray-600">Loading orders...</span>
                 </div>
               ) : openOrders.length === 0 ? (
                 <div className="text-center py-8">
                   <div className="text-gray-400 mb-2">
                     <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                     </svg>
                   </div>
                   <p className="text-gray-500">No open orders found</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {openOrders.map((order) => (
                     <div key={order.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                       <div className="flex items-center justify-between mb-2">
                         <div className="flex-1">
                           <h4 className="font-medium text-gray-900">{order.order_number}</h4>
                           <p className="text-sm text-gray-600">
                             {order.table_name ? `Table ${order.table_name}` : 'No table'} • {order.items?.length || 0} items • ${order.total_amount?.toFixed(2) || '0.00'}
                           </p>
                           <p className="text-xs text-gray-500">
                             {order.customer_name && `Customer: ${order.customer_name}`}
                             {order.created_at && ` • ${new Date(order.created_at).toLocaleTimeString()}`}
                           </p>
                         </div>
                         <OrderStatusIndicator status={order.status || 'unknown'} size="sm" />
                       </div>
                       
                       {/* Status Update Buttons */}
                       <div className="flex flex-wrap gap-1">
                         {order.status === 'draft' && (
                           <button
                             onClick={() => handleOrderStatusUpdate(order.id, 'sent_to_kitchen')}
                             disabled={isLoading}
                             className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                           >
                             Send to Kitchen
                           </button>
                         )}
                         {order.status === 'sent_to_kitchen' && (
                           <button
                             onClick={() => handleOrderStatusUpdate(order.id, 'in_progress')}
                             disabled={isLoading}
                             className="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50"
                           >
                             Start Cooking
                           </button>
                         )}
                         {order.status === 'in_progress' && (
                           <button
                             onClick={() => handleOrderStatusUpdate(order.id, 'ready')}
                             disabled={isLoading}
                             className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                           >
                             Mark Ready
                           </button>
                         )}
                         {order.status === 'ready' && (
                           <button
                             onClick={() => handleOrderStatusUpdate(order.id, 'completed')}
                             disabled={isLoading}
                             className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
                           >
                             Complete Order
                           </button>
                         )}
                         {order.status !== 'completed' && order.status !== 'cancelled' && (
                           <button
                             onClick={() => {
                               if (confirm('Are you sure you want to cancel this order?')) {
                                 handleOrderStatusUpdate(order.id, 'cancelled');
                               }
                             }}
                             disabled={isLoading}
                             className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                           >
                             Cancel
                           </button>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Items to Order</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex h-[600px]">
              {/* Left Side - Menu Items */}
              <div className="flex-1 p-4 border-r border-gray-200 overflow-y-auto">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search menu items"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                                 <div className="flex space-x-1 mb-4 overflow-x-auto">
                   <button
                     className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                       activeCategory === 'All'
                         ? 'bg-blue-600 text-white'
                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                     }`}
                     onClick={() => setActiveCategory('All')}
                   >
                     All
                   </button>
                   {menuCategories.map((category) => (
                     <button
                       key={category.id}
                       className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                         activeCategory === category.name
                           ? 'bg-blue-600 text-white'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                       }`}
                       onClick={() => setActiveCategory(category.name)}
                     >
                       {category.name}
                     </button>
                   ))}
                 </div>
                
                {isLoadingMenu ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading menu items...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {menuItems
                      .filter(item => activeCategory === 'All' || item.category === activeCategory)
                      .map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                          <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No Image</span>
                            )}
                          </div>
                          <h4 className="font-medium text-sm mb-1 truncate">{item.name}</h4>
                          <p className="text-xs text-gray-600 mb-2">${item.base_price.toFixed(2)}</p>
                          <button 
                            onClick={() => {
                              // Check if item has variants or modifiers
                              if ((item.variants && item.variants.length > 0) || (item.modifiers && item.modifiers.length > 0)) {
                                handleItemCustomization(item);
                              } else {
                                const orderItem = menuIntegrationService.menuItemToOrderItem(item, 1);
                                setOrderItems(prev => [...prev, orderItem]);
                                toast.success(`${item.name} added to order`);
                              }
                            }}
                            className="w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700"
                          >
                            +
                          </button>
                        </div>
                      ))
                    }
                    {menuItems.filter(item => activeCategory === 'All' || item.category === activeCategory).length === 0 && (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-gray-500">No items found in this category</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Right Side - Item Customization */}
              <div className="w-80 p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Garlic Bread</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose Option</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="radio" name="option" value="regular" defaultChecked className="mr-2" />
                        <span className="text-sm">Regular - $4.50</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="option" value="with-cheese" className="mr-2" />
                        <span className="text-sm">With Cheese - $5.50</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Extras</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Extra Cheese (+$1.00)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">Chili Flakes (+$0.50)</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center space-x-2">
                      <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                        -
                      </button>
                      <span className="w-8 text-center">1</span>
                      <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                    <textarea
                      placeholder="Any special requests..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows={3}
                    />
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium">
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
                     </div>
         </div>
       )}

       {/* Item Customization Modal */}
       <ItemCustomizationModal
         isOpen={showCustomizationModal}
         onClose={() => setShowCustomizationModal(false)}
         menuItem={selectedMenuItem}
         onAddToOrder={handleAddCustomizedItem}
       />
     </div>
   );
 };

export default ManualOrderEntry;
