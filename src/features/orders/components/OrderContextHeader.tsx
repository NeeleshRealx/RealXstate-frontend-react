import React from 'react';
import { Building2, MapPin, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface OrderContextHeaderProps {
  branchId: string;
  tableId: string;
  customerName: string;
  onBranchChange: (branchId: string) => void;
  onTableChange: (tableId: string) => void;
  onCustomerChange: (customerName: string) => void;
  branches: Array<{ id: string; name: string }>;
  tables: Array<{ id: string; table_name: string }>;
}

const OrderContextHeader: React.FC<OrderContextHeaderProps> = ({
  branchId,
  tableId,
  customerName,
  onBranchChange,
  onTableChange,
  onCustomerChange,
  branches,
  tables
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-6">
        {/* Branch Selection */}
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <select
            value={branchId}
            onChange={(e) => onBranchChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select branch"
          >
            <option value="">Select Branch</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Table Selection */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <select
            value={tableId}
            onChange={(e) => onTableChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select table"
            disabled={!branchId}
          >
            <option value="">Select Table</option>
            {tables.map(table => (
              <option key={table.id} value={table.id}>
                {table.table_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Customer Input */}
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Name or phone"
            value={customerName}
            onChange={(e) => onCustomerChange(e.target.value)}
            className="w-48"
            aria-label="Customer name or phone"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderContextHeader;
