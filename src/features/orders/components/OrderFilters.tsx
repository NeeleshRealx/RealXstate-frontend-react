import React, { useState } from 'react';
import { Search, Filter, Calendar, ChevronDown } from 'lucide-react';
import { OrderFilters as OrderFiltersType, OrderStatus, OrderType, PaymentStatus } from '@/types/order';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
  onClearFilters: () => void;
  tables: Array<{ id: string; name: string; section?: string }>;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  tables,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'sent_to_kitchen', label: 'Sent to Kitchen', color: 'bg-blue-100 text-blue-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-800' },
    { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ];

  const orderTypeOptions: { value: OrderType; label: string }[] = [
    { value: 'dine_in', label: 'Dine In' },
    { value: 'takeaway', label: 'Takeaway' },
    { value: 'delivery', label: 'Delivery' },
  ];

  const paymentStatusOptions: { value: PaymentStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
  ];

  const handleStatusToggle = (status: OrderStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s: any) => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleOrderTypeToggle = (orderType: OrderType) => {
    const currentTypes = filters.order_type || [];
    const newTypes = currentTypes.includes(orderType)
      ? currentTypes.filter((t: any) => t !== orderType)
      : [...currentTypes, orderType];
    
    onFiltersChange({ ...filters, order_type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handlePaymentStatusToggle = (paymentStatus: PaymentStatus) => {
    const currentStatuses = filters.payment_status || [];
    const newStatuses = currentStatuses.includes(paymentStatus)
      ? currentStatuses.filter((s: any) => s !== paymentStatus)
      : [...currentStatuses, paymentStatus];
    
    onFiltersChange({ ...filters, payment_status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleTableChange = (tableId: string) => {
    onFiltersChange({ 
      ...filters, 
      table_id: tableId === '' ? undefined : tableId 
    });
  };

  const handleDateChange = (field: 'date_from' | 'date_to', value: string) => {
    onFiltersChange({ 
      ...filters, 
      [field]: value === '' ? undefined : value 
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      search: value === '' ? undefined : value 
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.status?.length ||
      filters.order_type?.length ||
      filters.payment_status?.length ||
      filters.table_id ||
      filters.date_from ||
      filters.date_to ||
      filters.search
    );
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      {/* Header - Always visible */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasActiveFilters() && (
              <button
                onClick={onClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            )}
            
            <button
              onClick={toggleExpanded}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content - Collapsible */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Order number, customer..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Table Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
              <div className="relative">
                <select
                  value={filters.table_id || ''}
                  onChange={(e) => handleTableChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                >
                  <option value="">All Tables</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name} {table.section && `(${table.section})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleDateChange('date_from', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleDateChange('date_to', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="mt-4 space-y-4">
            {/* Order Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusToggle(option.value)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      filters.status?.includes(option.value)
                        ? `${option.color} border-current`
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
              <div className="flex flex-wrap gap-2">
                {orderTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOrderTypeToggle(option.value)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      filters.order_type?.includes(option.value)
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <div className="flex flex-wrap gap-2">
                {paymentStatusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePaymentStatusToggle(option.value)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      filters.payment_status?.includes(option.value)
                        ? `${option.color} border-current`
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;