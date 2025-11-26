import React from 'react';
import QRCodeCard from './QRCodeCard';

// WhatsApp-only QR code interface
interface QRCode {
  id: string;
  tableId: string;
  tableName: string;
  section: string;
  whatsappUrl?: string;
  whatsappQrCodeImage?: string;
  generated: boolean;
}

interface QRCodeGridProps {
  qrCodes: QRCode[];
  selectedQRCodes: string[];
  onSelectQRCode: (id: string) => void;
  onDownload: (qrCode: QRCode, type?: 'whatsapp') => void;
  onCopyLink: (url: string, type?: 'whatsapp') => void;
  onOpen: (url: string) => void;
  onGenerate: (id: string) => void;
  generatingQR?: string | null;
}

const QRCodeGrid: React.FC<QRCodeGridProps> = ({
  qrCodes,
  selectedQRCodes,
  onSelectQRCode,
  onDownload,
  onCopyLink,
  onOpen,
  onGenerate,
  generatingQR,
}) => {
  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <p className="text-lg font-medium">No QR codes found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {qrCodes.map((qrCode) => (
        <QRCodeCard
          key={qrCode.id}
          qrCode={qrCode}
          isSelected={selectedQRCodes.includes(qrCode.id)}
          onSelect={onSelectQRCode}
          onDownload={onDownload}
          onCopyLink={onCopyLink}
          onOpen={onOpen}
          onGenerate={onGenerate}
        />
      ))}
    </div>
  );
};

export default QRCodeGrid;
