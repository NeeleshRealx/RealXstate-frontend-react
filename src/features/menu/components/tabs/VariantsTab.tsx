import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

interface Variant {
  id: string;
  name: string;
  price: string;
  active: boolean;
}

interface VariantsTabProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

export const VariantsTab: React.FC<VariantsTabProps> = ({ variants, onChange }) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const addVariant = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: '',
      price: '',
      active: true,
    };
    onChange([...variants, newVariant]);
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    onChange(
      variants.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  const removeVariant = (id: string) => {
    onChange(variants.filter((variant) => variant.id !== id));
  };

  const moveVariant = (fromIndex: number, toIndex: number) => {
    const newVariants = [...variants];
    const [movedVariant] = newVariants.splice(fromIndex, 1);
    newVariants.splice(toIndex, 0, movedVariant);
    onChange(newVariants);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveVariant(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Variants</h3>
          <p className="text-sm text-gray-500">
            Create different sizes or types of your menu item with specific prices.
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </button>
      </div>

      {variants.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-6 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="w-16 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {variants.map((variant, index) => (
                <tr 
                  key={variant.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`${draggedIndex === index ? 'opacity-50' : ''} hover:bg-gray-50`}
                >
                  <td className="px-6 py-4">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                      placeholder="e.g., Small, Medium, Large"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                        className="block w-full pl-7 pr-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ToggleSwitch
                      checked={variant.active}
                      onChange={(checked) => updateVariant(variant.id, 'active', checked)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {variants.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No variants added yet</p>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Variant
          </button>
        </div>
      )}
    </div>
  );
}; 
