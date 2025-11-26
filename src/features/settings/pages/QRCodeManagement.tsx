import { useState, useMemo, useEffect } from 'react';
import { Settings as SettingsIcon, RefreshCw, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumbs from '@/features/settings/components/Breadcrumbs';
import BranchSelector from '@/features/settings/components/BranchSelector';
import QRCodeFilters from '@/features/settings/components/QRCodeFilters';
import QRCodeGrid from '@/features/settings/components/QRCodeGrid';
import QRCodePagination from '@/features/settings/components/QRCodePagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import LoadingPlaceholder from '@/components/ui/LoadingPlaceholder';
import ErrorPlaceholder from '@/components/ui/ErrorPlaceholder';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';
import { Table } from '@/types/table';
import { Branch } from '@/types/branch';
import { tableService } from '@/services/tableService';
import { branchService } from '@/services/branchService';

// WhatsApp-only QR code interface
interface WhatsAppQRCode {
  id: string;
  tableId: string;
  tableName: string;
  section: string;
  whatsappUrl?: string;
  whatsappQrCodeImage?: string;
  generated: boolean;
}

const QRCodeManagement = () => {
  // State management
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [qrCodes, setQRCodes] = useState<WhatsAppQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  
  // WhatsApp-only QR code management - no modal needed

  // Data conversion helper - WhatsApp only
  const convertTableToQRCode = (table: Table): WhatsAppQRCode => {
    const result = {
      id: table.id,
      tableId: table.id,
      tableName: table.table_name,
      section: table.section || 'No Section',
      whatsappUrl: table.whatsapp_url || table.qr_code_url, // Fallback to qr_code_url if whatsapp_url is null
      whatsappQrCodeImage: table.whatsapp_qr_code_image_url || table.qr_code_image_url, // Fallback to qr_code_image_url if whatsapp_qr_code_image_url is null
      generated: !!(table.whatsapp_qr_code_image_url || table.qr_code_image_url), // Check both fields
    };
    
    console.log(`Converting table ${table.table_name}:`, {
      original: {
        whatsapp_url: table.whatsapp_url,
        whatsapp_qr_code_image_url: table.whatsapp_qr_code_image_url,
        qr_code_url: table.qr_code_url,
        qr_code_image_url: table.qr_code_image_url,
      },
      converted: result
    });
    
    return result;
  };

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedQRCodes, setSelectedQRCodes] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Load branches on component mount
  useEffect(() => {
    loadBranches();
  }, []);

  // Load tables when branch changes
  useEffect(() => {
    if (selectedBranch) {
      loadTables(selectedBranch.id.toString());
    }
  }, [selectedBranch]);

  // Convert tables to QR codes when tables change
  useEffect(() => {
    const converted = tables.map(convertTableToQRCode);
    console.log('Tables converted to QR codes:', converted);
    setQRCodes(converted);
  }, [tables]);

  // API Functions
  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await branchService.getBranches();
      if (response.success && response.data) {
        const branchesData = response.data.branches || response.data;
        setBranches(branchesData);
        if (branchesData.length > 0) {
          setSelectedBranch(branchesData[0]);
        }
      } else {
        setError('Failed to load branches');
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async (branchId: string) => {
    try {
      setLoading(true);
      const response = await tableService.getTables(branchId);
      if (response.success && response.data) {
        setTables(response.data.tables || []);
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
      toast.error('Failed to load tables');
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique sections
  const sections = useMemo(() => {
    const uniqueSections = Array.from(new Set(qrCodes.map(qr => qr.section).filter(Boolean)));
    return uniqueSections.sort();
  }, [qrCodes]);

  // Filter QR codes
  const filteredQRCodes = useMemo(() => {
    return qrCodes.filter(qrCode => {
      const matchesSearch = !searchTerm || 
        qrCode.tableId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qrCode.section.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSection = !selectedSection || qrCode.section === selectedSection;
      
      const matchesStatus = !selectedStatus || 
        (selectedStatus === 'generated' ? qrCode.generated : !qrCode.generated);

      return matchesSearch && matchesSection && matchesStatus;
    });
  }, [qrCodes, searchTerm, selectedSection, selectedStatus]);

  // Paginate filtered QR codes
  const paginatedQRCodes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQRCodes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQRCodes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredQRCodes.length / itemsPerPage);

  // Handlers
  const handleSelectQRCode = (id: string) => {
    setSelectedQRCodes(prev => 
      prev.includes(id) 
        ? prev.filter(qrId => qrId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQRCodes(filteredQRCodes.map(qr => qr.id));
    } else {
      setSelectedQRCodes([]);
    }
  };

  const handleDownload = async (qrCode: WhatsAppQRCode, type?: 'whatsapp') => {
    try {
      if (type === 'whatsapp' && qrCode.whatsappQrCodeImage) {
        await tableService.downloadQrCode(qrCode.whatsappQrCodeImage, `${qrCode.tableName}-whatsapp`);
        toast.success('WhatsApp QR code downloaded successfully');
      } else {
        toast.error('WhatsApp QR code not available');
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const handleCopyLink = async (url: string, type?: 'whatsapp' | 'table_ordering') => {
    try {
      await tableService.copyQrCodeUrl(url);
      const typeText = type === 'whatsapp' ? 'WhatsApp' : type === 'table_ordering' ? 'Table ordering' : '';
      toast.success(`${typeText} link copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleOpen = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('URL not available');
    }
  };

  const handleGenerate = async (id: string) => {
    if (!selectedBranch) return;
    
    try {
      setGeneratingQR(id);
      const response = await tableService.generateQrCode(selectedBranch.id.toString(), id);
      
      if (response.success && response.data) {
        toast.success('QR code generated successfully');
        // Reload tables to get updated QR code data
        await loadTables(selectedBranch.id.toString());
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setGeneratingQR(null);
    }
  };

  // WhatsApp-only QR code generation - no dual functionality needed

  // Utility function to check if WhatsApp QR codes are valid
  const areQrCodesValid = (qrCode: WhatsAppQRCode): boolean => {
    return Boolean(qrCode.whatsappQrCodeImage && 
                  !qrCode.whatsappQrCodeImage.includes('temp_') &&
                  qrCode.whatsappQrCodeImage.startsWith('http'));
  };

  // Get QR codes that need regeneration
  const getInvalidQrCodes = (): WhatsAppQRCode[] => {
    return qrCodes.filter(qrCode => !areQrCodesValid(qrCode));
  };

  // Bulk regenerate invalid QR codes
  const handleBulkRegenerateInvalid = async () => {
    if (!selectedBranch) return;
    
    const invalidQrCodes = getInvalidQrCodes();
    if (invalidQrCodes.length === 0) {
      toast.info('All QR codes are valid!');
      return;
    }

    try {
      setGeneratingQR('bulk');
      let successCount = 0;
      let errorCount = 0;

      for (const qrCode of invalidQrCodes) {
        try {
          const response = await tableService.generateDualQrCodes(selectedBranch.id.toString(), qrCode.tableId);
          if (response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          console.error(`Failed to regenerate QR codes for table ${qrCode.tableId}:`, err);
          errorCount++;
        }
      }

      // Reload tables to get updated QR code data
      await loadTables(selectedBranch.id.toString());

      if (successCount > 0) {
        toast.success(`Successfully regenerated ${successCount} QR code(s)`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to regenerate ${errorCount} QR code(s)`);
      }
    } catch (error) {
      console.error('Failed to bulk regenerate QR codes:', error);
      toast.error('Failed to bulk regenerate QR codes');
    } finally {
      setGeneratingQR(null);
    }
  };

  // WhatsApp-only view - no dual functionality needed

  const handleDownloadSelected = async () => {
    try {
      const selectedTables = tables.filter(table => selectedQRCodes.includes(table.id));
      if (selectedBranch) {
        await tableService.downloadMultipleQrCodes(selectedTables, 'both');
        toast.success(`Downloaded ${selectedQRCodes.length} QR codes`);
      } else {
        toast.error('No branch selected');
      }
    } catch (error) {
      console.error('Failed to download selected QR codes:', error);
      toast.error('Failed to download selected QR codes');
    }
  };

  const handlePrintSheet = () => {
    window.print();
  };

  const handleExportZIP = async () => {
    try {
      const selectedTables = selectedQRCodes.length > 0 
        ? tables.filter(table => selectedQRCodes.includes(table.id))
        : tables;
      
      if (selectedBranch) {
        await tableService.downloadMultipleQrCodes(selectedTables, 'both');
        toast.success('QR codes exported successfully');
      } else {
        toast.error('No branch selected');
      }
    } catch (error) {
      console.error('Failed to export QR codes:', error);
      toast.error('Failed to export QR codes');
    }
  };

  const handleManageTables = () => {
    // Navigate to table setup page
    window.location.href = '/settings/table-setup';
  };

  const breadcrumbItems = [
    { label: 'Settings', path: '/settings' },
    { label: 'QR Codes' },
  ];

  const selectAll = selectedQRCodes.length === filteredQRCodes.length && filteredQRCodes.length > 0;

  if (loading && branches.length === 0) {
    return (
      <LoadingPlaceholder
        icon={QrCode}
        title="Loading QR Codes"
        subtitle="Please wait while we fetch your QR code information"
        size="lg"
      />
    );
  }

  if (error) {
    return (
      <ErrorPlaceholder
        title="Error Loading QR Codes"
        subtitle={error}
        actionText="Try Again"
        onAction={() => window.location.reload()}
        size="lg"
      />
    );
  }

  if (branches.length === 0) {
    return (
      <EmptyPlaceholder
        icon={QrCode}
        title="No Branches Found"
        subtitle="You need to create a branch before you can manage QR codes. Branches help organize your business locations."
        actionText="Create Your First Branch"
        onAction={() => window.location.href = '/settings/branches'}
        size="lg"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
              <p className="text-gray-600">Preview and download QR codes for each table.</p>
            </div>
            <div className="flex items-center space-x-3">
              <BranchSelector
                branches={branches as any}
                selectedBranch={selectedBranch as any}
                onBranchChange={setSelectedBranch as any}
              />
              {getInvalidQrCodes().length > 0 && (
              <button
                onClick={handleBulkRegenerateInvalid}
                disabled={generatingQR === 'bulk'}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-300 rounded-md hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingQR === 'bulk' ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Regenerating...
                  </>
                ) : (
                  <>                    
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate Invalid ({getInvalidQrCodes().length})
                      </>
                  </>
                  )}
                </button>
              )}
              <button
                onClick={handleManageTables}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Manage tables
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <QRCodeFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          sections={sections}
          selectAll={selectAll}
          onSelectAll={handleSelectAll}
          selectedCount={selectedQRCodes.length}
          onDownloadSelected={handleDownloadSelected}
          onPrintSheet={handlePrintSheet}
          onExportZIP={handleExportZIP}
        />

        {/* QR Code Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <QRCodeGrid
              qrCodes={paginatedQRCodes}
              selectedQRCodes={selectedQRCodes}
              onSelectQRCode={handleSelectQRCode}
              onDownload={handleDownload}
              onCopyLink={handleCopyLink}
              onOpen={handleOpen}
              onGenerate={handleGenerate}
              generatingQR={generatingQR}
            />
          </div>
          
          {/* Pagination */}
          <QRCodePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredQRCodes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* WhatsApp QR Code Modal - Removed for simplicity */}
    </div>
  );
};

export default QRCodeManagement;
