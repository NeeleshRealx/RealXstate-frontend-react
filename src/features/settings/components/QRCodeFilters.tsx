import React from 'react';
import { Search, ChevronDown, Download, Printer, Archive } from 'lucide-react';

interface QRCodeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSection: string;
  onSectionChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  sections: string[];
  selectAll: boolean;
  onSelectAll: (checked: boolean) => void;
  selectedCount: number;
  onDownloadSelected: () => void;
  onPrintSheet: () => void;
  onExportZIP: () => void;
}

const QRCodeFilters: React.FC<QRCodeFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedSection,
  onSectionChange,
  selectedStatus,
  onStatusChange,
  sections,
  selectAll,
  onSelectAll,
  selectedCount,
  onDownloadSelected,
  onPrintSheet,
  onExportZIP,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by table name or section"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Section Filter */}
        <div className="relative">
          <select
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
          >
            <option value="">All Sections</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
          >
            <option value="">All Status</option>
            <option value="generated">Generated</option>
            <option value="not-generated">Not Generated</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4 mb-3 sm:mb-0">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Select All</span>
          </label>
          {selectedCount > 0 && (
            <span className="text-sm text-gray-500">
              {selectedCount} selected
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onDownloadSelected}
            disabled={selectedCount === 0}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              selectedCount > 0
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Selected
          </button>
          <button
            onClick={onPrintSheet}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Sheet
          </button>
          <button
            onClick={onExportZIP}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Archive className="w-4 h-4 mr-2" />
            Export ZIP
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeFilters;
