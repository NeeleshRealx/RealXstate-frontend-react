import React from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, ChefHat } from 'lucide-react';

interface OrderStatusIndicatorProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const OrderStatusIndicator: React.FC<OrderStatusIndicatorProps> = ({
  status,
  showIcon = true,
  size = 'md'
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          iconColor: 'text-gray-600'
        };
      case 'sent_to_kitchen':
        return {
          label: 'Sent to Kitchen',
          color: 'bg-blue-100 text-blue-800',
          icon: ChefHat,
          iconColor: 'text-blue-600'
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          color: 'bg-orange-100 text-orange-800',
          icon: Clock,
          iconColor: 'text-orange-600'
        };
      case 'ready':
        return {
          label: 'Ready',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-gray-100 text-gray-800',
          icon: CheckCircle,
          iconColor: 'text-gray-600'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`inline-flex items-center rounded-full ${config.color} ${sizeClasses[size]}`}>
      {showIcon && (
        <Icon className={`${iconSizes[size]} mr-1 ${config.iconColor}`} />
      )}
      {config.label}
    </span>
  );
};

export default OrderStatusIndicator;
