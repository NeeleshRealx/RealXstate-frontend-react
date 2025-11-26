import React from 'react';
import { X, Download, Copy, ExternalLink, MessageSquare, Globe, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';

interface QRCodeData {
  id: string;
  name: string;
  section: string;
  active: boolean;
  qrCodeUrl?: string;
  whatsappUrl?: string;
  hasQrCode?: boolean;
  hasWhatsappQr?: boolean;
  diningCode?: string;
  phoneNumber?: string;
  assistantId?: string;
  status?: string;
}

interface QRCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: QRCodeData;
  onDownload?: (table: QRCodeData, type: 'whatsapp' | 'table_ordering' | 'both') => void;
  onCopyLink?: (url: string, type: 'whatsapp' | 'table_ordering') => void;
  onOpen?: (url: string) => void;
}

const QRCodeViewerModal: React.FC<QRCodeViewerModalProps> = ({
  isOpen,
  onClose,
  table,
  onDownload,
  onCopyLink,
  onOpen,
}) => {
  if (!isOpen) return null;

  // Debug logging
  console.log('QRCodeViewerModal - table data:', {
    name: table.name,
    qrCodeUrl: table.qrCodeUrl,
    whatsappUrl: table.whatsappUrl,
    hasQrCode: table.hasQrCode,
    hasWhatsappQr: table.hasWhatsappQr
  });

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Generate QR code URLs for display (in real app, these would come from backend)
  const generateQRCodeUrl = (text: string) => {
    // This is a placeholder - in production, you'd use a real QR code generation service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
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
              QR Codes for {table.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {table.section} • View and manage QR codes
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
             {/* {table.hasQrCode && table.qrCodeUrl && (
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
                      src={generateQRCodeUrl(table.qrCodeUrl || '')}
                      alt={`Table Ordering QR Code for ${table.name}`}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-xs text-gray-600 break-all">
                      {table.qrCodeUrl || 'URL not available'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      {onDownload && (
                        <button
                          onClick={() => onDownload(table, 'table_ordering')}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      )}
                      {onCopyLink && table.qrCodeUrl && (
                        <button
                          onClick={() => onCopyLink(table.qrCodeUrl!, 'table_ordering')}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </button>
                      )}
                    </div>
                    {onOpen && table.qrCodeUrl && (
                      <button
                        onClick={() => onOpen(table.qrCodeUrl!)}
                        className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )} */}

                           {/* WhatsApp QR Code */}
               {table.hasWhatsappQr && table.whatsappUrl && (
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
                      src={generateQRCodeUrl(table.whatsappUrl || '')}
                      alt={`WhatsApp QR Code for ${table.name}`}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-xs text-gray-600 break-all">
                      {table.whatsappUrl || 'URL not available'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      {onDownload && (
                        <button
                          onClick={() => onDownload(table, 'whatsapp')}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-300 rounded hover:bg-green-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </button>
                      )}
                      {onCopyLink && table.whatsappUrl && (
                        <button
                          onClick={() => onCopyLink(table.whatsappUrl!, 'whatsapp')}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-white border border-green-300 rounded hover:bg-green-50"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </button>
                      )}
                    </div>
                    {onOpen && table.whatsappUrl && (
                      <button
                        onClick={() => onOpen(table.whatsappUrl!)}
                        className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dining Code Section */}
          {table.diningCode && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-sm">🍽️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Dining Code</h3>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2 font-mono tracking-wider">
                    {table.diningCode}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Share this code with your waiter for personalized service
                  </p>
                  
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(table.diningCode!);
                        toast.success('Dining code copied to clipboard');
                        // You might want to add a toast notification here
                      }}
                      className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded hover:bg-green-200 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Session Status */}
              {table.status && (
                <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-blue-900">
                      Session Status: {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    </span>
                  </div>
                  {table.phoneNumber && (
                    <p className="text-xs text-blue-700">
                      Customer Phone: {table.phoneNumber}
                    </p>
                  )}
                  {table.assistantId && (
                    <p className="text-xs text-blue-700">
                      AI Assistant: Connected
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-2">How it works:</p>
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Message sent to WhatsApp:</p>
                  <p className="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
                    Hi, I'm at {table.name} of Restaurant :fork_and_knife:<br/>
                    Dining Code: {table.diningCode} (for my waiter)
                  </p>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Customers scan the QR code to access your menu</li>
                  <li>They receive this unique dining code for their table</li>
                  <li>They can share this code with staff for assistance</li>
                  <li>Staff can use this code to identify and assist the table</li>
                  <li>When they send the message, the session becomes active</li>
                </ul>
              </div>
            </div>
          )}

                       {/* No QR Codes Message */}
             {!table.hasQrCode && !table.hasWhatsappQr && (
               <div className="text-center py-12">
                 <div className="text-gray-500">
                   <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                   <p className="text-lg font-medium">No QR codes generated yet</p>
                   <p className="text-sm">Generate QR codes to enable table ordering and WhatsApp integration</p>
                 </div>
               </div>
             )}

             {/* Partial QR Codes Message */}
             {(table.hasQrCode || table.hasWhatsappQr) && (!table.hasQrCode || !table.hasWhatsappQr) && (
               <div className="text-center py-8">
                 <div className="text-amber-600 bg-amber-50 rounded-lg p-4">
                   <p className="text-sm font-medium">Partial QR Code Coverage</p>
                   <p className="text-xs text-amber-700 mt-1">
                     {!table.hasQrCode && 'Table ordering QR code not generated yet. '}
                     {!table.hasWhatsappQr && 'WhatsApp QR code not generated yet. '}
                     Use the "Generate" or "Dual QR" buttons to create missing codes.
                   </p>
                 </div>
               </div>
             )}

             {/* Debug Info (remove in production) */}
             {process.env.NODE_ENV === 'development' && (
               <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                 <p><strong>Debug Info:</strong></p>
                 <p>Table Ordering URL: {table.qrCodeUrl || 'None'}</p>
                 <p>WhatsApp URL: {table.whatsappUrl || 'None'}</p>
                 <p>Has Table QR: {table.hasQrCode ? 'Yes' : 'No'}</p>
                 <p>Has WhatsApp QR: {table.hasWhatsappQr ? 'Yes' : 'No'}</p>
               </div>
             )}

          {/* Usage Instructions */}
          {(table.hasQrCode || table.hasWhatsappQr) && (
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Usage Instructions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                {/* {table.hasQrCode && (
                  <div className="flex items-start">
                    <Globe className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">Table Ordering</p>
                      <p>Customers scan this QR code to access your integrated ordering system directly.</p>
                    </div>
                  </div>
                )} */}
                {table.hasWhatsappQr && (
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
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {table.name} • {table.section}
            </div>
            <div className="flex space-x-3">
              {onDownload && (table.hasQrCode || table.hasWhatsappQr) && (
                <button
                  onClick={() => onDownload(table, 'both')}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeViewerModal;
