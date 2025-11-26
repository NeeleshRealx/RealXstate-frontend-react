import React from 'react';
import { Download, Copy, ExternalLink, Plus, MessageSquare } from 'lucide-react';

interface QRCode {
  id: string;
  tableId: string;
  tableName: string;
  section: string;
  whatsappUrl?: string;
  whatsappQrCodeImage?: string;
  generated: boolean;
}

interface QRCodeCardProps {
  qrCode: QRCode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDownload: (qrCode: QRCode, type?: 'whatsapp') => void;
  onCopyLink: (url: string, type?: 'whatsapp') => void;
  onOpen: (url: string) => void;
  onGenerate: (id: string) => void;
}

const QRCodeCard: React.FC<QRCodeCardProps> = ({
  qrCode,
  isSelected,
  onSelect,
  onDownload,
  onCopyLink,
  onOpen,
  onGenerate,
}) => {
  const getSectionColor = (section: string) => {
    const colors = {
      'Main Hall': 'bg-blue-100 text-blue-800',
      'Patio': 'bg-green-100 text-green-800',
      'Bar Area': 'bg-purple-100 text-purple-800',
      'Private Room': 'bg-yellow-100 text-yellow-800',
      'Indoor': 'bg-blue-100 text-blue-800',
      'Bar A': 'bg-purple-100 text-purple-800',
    };
    return colors[section as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(qrCode.id)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>

      {/* Status indicator */}
      <div className="absolute top-3 right-3">
        <div
          className={`w-2 h-2 rounded-full ${
            qrCode.whatsappQrCodeImage ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      </div>

      {/* Table Name */}
      <div className="text-center mb-2 mt-4">
        <h3 className="text-lg font-bold text-gray-900">{qrCode.tableName}</h3>
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSectionColor(
            qrCode.section
          )}`}
        >
          {qrCode.section}
        </span>
      </div>

      {/* WhatsApp QR Code Preview */}
      <div className="flex justify-center mb-4">
        <div className="w-32 h-32 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
          {qrCode.whatsappQrCodeImage ? (
            <img
              src={qrCode.whatsappQrCodeImage}
              alt={`WhatsApp QR Code for ${qrCode.tableName}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded mb-2 mx-auto opacity-50"></div>
              <span className="text-xs text-gray-500">WhatsApp QR not generated</span>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp URL */}
      {/* {qrCode.whatsappUrl && (
        <div className="text-center mb-4">
          <p className="text-xs text-gray-500 break-all">
            {qrCode.whatsappUrl}
          </p>
        </div>
      )} */}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        {qrCode.whatsappQrCodeImage ? (
          // WhatsApp QR code exists - show download and copy actions
          <div className="flex justify-center space-x-1">
            <button
              onClick={() => onDownload(qrCode, 'whatsapp')}
              className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </button>
            <button
              onClick={() => onCopyLink(qrCode.whatsappUrl || '', 'whatsapp')}
              className="flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Link
            </button>
            {/* {qrCode.whatsappUrl && (
              <button
                onClick={() => onOpen(qrCode.whatsappUrl || '')}
                className="flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open
              </button>
            )} */}
          </div>
        ) : (
          // No WhatsApp QR code - show generate button
          <div className="flex justify-center">
            <button
              onClick={() => onGenerate(qrCode.id)}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Generate QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeCard;
