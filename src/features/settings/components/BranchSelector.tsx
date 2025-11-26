import React, { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { Branch } from '@/types/branch';

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: Branch | null;
  onBranchChange: (branch: Branch) => void;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranch,
  onBranchChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!selectedBranch) {
    return (
      <div className="text-sm text-gray-500">
        No branch selected
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-64 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div>
          <div className="font-medium text-gray-900">{selectedBranch.name}</div>
          {/* <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {selectedBranch.timezone}
          </div> */}
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => {
                onBranchChange(branch);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            >
              <div className="font-medium text-gray-900">{branch.name}</div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {branch.timezone}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;
