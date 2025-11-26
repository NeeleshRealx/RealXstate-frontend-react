import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  ChefHat,
  Package,
  MoreVertical,
  Phone,
  Play
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';

interface OrderCardProps {
  order: Order;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
  onCancel?: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onStatusUpdate,
  onCancel,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle dropdown actions
  const handleActionClick = (action: string) => {
    setIsDropdownOpen(false);
    
    switch (action) {
      case 'send_to_kitchen':
        onStatusUpdate?.(order.id, 'sent_to_kitchen');
        break;
      case 'start_cooking':
        onStatusUpdate?.(order.id, 'in_progress');
        break;
      case 'mark_ready':
        onStatusUpdate?.(order.id, 'ready');
        break;
      case 'complete':
        onStatusUpdate?.(order.id, 'completed');
        break;
      case 'cancel':
        onCancel?.(order.id);
        break;
    }
  };

  // Get available actions based on order status
  const getAvailableActions = () => {
    const actions = [];
    
    switch (order.status) {
      case 'draft':
        actions.push(
          { key: 'send_to_kitchen', label: 'Send to Kitchen', icon: ChefHat, color: 'text-blue-600' },
          { key: 'cancel', label: 'Cancel Order', icon: XCircle, color: 'text-red-600' }
        );
        break;
      case 'sent_to_kitchen':
        actions.push(
          { key: 'start_cooking', label: 'Start Cooking', icon: Play, color: 'text-orange-600' },
          { key: 'cancel', label: 'Cancel Order', icon: XCircle, color: 'text-red-600' }
        );
        break;
      case 'in_progress':
        actions.push(
          { key: 'mark_ready', label: 'Mark Ready', icon: CheckCircle, color: 'text-green-600' }
        );
        break;
      case 'ready':
        actions.push(
          { key: 'complete', label: 'Complete Order', icon: CheckCircle, color: 'text-gray-600' }
        );
        break;
    }
    
    
    return actions;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent_to_kitchen':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'sent_to_kitchen':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <ChefHat className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getOrderTypeIcon = (orderType: string) => {
    switch (orderType) {
      case 'dine_in':
        return <MapPin className="w-4 h-4" />;
      case 'takeaway':
        return <Package className="w-4 h-4" />;
      case 'delivery':
        return <MapPin className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getOrderTypeLabel = (orderType: string) => {
    switch (orderType) {
      case 'dine_in':
        return 'Dine In';
      case 'takeaway':
        return 'Takeaway';
      case 'delivery':
        return 'Delivery';
      default:
        return orderType;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          {/* Left side - Order number and status */}
          <div className="flex flex-col space-y-2 min-w-0 flex-1 pr-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-900 truncate">#{order.order_number}</span>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                <CreditCard className="w-3 h-3 mr-1" />
                {order.payment_status}
              </span>
            </div>
          </div>
          
          {/* Right side - Actions Dropdown */}
          <div className="flex-shrink-0 relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                {getAvailableActions().map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.key}
                      onClick={() => handleActionClick(action.key)}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <IconComponent className={`w-4 h-4 mr-3 ${action.color}`} />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Customer & Order Info */}
        <div className="space-y-2 mb-4">
          {/* Customer Info */}
          <div className="flex items-center space-x-3 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1.5">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{order.customer_name || 'Guest'}</span>
            </div>
            
            {order.customer_phone && (
              <div className="flex items-center space-x-1.5">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{order.customer_phone}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1.5">
              {getOrderTypeIcon(order.order_type)}
              <span>{getOrderTypeLabel(order.order_type)}</span>
            </div>
          </div>

          {/* Table & Time Info */}
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="flex items-center space-x-1.5 min-w-0 flex-1">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>Table {order.table_name}</span>
              {order.table_section && (
                <span className="text-gray-400">• {order.table_section}</span>
              )}
            </div>
            
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{formatTime(order.created_at)}</span>
              <span className="text-gray-400">• {formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
          <div className="space-y-1">
            {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
              <>
                {order.items.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className="text-gray-600 font-medium">×{item.quantity}</span>
                      <span className="text-gray-900 truncate">{item.menu_item_name}</span>
                    </div>
                    <span className="text-gray-900 font-medium flex-shrink-0 ml-2">${item.total_price.toFixed(2)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-sm text-gray-500 py-1">
                    +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500 py-1">No items found</div>
            )}
          </div>
        </div>

        {/* Total and Actions */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold text-gray-900">
              Total: ${order.total_amount.toFixed(2)}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {order.status === 'draft' && onStatusUpdate && (
              <button
                onClick={() => onStatusUpdate(order.id, 'sent_to_kitchen')}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Send to Kitchen
              </button>
            )}
            
            {order.status === 'sent_to_kitchen' && onStatusUpdate && (
              <button
                onClick={() => onStatusUpdate(order.id, 'in_progress')}
                className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
              >
                Start Preparing
              </button>
            )}
            
            {order.status === 'in_progress' && onStatusUpdate && (
              <button
                onClick={() => onStatusUpdate(order.id, 'ready')}
                className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
              >
                Mark Ready
              </button>
            )}
            
            {order.status === 'ready' && onStatusUpdate && (
              <button
                onClick={() => onStatusUpdate(order.id, 'completed')}
                className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
              >
                Mark Completed
              </button>
            )}
            
            
            {(order.status === 'draft' || order.status === 'sent_to_kitchen') && onCancel && (
              <button
                onClick={() => onCancel(order.id)}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Note:</span> {order.notes}
            </p>
          </div>
        )}

        {/* Estimated Ready Time */}
        {order.estimated_ready_time && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 p-2 bg-blue-50 rounded-md">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Estimated ready: {formatTime(order.estimated_ready_time)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
