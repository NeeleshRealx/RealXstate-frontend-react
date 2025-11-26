import React from 'react';
import { Plus } from 'lucide-react';

interface PricingBreakdownProps {
  subtotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  total: number;
  onAddDiscount?: () => void;
}

const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  subtotal,
  discount,
  serviceCharge,
  tax,
  total,
  onAddDiscount
}) => {
  return (
    <div className="space-y-2 text-sm">
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
            onClick={onAddDiscount}
            className="text-blue-600 hover:underline flex items-center text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
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
      
      <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PricingBreakdown;
