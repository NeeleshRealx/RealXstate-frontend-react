import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  TrendingUp,
  RefreshCw,
  Download,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useBranchContext } from '@/contexts/BranchContext';
import { orderService } from '@/services/orderService';
import { tableService } from '@/services/tableService';
import { Order, OrderFilters as OrderFiltersType, OrderStats, OrderStatus } from '@/types/order';
import { Table as ApiTable } from '@/types/table';
import OrderCard from '@/features/orders/components/OrderCard';
import OrderFilters from '@/features/orders/components/OrderFilters';
import Pagination from '@/features/settings/components/Pagination';
import SettingsHeader from '@/components/layout/SettingsHeader';
import LoadingPlaceholder from '@/components/ui/LoadingPlaceholder';
import ErrorPlaceholder from '@/components/ui/ErrorPlaceholder';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';

const Orders: React.FC = () => {
  const { selectedBranch, branches, isLoadingBranches } = useBranchContext();
  
  // Debug logging
  console.log('[Orders] Branch context state:', {
    selectedBranch,
    branches,
    isLoadingBranches,
    branchesLength: branches.length
  });
  
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState<OrderFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Status dropdown state
  const [expandedStatuses, setExpandedStatuses] = useState<Record<string, boolean>>({
    draft: true,
    sent_to_kitchen: true,
    in_progress: true,
    ready: true,
    completed: false,
    cancelled: false
  });

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

  // Load orders when branch or filters change
  useEffect(() => {
    if (!selectedBranch) return;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await orderService.getOrders(
          selectedBranch.id.toString(),
          filters,
          currentPage,
          itemsPerPage
        );
        
        if (response.success && response.data) {
          setOrders(response.data.orders);
          const totalItems = response.data.pagination.total || 0;
          const lastPage = response.data.pagination.last_page || 1;
          
          // Ensure pagination values are valid
          setTotalPages(Math.max(1, lastPage));
          setTotalItems(totalItems);
        } else {
          setError('Failed to load orders');
        }
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [selectedBranch, filters, currentPage, itemsPerPage]);

  // Load stats when branch changes
  useEffect(() => {
    if (!selectedBranch) return;

    const loadStats = async () => {
      try {
        const response = await orderService.getOrderStats(selectedBranch.id.toString());
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Error loading order stats:', err);
      }
    };

    loadStats();
  }, [selectedBranch]);

  // Handlers
  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };


  const handleRefresh = async () => {
    if (!selectedBranch) return;
    
    try {
      setIsLoading(true);
      const [ordersResponse, statsResponse] = await Promise.all([
        orderService.getOrders(selectedBranch.id.toString(), filters, currentPage, itemsPerPage),
        orderService.getOrderStats(selectedBranch.id.toString())
      ]);
      
      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data.orders);
        const totalItems = ordersResponse.data.pagination.total || 0;
        const lastPage = ordersResponse.data.pagination.last_page || 1;
        
        // Ensure pagination values are valid
        setTotalPages(Math.max(1, lastPage));
        setTotalItems(totalItems);
      }
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      toast.success('Orders refreshed');
    } catch (err) {
      console.error('Error refreshing orders:', err);
      toast.error('Failed to refresh orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Status Management Functions
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    if (!selectedBranch) return;
    
    try {
      const response = await orderService.updateOrderStatus(selectedBranch.id.toString(), orderId, newStatus);
      
      if (response.success) {
        toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
        // Refresh orders to show updated status
        await handleRefresh();
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!selectedBranch) return;
    
    try {
      const response = await orderService.updateOrderStatus(selectedBranch.id.toString(), orderId, 'cancelled');
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        // Refresh orders to show updated status
        await handleRefresh();
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error('Failed to cancel order');
    }
  };

  // Toggle status dropdown
  const toggleStatusDropdown = (status: string) => {
    setExpandedStatuses(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Group orders by status for better organization
  const groupedOrders = orders.reduce((acc, order) => {
    const status = order.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  // Define status order for display
  const statusOrder = ['draft', 'sent_to_kitchen', 'in_progress', 'ready', 'completed', 'cancelled'];
  const statusLabels = {
    draft: 'Draft Orders',
    sent_to_kitchen: 'Sent to Kitchen',
    in_progress: 'In Progress',
    ready: 'Ready for Pickup',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Orders' }
  ];

  // Loading state
  if (isLoadingBranches) {
    return (
      <LoadingPlaceholder
        icon={Building2}
        title="Loading Branches"
        subtitle="Please wait while we fetch your branch information"
        size="lg"
      />
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorPlaceholder
        title="Error Loading Orders"
        subtitle={error}
        actionText="Try Again"
        onAction={handleRefresh}
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
        subtitle="You need to create a branch before you can view orders. Branches help organize your business locations."
        actionText="Create Your First Branch"
        onAction={() => window.location.href = '/settings/branches'}
        size="lg"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <SettingsHeader 
        breadcrumbs={breadcrumbItems}
        title="Order Status Management"
        subtitle="Track and manage order statuses through the kitchen workflow"
      />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">Manage orders from customers who scanned QR codes</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {/* Manual Order Entry - Hidden for Status Management Focus */}
              {/* <a
                href="/orders/manual-entry"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Manual Order Entry
              </a> */}
              <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.pending_orders}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preparing</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stats.preparing_orders}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">${stats.total_revenue.toFixed(2)}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <OrderFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          tables={tables.map(table => ({
            id: table.id,
            name: table.table_name,
            section: table.section
          }))}
        />

        {/* Orders List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Orders ({totalItems})
                  </h2>
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Status-based Order Groups */}
                {statusOrder.map((status) => {
                  const statusOrders = groupedOrders[status] || [];
                  if (statusOrders.length === 0) return null;
                  
                  return (
                    <div key={status} className="mb-8">
                      {/* Status Header with Dropdown Toggle */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => toggleStatusDropdown(status)}
                          className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {expandedStatuses[status] ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <span>{statusLabels[status as keyof typeof statusLabels]} ({statusOrders.length})</span>
                        </button>
                        {statusOrders.length > 3 && (
                          <button className="text-sm text-blue-600 hover:text-blue-800">
                            View All
                          </button>
                        )}
                      </div>
                      
                      {/* Collapsible Order Grid */}
                      {expandedStatuses[status] && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                          {statusOrders.map((order) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              onStatusUpdate={handleStatusUpdate}
                              onCancel={handleCancelOrder}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Fallback: Show all orders if no grouping */}
                {Object.keys(groupedOrders).length === 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onStatusUpdate={handleStatusUpdate}
                        onCancel={handleCancelOrder}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="p-12">
              <EmptyPlaceholder
                icon={ShoppingBag}
                title="No Orders Found"
                subtitle={
                  Object.keys(filters).length > 0
                    ? 'No orders match your current filters. Try adjusting your search criteria.'
                    : 'No orders have been placed yet. Orders will appear here when customers scan QR codes to place orders.'
                }
                actionText={Object.keys(filters).length > 0 ? 'Clear Filters' : undefined}
                onAction={Object.keys(filters).length > 0 ? handleClearFilters : undefined}
                size="md"
                className="min-h-0 py-0"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Orders;
