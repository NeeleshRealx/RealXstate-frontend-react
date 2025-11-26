import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { BranchInfo } from '@/types/openingHours';

interface BranchSelectorProps {
  branches: BranchInfo[];
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  disabled?: boolean;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranchId,
  onBranchChange,
  disabled = false
}) => {
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Select Branch</h2>
          <p className="text-sm text-gray-600">Choose a branch to manage opening hours</p>
        </div>
      </div>

      <div className="relative">
        <select
          value={selectedBranchId}
          onChange={(e) => onBranchChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white disabled:opacity-50"
        >
          <option value="">Select a branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {selectedBranch && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{selectedBranch.name}</p>
              {selectedBranch.address && (
                <p className="text-sm text-gray-600 mt-1">{selectedBranch.address}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Timezone</p>
              <p className="font-medium text-gray-900">{selectedBranch.timezone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSelector;