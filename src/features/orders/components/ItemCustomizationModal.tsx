import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MenuItem, ItemVariant, ItemModifier, ItemModifierOption } from '@/services/menuIntegrationService';
import { OrderItemModifier } from '@/types/order';
import { X, Plus, Minus } from 'lucide-react';

interface ItemCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  onAddToOrder: (orderItem: any) => void;
}

const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({
  isOpen,
  onClose,
  menuItem,
  onAddToOrder
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<OrderItemModifier[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Reset state when modal opens/closes or menu item changes
  useEffect(() => {
    if (isOpen && menuItem) {
      setSelectedVariant(null);
      setSelectedModifiers([]);
      setQuantity(1);
      setSpecialInstructions('');
    }
  }, [isOpen, menuItem]);

  if (!isOpen || !menuItem) return null;

  const basePrice = selectedVariant ? selectedVariant.price : menuItem.base_price;
  const modifierTotal = selectedModifiers.reduce((sum, mod) => sum + mod.extra_price, 0);
  const itemTotal = (basePrice + modifierTotal) * quantity;

  const handleModifierChange = (modifier: ItemModifier, option: ItemModifierOption, isSelected: boolean) => {
    setSelectedModifiers(prev => {
      const filtered = prev.filter(mod => mod.modifier_option_id !== option.id);
      
      if (isSelected) {
        // Check if we can add more options for this modifier
        const currentCount = prev.filter(mod => 
          menuItem.modifiers?.find(m => m.id === modifier.id)?.options.some(opt => opt.id === mod.modifier_option_id)
        ).length;
        
        if (currentCount < modifier.max_select) {
          return [...filtered, {
            id: `${option.id}-${Date.now()}`,
            modifier_option_id: option.id,
            modifier_name: modifier.name,
            option_name: option.name,
            extra_price: option.extra_price
          }];
        }
      }
      
      return filtered;
    });
  };

  const handleAddToOrder = () => {
    const orderItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menu_item_id: menuItem.id,
      menu_item_name: menuItem.name,
      quantity,
      price: basePrice,
      total_price: itemTotal,
      special_instructions: specialInstructions,
      menu_item_image: menuItem.image,
      variant_id: selectedVariant?.id,
      variant_name: selectedVariant?.name,
      modifiers: selectedModifiers
    };

    onAddToOrder(orderItem);
    onClose();
  };

  const isModifierOptionSelected = (optionId: string) => {
    return selectedModifiers.some(mod => mod.modifier_option_id === optionId);
  };

  const getModifierSelectionCount = (modifierId: string) => {
    return selectedModifiers.filter(mod => 
      menuItem.modifiers?.find(m => m.id === modifierId)?.options.some(opt => opt.id === mod.modifier_option_id)
    ).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Customize {menuItem.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-4 space-y-6">
            {/* Item Info */}
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {menuItem.image ? (
                  <img 
                    src={menuItem.image} 
                    alt={menuItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{menuItem.name}</h4>
                {menuItem.description && (
                  <p className="text-sm text-gray-600 mt-1">{menuItem.description}</p>
                )}
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  ${basePrice.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Variants */}
            {menuItem.variants && menuItem.variants.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Choose Size</h5>
                <div className="space-y-2">
                  {menuItem.variants.map((variant) => (
                    <label key={variant.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="variant"
                          value={variant.id}
                          checked={selectedVariant?.id === variant.id}
                          onChange={() => setSelectedVariant(variant)}
                          className="mr-3"
                        />
                        <span className="font-medium">{variant.name}</span>
                      </div>
                      <span className="font-semibold">${variant.price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Modifiers */}
            {menuItem.modifiers && menuItem.modifiers.map((modifier) => (
              <div key={modifier.id}>
                <h5 className="font-medium text-gray-900 mb-3">
                  {modifier.name}
                  {modifier.is_required && <span className="text-red-500 ml-1">*</span>}
                  <span className="text-sm text-gray-500 ml-2">
                    ({getModifierSelectionCount(modifier.id)}/{modifier.max_select} selected)
                  </span>
                </h5>
                <div className="space-y-2">
                  {modifier.options.map((option) => (
                    <label key={option.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type={modifier.max_select === 1 ? "radio" : "checkbox"}
                          name={modifier.max_select === 1 ? `modifier-${modifier.id}` : undefined}
                          checked={isModifierOptionSelected(option.id)}
                          onChange={(e) => handleModifierChange(modifier, option, e.target.checked)}
                          className="mr-3"
                        />
                        <span className="font-medium">{option.name}</span>
                      </div>
                      {option.extra_price > 0 && (
                        <span className="font-semibold text-green-600">
                          +${option.extra_price.toFixed(2)}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Special Instructions */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Special Instructions</h5>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or modifications..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Quantity */}
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Quantity</h5>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              Total: ${itemTotal.toFixed(2)}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToOrder}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add to Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCustomizationModal;
