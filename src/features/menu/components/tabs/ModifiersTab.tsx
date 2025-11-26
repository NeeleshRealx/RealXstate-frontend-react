import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

interface ModifierOption {
  id: string;
  name: string;
  extraPrice: string;
}

interface Modifier {
  id: string;
  name: string;
  required: boolean;
  maxSelect: number;
  options: ModifierOption[];
  expanded: boolean;
}

interface ModifiersTabProps {
  modifiers: Modifier[];
  onChange: (modifiers: Modifier[]) => void;
}

export const ModifiersTab: React.FC<ModifiersTabProps> = ({ modifiers, onChange }) => {
  const addModifier = () => {
    const newModifier: Modifier = {
      id: Date.now().toString(),
      name: '',
      required: false,
      maxSelect: 1,
      options: [],
      expanded: true,
    };
    onChange([...modifiers, newModifier]);
  };

  const updateModifier = (id: string, field: keyof Modifier, value: any) => {
    onChange(
      modifiers.map((modifier) =>
        modifier.id === id ? { ...modifier, [field]: value } : modifier
      )
    );
  };

  const removeModifier = (id: string) => {
    onChange(modifiers.filter((modifier) => modifier.id !== id));
  };

  const addOption = (modifierId: string) => {
    // Check if modifier has a name before allowing options
    const modifier = modifiers.find(m => m.id === modifierId);
    if (!modifier || !modifier.name.trim()) {
      alert('Please enter a modifier name before adding options');
      return;
    }

    const newOption: ModifierOption = {
      id: Date.now().toString(),
      name: '',
      extraPrice: '0',
    };
    onChange(
      modifiers.map((modifier) =>
        modifier.id === modifierId
          ? { ...modifier, options: [...modifier.options, newOption] }
          : modifier
      )
    );
  };

  const updateOption = (modifierId: string, optionId: string, field: keyof ModifierOption, value: any) => {
    onChange(
      modifiers.map((modifier) =>
        modifier.id === modifierId
          ? {
              ...modifier,
              options: modifier.options.map((option) =>
                option.id === optionId ? { ...option, [field]: value } : option
              ),
            }
          : modifier
      )
    );
  };

  const removeOption = (modifierId: string, optionId: string) => {
    onChange(
      modifiers.map((modifier) =>
        modifier.id === modifierId
          ? { ...modifier, options: modifier.options.filter((option) => option.id !== optionId) }
          : modifier
      )
    );
  };

  const toggleModifierExpanded = (id: string) => {
    onChange(
      modifiers.map((modifier) =>
        modifier.id === id ? { ...modifier, expanded: !modifier.expanded } : modifier
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Modifiers & Options</h3>
          <p className="text-sm text-gray-500">
            Add customization options like size, toppings, or cooking preferences.
          </p>
        </div>
        <button
          type="button"
          onClick={addModifier}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Modifier
        </button>
      </div>

      <div className="space-y-4">
        {modifiers.map((modifier) => (
          <div key={modifier.id} className="border border-gray-200 rounded-lg bg-white">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <button
                    type="button"
                    onClick={() => toggleModifierExpanded(modifier.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {modifier.expanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  
                  <input
                    type="text"
                    value={modifier.name}
                    onChange={(e) => updateModifier(modifier.id, 'name', e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                    placeholder="Modifier name (e.g., Size, Toppings)"
                  />
                  
                  <div className="flex items-center space-x-4">
                    <ToggleSwitch
                      checked={modifier.required}
                      onChange={(checked) => updateModifier(modifier.id, 'required', checked)}
                      label="Required"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700">Max Select:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={modifier.maxSelect}
                        onChange={(e) => updateModifier(modifier.id, 'maxSelect', parseInt(e.target.value))}
                        className="w-16 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-2 py-1"
                      />
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeModifier(modifier.id)}
                  className="ml-4 text-red-600 hover:text-red-900 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                {modifier.options.length} options • {modifier.required ? 'Required' : 'Optional'}
              </div>
            </div>

            {modifier.expanded && (
              <div className="p-4">
                <div className="space-y-3">
                  {modifier.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-4">
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateOption(modifier.id, option.id, 'name', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                        placeholder="Option name"
                      />
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Extra:</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={option.extraPrice}
                            onChange={(e) => updateOption(modifier.id, option.id, 'extraPrice', e.target.value)}
                            className="w-20 pl-7 pr-2 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeOption(modifier.id, option.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => addOption(modifier.id)}
                    disabled={!modifier.name.trim()}
                    className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      !modifier.name.trim()
                        ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {modifiers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No modifiers added yet</p>
          <button
            type="button"
            onClick={addModifier}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Modifier
          </button>
        </div>
      )}
    </div>
  );
}; 
