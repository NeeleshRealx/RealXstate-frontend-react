import React, { useState } from 'react';
import { X, Download, Copy, ExternalLink, MessageSquare, Globe, Share2 } from 'lucide-react';
import { QRCode } from '@/types/table';

interface DualQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: QRCode;
  onDownload: (qrCode: QRCode, type: 'whatsapp' | 'table_ordering') => void;
  onCopyLink: (url: string, type: 'whatsapp' | 'table_ordering') => void;
  onOpen: (url: string) => void;
  onDownloadBoth?: (qrCode: QRCode) => void;
}

const DualQRCodeModal: React.FC<DualQRCodeModalProps> = ({
  isOpen,
  onClose,
  qrCode,
  onDownload,
  onCopyLink,
  onOpen,
  onDownloadBoth,
}) => {
  const [printMode, setPrintMode] = useState(false);

  if (!isOpen) return null;

  const hasWhatsApp = !!qrCode.whatsappQrCodeImage;
  const hasTableOrdering = !!(qrCode.tableOrderingQrCodeImage || qrCode.qrCodeImage);

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              QR Codes for {qrCode.tableId}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {qrCode.section} • Both WhatsApp and Table Ordering
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Table Ordering QR Code - HIDDEN FOR NOW */}
            {/* {hasTableOrdering && (
              <div className="text-center">
                <div className="bg-blue-50 border-2 border-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Globe className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-medium text-blue-900">
                      Table Ordering
                    </h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <img
                      src={qrCode.tableOrderingQrCodeImage || qrCode.qrCodeImage}
                      alt={`Table Ordering QR Code for ${qrCode.tableId}`}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-xs text-gray-600 break-all">
                      {qrCode.tableOrderingUrl || qrCode.url}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onDownload(qrCode, 'table_ordering')}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => onCopyLink(qrCode.tableOrderingUrl || qrCode.url || '', 'table_ordering')}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </button>
                    </div>
                    <button
                      onClick={() => onOpen(qrCode.tableOrderingUrl || qrCode.url || '')}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </button>
                  </div>
                </div>
              </div>
            )} */}

            {/* WhatsApp QR Code */}
            {hasWhatsApp && (
              <div className="text-center">
                <div className="bg-green-50 border-2 border-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium text-green-900">
                      WhatsApp Ordering
                    </h3>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <img
                      src={qrCode.whatsappQrCodeImage}
                      alt={`WhatsApp QR Code for ${qrCode.tableId}`}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-xs text-gray-600 break-all">
                      {qrCode.whatsappUrl}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onDownload(qrCode, 'whatsapp')}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-300 rounded hover:bg-green-50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => onCopyLink(qrCode.whatsappUrl || '', 'whatsapp')}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-300 rounded hover:bg-green-50"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </button>
                    </div>
                    <button
                      onClick={() => onOpen(qrCode.whatsappUrl || '')}
                      className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Usage Instructions */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Usage Instructions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              {hasTableOrdering && (
                <div className="flex items-start">
                  <Globe className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">Table Ordering</p>
                    <p>Customers scan this QR code to access your integrated ordering system directly.</p>
                  </div>
                </div>
              )}
              {hasWhatsApp && (
                <div className="flex items-start">
                  <MessageSquare className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">WhatsApp Ordering</p>
                    <p>Customers scan this QR code to send their order via WhatsApp message.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-500">
              Generated QR codes for {qrCode.tableId} • {qrCode.section}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Print Sheet
              </button>
              {onDownloadBoth && (
                <button
                  onClick={() => onDownloadBoth(qrCode)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Both
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      {printMode && (
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default DualQRCodeModal;
