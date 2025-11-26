import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'gray';
  icon?: string;
}

interface TagsTabProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onChange: (tags: Tag[]) => void;
  onCreateTag?: (name: string) => void;
}

const tagColors = {
  red: 'bg-red-100 text-red-800 border-red-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

const defaultTags: Tag[] = [
  { id: '1', name: 'Spicy', color: 'red', icon: '🌶️' },
  { id: '2', name: 'Vegan', color: 'green', icon: '🌱' },
  { id: '3', name: 'Gluten-Free', color: 'yellow', icon: '🌾' },
  { id: '4', name: 'Dairy-Free', color: 'blue', icon: '🥛' },
  { id: '5', name: 'Organic', color: 'green', icon: '🌿' },
  { id: '6', name: 'Low-Carb', color: 'purple', icon: '💪' },
];

export const TagsTab: React.FC<TagsTabProps> = ({ 
  selectedTags, 
  availableTags = defaultTags, 
  onChange, 
  onCreateTag 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.some(selected => selected.id === tag.id)
  );

  const addTag = (tag: Tag) => {
    if (!selectedTags.some(selected => selected.id === tag.id)) {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  const createNewTag = () => {
    if (searchTerm.trim()) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: searchTerm.trim(),
        color: 'gray', // Default color
        icon: '🏷️', // Default icon
      };
      onChange([...selectedTags, newTag]);
      setSearchTerm('');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Tags</h3>
        <p className="text-sm text-gray-500">
          Add tags to help customers identify dietary preferences and item characteristics.
        </p>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Assigned Tags</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag.id}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${tagColors[tag.color]}`}
              >
                {tag.icon && <span className="mr-1">{tag.icon}</span>}
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tag.id)}
                  className="ml-2 text-current hover:text-current/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Add Tags */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Add Tags</h4>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search for tags or create a new one..."
          />
        </div>
      </div>

      {/* Available Tags */}
      <div>
        <div className="max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag)}
                className="w-full flex items-center p-2 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${tagColors[tag.color]}`}
                >
                  {tag.icon && <span className="mr-1">{tag.icon}</span>}
                  {tag.name}
                </span>
                <Plus className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Create new tag option */}
        {searchTerm && !availableTags.some(tag => 
          tag.name.toLowerCase() === searchTerm.toLowerCase()
        ) && !selectedTags.some(tag => 
          tag.name.toLowerCase() === searchTerm.toLowerCase()
        ) && (
          <button
            type="button"
            onClick={createNewTag}
            className="w-full flex items-center p-3 text-left hover:bg-blue-50 rounded-md transition-colors mt-2 border-t border-gray-200 pt-4 bg-blue-50/50"
          >
            <Plus className="w-4 h-4 text-blue-600 mr-3" />
            <span className="text-sm text-blue-800 font-medium mr-2">Create new tag:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              {searchTerm}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}; 
