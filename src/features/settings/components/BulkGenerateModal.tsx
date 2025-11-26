import React, { useState } from 'react';
import { X, QrCode, MessageSquare, Globe, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: 'whatsapp' | 'table_ordering' | 'both') => Promise<void>;
  tables: Array<{
    id: string;
    name: string;
    section: string;
    hasQrCode?: boolean;
    hasWhatsappQr?: boolean;
  }>;
  isGenerating?: boolean;
}

const BulkGenerateModal: React.FC<BulkGenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  tables,
  isGenerating = false,
}) => {
  const [selectedType, setSelectedType] = useState<'whatsapp' | 'table_ordering' | 'both'>('both');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGenerate = async () => {
    try {
      await onGenerate(selectedType);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  // Analyze tables for generation status
  const analysis = {
    total: tables.length,
    hasWhatsapp: tables.filter(t => t.hasWhatsappQr).length,
    hasTableOrdering: tables.filter(t => t.hasQrCode).length,
    hasBoth: tables.filter(t => t.hasQrCode && t.hasWhatsappQr).length,
    hasNone: tables.filter(t => !t.hasQrCode && !t.hasWhatsappQr).length,
  };

  const getGenerationMessage = () => {
    switch (selectedType) {
      case 'whatsapp':
        return `Generate WhatsApp QR codes for ${analysis.total} tables`;
      case 'table_ordering':
        return `Generate table ordering QR codes for ${analysis.total} tables`;
      case 'both':
        return `Generate both WhatsApp and table ordering QR codes for ${analysis.total} tables`;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bulk Generate QR Codes</h2>
              <p className="text-sm text-gray-500">Generate QR codes for multiple tables at once</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isGenerating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Table Analysis */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Current QR Code Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{analysis.total}</div>
                <div className="text-xs text-gray-500">Total Tables</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.hasWhatsapp}</div>
                <div className="text-xs text-gray-500">WhatsApp QR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.hasTableOrdering}</div>
                <div className="text-xs text-gray-500">Table Ordering</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysis.hasBoth}</div>
                <div className="text-xs text-gray-500">Both Types</div>
              </div>
            </div>
          </div>

          {/* Generation Type Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select QR Code Type</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="qrType"
                  value="both"
                  checked={selectedType === 'both'}
                  onChange={(e) => setSelectedType(e.target.value as 'both')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Both Types</div>
                    <div className="text-xs text-gray-500">WhatsApp + Table Ordering QR codes</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="qrType"
                  value="whatsapp"
                  checked={selectedType === 'whatsapp'}
                  onChange={(e) => setSelectedType(e.target.value as 'whatsapp')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">WhatsApp Only</div>
                    <div className="text-xs text-gray-500">Generate WhatsApp QR codes only</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="qrType"
                  value="table_ordering"
                  checked={selectedType === 'table_ordering'}
                  onChange={(e) => setSelectedType(e.target.value as 'table_ordering')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Table Ordering Only</div>
                    <div className="text-xs text-gray-500">Generate table ordering QR codes only</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Warning for existing QR codes */}
          {analysis.hasWhatsapp > 0 || analysis.hasTableOrdering > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Existing QR Codes</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Some tables already have QR codes. Generating new ones will replace the existing codes.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Generation Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Ready to Generate</h4>
                <p className="text-sm text-blue-700 mt-1">{getGenerationMessage()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Generate QR Codes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkGenerateModal;
