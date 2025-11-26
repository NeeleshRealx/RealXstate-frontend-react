import React, { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface CSVTable {
  table_name: string;
  section: string;
  is_active: boolean;
}

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (tables: CSVTable[]) => Promise<void>;
  isImporting?: boolean;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isImporting = false,
}) => {
  const [csvData, setCsvData] = useState<CSVTable[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrors(['Please select a valid CSV file.']);
      setIsValid(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setErrors(['CSV file must contain at least a header row and one data row.']);
        setIsValid(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['table_name', 'section'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
        setIsValid(false);
        return;
      }

      const parsedData: CSVTable[] = [];
      const validationErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
          validationErrors.push(`Row ${i + 1}: Incorrect number of columns`);
          continue;
        }

        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        // Validate and convert data
        const table: CSVTable = {
          table_name: row.table_name || '',
          section: row.section || '',
          is_active: row.is_active ? row.is_active.toLowerCase() === 'true' : true,
        };

        // Validate table name
        if (!table.table_name) {
          validationErrors.push(`Row ${i + 1}: Table name is required`);
        } else if (table.table_name.length > 50) {
          validationErrors.push(`Row ${i + 1}: Table name cannot exceed 50 characters`);
        } else if (!/^[a-zA-Z0-9\-\s]+$/.test(table.table_name)) {
          validationErrors.push(`Row ${i + 1}: Table name can only contain letters, numbers, hyphens, and spaces`);
        }

        // Validate section
        if (table.section && table.section.length > 100) {
          validationErrors.push(`Row ${i + 1}: Section name cannot exceed 100 characters`);
        }

        // Check for duplicate table names
        const duplicateIndex = parsedData.findIndex(t => t.table_name.toLowerCase() === table.table_name.toLowerCase());
        if (duplicateIndex !== -1) {
          validationErrors.push(`Row ${i + 1}: Duplicate table name "${table.table_name}"`);
        }

        parsedData.push(table);
      }

      setCsvData(parsedData);
      setErrors(validationErrors);
      setIsValid(validationErrors.length === 0 && parsedData.length > 0);
    } catch (error) {
      setErrors(['Failed to parse CSV file. Please check the format.']);
      setIsValid(false);
    }
  };

  const handleImport = async () => {
    if (!isValid || csvData.length === 0) return;
    
    try {
      await onImport(csvData);
      onClose();
      // Reset state
      setCsvData([]);
      setErrors([]);
      setIsValid(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const downloadTemplate = () => {
    const template = 'table_name,section,is_active\nTable 1,Main Hall,true\nTable 2,Main Hall,true\nTable 3,Outdoor,false';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import Tables from CSV</h2>
              <p className="text-sm text-gray-500">Upload a CSV file to create multiple tables at once</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isImporting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Upload CSV File</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isImporting}
              />
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Click to select a CSV file or drag and drop
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                disabled={isImporting}
              >
                Choose File
              </button>
            </div>
          </div>

          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-800">Need a template?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Download our CSV template to get started with the correct format.
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Format Requirements</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Required columns:</strong> table_name, section</p>
              <p><strong>Optional columns:</strong> is_active (true/false, defaults to true)</p>
              <p><strong>Table name:</strong> 1-50 characters, letters, numbers, hyphens, and spaces only</p>
              <p><strong>Section:</strong> Up to 100 characters</p>
            </div>
          </div>

          {/* Validation Results */}
          {csvData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Import Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">
                    {csvData.length} table{csvData.length !== 1 ? 's' : ''} ready to import
                  </span>
                  {isValid ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Valid</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Errors Found</span>
                    </div>
                  )}
                </div>

                {/* Preview Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-900">Table Name</th>
                        <th className="text-left py-2 font-medium text-gray-900">Section</th>
                        <th className="text-left py-2 font-medium text-gray-900">Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((table, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-gray-900">{table.table_name}</td>
                          <td className="py-2 text-gray-600">{table.section || '-'}</td>
                          <td className="py-2 text-gray-600">{table.is_active ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ... and {csvData.length - 5} more table{csvData.length - 5 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isImporting}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!isValid || isImporting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Import Tables</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
