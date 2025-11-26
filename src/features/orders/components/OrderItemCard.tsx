import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { OrderItem } from '@/types/order';

interface OrderItemCardProps {
  item: OrderItem;
  onQuantityChange: (itemId: string, change: number) => void;
  onRemove: (itemId: string) => void;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({
  item,
  onQuantityChange,
  onRemove
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{item.menu_item_name}</h4>
          <p className="text-xs text-gray-600">Regular, 12"</p>
          {item.special_instructions && (
            <p className="text-xs text-gray-500 italic mt-1">{item.special_instructions}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          aria-label={`Remove ${item.menu_item_name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onQuantityChange(item.id, -1)}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.id, 1)}
            className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
          <p className="font-semibold text-gray-900 text-sm">${item.total_price.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderItemCard;
