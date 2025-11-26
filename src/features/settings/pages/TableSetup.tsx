import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Download, QrCode, Upload, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBranchContext } from '@/contexts/BranchContext';
import { tableService } from '@/services/tableService';
import { Table as ApiTable } from '@/types/table';

import BranchSelector from '@/features/settings/components/BranchSelector';
import SearchAndFilters from '@/features/settings/components/SearchAndFilters';
import TableList from '@/features/settings/components/TableList';
import TableModal from '@/features/settings/components/TableModal';
import Pagination from '@/features/settings/components/Pagination';
import SettingsHeader from '@/components/layout/SettingsHeader';
import QRCodeViewerModal from '@/features/settings/components/QRCodeViewerModal';
import BulkGenerateModal from '@/features/settings/components/BulkGenerateModal';
import CSVImportModal from '@/features/settings/components/CSVImportModal';
import { ErrorPlaceholder, EmptyPlaceholder } from '@/components/ui';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

// UI Table interface that matches what the components expect
interface UITable {
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

const TableSetup: React.FC = () => {
  // Use branch context instead of local state
  const { selectedBranch, branches, isLoadingBranches, handleBranchChange } = useBranchContext();
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [uiTables, setUiTables] = useState<UITable[]>([]);
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug logging for branch context
  console.log('[TableSetup] Branch context state:', {
    selectedBranch: selectedBranch?.id,
    branchesCount: branches.length,
    isLoadingBranches,
    branches: branches.map(b => ({ id: b.id, name: b.name }))
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<ApiTable | null>(null);
  const [qrCodeViewerModal, setQrCodeViewerModal] = useState<{
    isOpen: boolean;
    table: UITable | null;
  }>({
    isOpen: false,
    table: null,
  });
  const [bulkGenerateModal, setBulkGenerateModal] = useState(false);
  const [csvImportModal, setCsvImportModal] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Convert API Table to UI Table
  const convertApiTableToUITable = (apiTable: ApiTable): UITable => {
    // Debug: Log the raw API data
    console.log(`Converting table ${apiTable.table_name}:`, {
      qr_code_url: apiTable.qr_code_url,
      whatsapp_url: apiTable.whatsapp_url,
      qr_code_image_url: apiTable.qr_code_image_url,
      whatsapp_qr_code_image_url: apiTable.whatsapp_qr_code_image_url
    });
    
    // Detect if URL is WhatsApp-based
    const isWhatsAppUrl = (url: string) => url.includes('wa.me') || url.includes('whatsapp');
    
    // Determine which URL is for table ordering vs WhatsApp
    let tableOrderingUrl: string | undefined;
    let whatsappUrl: string | undefined;
    
    if (apiTable.qr_code_url && apiTable.whatsapp_url) {
      // Both URLs exist - use them as intended
      tableOrderingUrl = apiTable.qr_code_url;
      whatsappUrl = apiTable.whatsapp_url;
    } else if (apiTable.qr_code_url) {
      // Only qr_code_url exists - check if it's WhatsApp or table ordering
      if (isWhatsAppUrl(apiTable.qr_code_url)) {
        whatsappUrl = apiTable.qr_code_url;
        tableOrderingUrl = undefined; // No table ordering URL yet
      } else {
        tableOrderingUrl = apiTable.qr_code_url;
        whatsappUrl = undefined; // No WhatsApp URL yet
      }
    }
    
    // If whatsapp_url exists separately, use it
    if (apiTable.whatsapp_url) {
      whatsappUrl = apiTable.whatsapp_url;
    }
    
    const result = {
      id: apiTable.id,
      name: apiTable.table_name,
      section: apiTable.section || '',
      active: apiTable.is_active,
      qrCodeUrl: tableOrderingUrl,
      whatsappUrl: whatsappUrl,
      hasQrCode: !!tableOrderingUrl,
      hasWhatsappQr: !!whatsappUrl,
      diningCode: undefined, // Will be populated by fetchDiningCodes
    };
    
    console.log(`Converted to UI table:`, result);
    return result;
  };

  // Fetch dining codes for all tables
  const fetchDiningCodes = async (uiTables: UITable[]): Promise<UITable[]> => {
    try {
      const updatedTables = await Promise.all(
        uiTables.map(async (table) => {
          try {
            const response = await tableService.getDiningCode(table.id);
            if (response.success && response.data) {
              return { 
                ...table, 
                diningCode: response.data.code,
                phoneNumber: response.data.phone_number,
                assistantId: response.data.assistant_id,
                status: response.data.status
              };
            }
          } catch (error) {
            console.log(`No dining code found for table ${table.id}:`, error);
          }
          return table;
        })
      );
      return updatedTables;
    } catch (error) {
      console.error('Error fetching dining codes:', error);
      return uiTables;
    }
  };



  // Load branches
  // Branches are now loaded by the BranchContext

  // Load tables when branch changes
  useEffect(() => {
    if (!selectedBranch) return;

    const loadTables = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await tableService.getTables(selectedBranch.id.toString());
        console.log(response, ' response tables');
        if (response.success && response.data && response.data.tables) {
          console.log('Setting tables state with:', response.data.tables);
          // Debug: Log each table's QR code data
          response.data.tables.forEach((table: ApiTable) => {
            console.log(`Table ${table.table_name}:`, {
              qr_code_url: table.qr_code_url,
              whatsapp_url: table.whatsapp_url,
              qr_code_image_url: table.qr_code_image_url,
              whatsapp_qr_code_image_url: table.whatsapp_qr_code_image_url
            });
          });
          setTables(response.data.tables);
        } else {
          setError('Failed to load tables');
        }
      } catch (err) {
        console.error('Error loading tables:', err);
        setError('Failed to load tables');
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, [selectedBranch]);

  // Debug: Monitor tables state changes
  useEffect(() => {
    console.log('Tables state changed:', tables, 'length:', tables.length);
  }, [tables]);

  // Get unique sections - moved before conditional returns to follow Rules of Hooks
  const sections = useMemo(() => {
    console.log('sections useMemo - tables:', tables, 'length:', tables.length);
    const uniqueSections = Array.from(new Set(tables.map(table => table.section).filter(Boolean)));
    return uniqueSections.filter((section): section is string => section !== undefined);
  }, [tables]);

  // Filter tables
  const filteredTables = useMemo(() => {
    console.log('filteredTables useMemo - tables:', tables, 'length:', tables.length);
    console.log('filteredTables useMemo - searchTerm:', searchTerm, 'selectedSection:', selectedSection, 'selectedStatus:', selectedStatus);
    
    const filtered = tables.filter(table => {
      const matchesSearch = !searchTerm || 
        table.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (table.section && table.section.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSection = !selectedSection || table.section === selectedSection;
      
      const matchesStatus = selectedStatus === 'all' || 
        (selectedStatus === 'active' ? table.is_active : !table.is_active);

      console.log(`Table ${table.table_name}: matchesSearch=${matchesSearch}, matchesSection=${matchesSection}, matchesStatus=${matchesStatus}, final=${matchesSearch && matchesSection && matchesStatus}`);
      
      return matchesSearch && matchesSection && matchesStatus;
    });
    
    console.log('filteredTables useMemo - filtered result:', filtered, 'length:', filtered.length);
    return filtered;
  }, [tables, searchTerm, selectedSection, selectedStatus]);

  // Paginate filtered tables
  const paginatedTables = useMemo(() => {
    console.log('paginatedTables useMemo - filteredTables:', filteredTables, 'length:', filteredTables.length);
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTables.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTables, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);

  // Update UI tables when tables change
  useEffect(() => {
    const updateUiTables = async () => {
      const convertedTables = paginatedTables.map(convertApiTableToUITable);
      const tablesWithDiningCodes = await fetchDiningCodes(convertedTables);
      setUiTables(tablesWithDiningCodes);
    };
    
    updateUiTables();
  }, [paginatedTables]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Settings', href: '/settings' },
    { label: 'Table Setup' }
  ];

  if (isLoadingBranches) {
    return (
      <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs skeleton */}
          <div className="mb-4">
            <SkeletonLoader height="h-4" width="w-32" />
          </div>
          
          {/* Page header skeleton */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <SkeletonLoader height="h-8" width="w-48" className="mb-2" />
                <SkeletonLoader height="h-4" width="w-80" />
              </div>
              {/* Branch selector skeleton */}
              <SkeletonLoader height="h-10" width="w-40" className="rounded-md" />
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="mb-6">
            <div className="flex gap-3">
              <SkeletonLoader height="h-10" width="w-32" className="rounded-md" />
              <SkeletonLoader height="h-10" width="w-36" className="rounded-md" />
              <SkeletonLoader height="h-10" width="w-28" className="rounded-md" />
              <SkeletonLoader height="h-10" width="w-36" className="rounded-md" />
            </div>
          </div>
          
          {/* Search and filters skeleton */}
          <div className="mb-6">
            <div className="flex gap-4">
              <SkeletonLoader height="h-10" width="w-80" className="rounded-md" />
              <SkeletonLoader height="h-10" width="w-32" className="rounded-md" />
              <SkeletonLoader height="h-10" width="w-28" className="rounded-md" />
            </div>
          </div>
          
          {/* Table skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Table header skeleton */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-5 gap-6">
                <SkeletonLoader height="h-4" width="w-24" /> {/* TABLE NAME */}
                <SkeletonLoader height="h-4" width="w-16" /> {/* SECTION */}
                <SkeletonLoader height="h-4" width="w-12" /> {/* ACTIVE */}
                <SkeletonLoader height="h-4" width="w-20" /> {/* QR CODE */}
                <div className="flex justify-end">
                  <SkeletonLoader height="h-4" width="w-16" /> {/* ACTIONS */}
                </div>
              </div>
            </div>
            
            {/* Table rows skeleton */}
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="grid grid-cols-5 gap-6 items-center">
                    {/* Table name */}
                    <SkeletonLoader height="h-4" width="w-20" />
                    {/* Section */}
                    <SkeletonLoader height="h-4" width="w-12" />
                    {/* Active toggle */}
                    {/* <div className="flex justify-center"> */}
                      <SkeletonLoader height="h-6" width="w-11" className="rounded-full" />
                    {/* </div> */}
                    {/* QR Code buttons */}
                    <div className="flex gap-2">
                      <SkeletonLoader height="h-8" width="w-20" className="rounded-md" />
                      <SkeletonLoader height="h-8" width="w-16" className="rounded-md" />
                    </div>
                    {/* Actions */}
                    <div className="flex justify-end">
                      <SkeletonLoader height="h-4" width="w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorPlaceholder
        title="Error Loading Table Setup"
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
        icon={Building2}
        title="No Branches Found"
        subtitle="You need to create a branch before you can set up tables. Branches help organize your business locations."
        actionText="Create Your First Branch"
        onAction={() => window.location.href = '/settings/branches'}
        size="lg"
      />
    );
  }

  // Handlers
  const handleAddTable = () => {
    setEditingTable(null);
    setIsModalOpen(true);
  };

  const handleEditTable = (uiTable: UITable) => {
    // Find the corresponding API table
    const apiTable = tables.find(t => String(t.id) === String(uiTable.id));
    if (apiTable) {
      setEditingTable(apiTable);
      setIsModalOpen(true);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    console.log('Deleting table with ID:', tableId);
    console.log('Current tables before deletion:', tables.map(t => ({ id: t.id, name: t.table_name })));
    
    try {
      // Optimistically remove the table from local state immediately
      setTables(prev => {
        const filtered = prev.filter(table => String(table.id) !== String(tableId));
        console.log('Tables after optimistic removal:', filtered.map(t => ({ id: t.id, name: t.table_name })));
        return filtered;
      });
      
      await tableService.deleteTable(selectedBranch!.id.toString(), tableId);
      toast.success('Table deleted successfully');
      
      // Refresh tables to ensure data consistency
      if (selectedBranch) {
        console.log('Refreshing tables from server...');
        const response = await tableService.getTables(selectedBranch.id.toString());
        if (response.success && response.data && response.data.tables) {
          console.log('Tables from server after deletion:', response.data.tables.map(t => ({ id: t.id, name: t.table_name })));
          setTables(response.data.tables);
        }
      }
    } catch (err) {
      console.error('Error deleting table:', err);
      toast.error('Failed to delete table');
      
      // If deletion failed, refresh the data to restore the table
      if (selectedBranch) {
        const response = await tableService.getTables(selectedBranch.id.toString());
        if (response.success && response.data && response.data.tables) {
          setTables(response.data.tables);
        }
      }
    }
  };

  const handleToggleActive = async (tableId: string) => {
    try {
      const table = tables.find(t => String(t.id) === String(tableId));
      if (!table) return;

      const updatedTable = { ...table, is_active: !table.is_active };
      await tableService.updateTable(selectedBranch!.id.toString(), tableId, updatedTable);
      toast.success('Table status updated');
      
      // Update local state
      setTables(prev => prev.map(t => 
        String(t.id) === String(tableId) ? { ...t, is_active: !t.is_active } : t
      ));
    } catch (err) {
      console.error('Error updating table status:', err);
      toast.error('Failed to update table status');
    }
  };

  const handleSaveTable = async (tableData: any) => {
    try {
      if (editingTable) {
        // Update existing table
        await tableService.updateTable(selectedBranch!.id.toString(), editingTable.id, tableData);
        toast.success('Table updated successfully');
      } else {
        // Create new table
        await tableService.createTable(selectedBranch!.id.toString(), tableData);
        toast.success('Table created successfully');
      }
      
      // Refresh tables
      if (selectedBranch) {
        const response = await tableService.getTables(selectedBranch.id.toString());
        if (response.success && response.data && response.data.tables) {
          setTables(response.data.tables);
        }
      }
      
      setIsModalOpen(false);
      setEditingTable(null);
    } catch (err: any) {
      console.error('Error saving table:', err);
      toast.error(err.message || 'Failed to save table');
    }
  };

  const handleGenerateQrCode = async (table: ApiTable) => {
    try {
      const response = await tableService.generateQrCode(selectedBranch!.id.toString(), table.id);
      if (response.success) {
        toast.success('QR code generated successfully');
        // Refresh tables to get updated QR code data
        if (selectedBranch) {
          const tablesResponse = await tableService.getTables(selectedBranch.id.toString());
          if (tablesResponse.success && tablesResponse.data && tablesResponse.data.tables) {
            setTables(tablesResponse.data.tables);
          }
        }
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
      toast.error('Failed to generate QR code');
    }
  };

  const handleGenerateDualQrCodes = async (table: ApiTable) => {
    try {
      const response = await tableService.generateDualQrCodes(selectedBranch!.id.toString(), table.id);
      if (response.success) {
        toast.success('Dual QR codes generated successfully');
        // Refresh tables to get updated QR code data
        if (selectedBranch) {
          const tablesResponse = await tableService.getTables(selectedBranch.id.toString());
          if (tablesResponse.success && tablesResponse.data && tablesResponse.data.tables) {
            setTables(tablesResponse.data.tables);
          }
        }
      }
    } catch (err) {
      console.error('Error generating dual QR codes:', err);
      toast.error('Failed to generate dual QR codes');
    }
  };

  const handleDownloadQrCode = async (table: ApiTable, type: 'whatsapp' | 'table_ordering' | 'both' = 'both') => {
    try {
      if (type === 'both') {
        if (table.whatsapp_qr_code_image_url) {
          await tableService.downloadQrCode(table.whatsapp_qr_code_image_url, `${table.table_name}-whatsapp`);
        }
        if (table.qr_code_image_url) {
          await tableService.downloadQrCode(table.qr_code_image_url, `${table.table_name}-table-ordering`);
        }
        toast.success('QR codes downloaded successfully');
      } else if (type === 'whatsapp' && table.whatsapp_qr_code_image_url) {
        await tableService.downloadQrCode(table.whatsapp_qr_code_image_url, `${table.table_name}-whatsapp`);
        toast.success('WhatsApp QR code downloaded');
      } else if (type === 'table_ordering' && table.qr_code_image_url) {
        await tableService.downloadQrCode(table.qr_code_image_url, `${table.table_name}-table-ordering`);
        toast.success('Table ordering QR code downloaded');
      } else {
        toast.error('QR code not available');
      }
    } catch (err) {
      console.error('Error downloading QR code:', err);
      toast.error('Failed to download QR code');
    }
  };
  
  // Debug: Log the conversion results
  console.log('API Tables:', paginatedTables);
  console.log('UI Tables:', uiTables);

  // Wrapper functions to fix type mismatches
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as 'all' | 'active' | 'inactive');
  };

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
  };

  // QR Code wrapper functions that work with UI tables
  const handleGenerateQrCodeFromUI = (uiTable: UITable) => {
    const apiTable = tables.find(t => t.id === uiTable.id);
    if (apiTable) {
      handleGenerateQrCode(apiTable);
    }
  };

  const handleGenerateDualQrCodesFromUI = (uiTable: UITable) => {
    const apiTable = tables.find(t => t.id === uiTable.id);
    if (apiTable) {
      handleGenerateDualQrCodes(apiTable);
    }
  };

  const handleDownloadQrCodeFromUI = (uiTable: UITable, type?: 'whatsapp' | 'table_ordering' | 'both') => {
    const apiTable = tables.find(t => t.id === uiTable.id);
    if (apiTable) {
      handleDownloadQrCode(apiTable, type);
    }
  };

  const handleViewQrCodes = (uiTable: UITable) => {
    setQrCodeViewerModal({
      isOpen: true,
      table: uiTable,
    });
  };

  // Bulk generation handler
  const handleBulkGenerate = async (type: 'whatsapp' | 'table_ordering' | 'both') => {
    if (!selectedBranch) return;

    try {
      setIsBulkGenerating(true);
      const tableIds = tables.map(table => table.id);
      
      const response = await tableService.bulkGenerateQrCodes(selectedBranch.id.toString(), tableIds, type);
      
      if (response.success && response.data) {
        const { success, failed, errors } = response.data;
        
        if (success > 0) {
          toast.success(`Successfully generated QR codes for ${success} table${success !== 1 ? 's' : ''}`);
        }
        
        if (failed > 0) {
          toast.error(`Failed to generate QR codes for ${failed} table${failed !== 1 ? 's' : ''}`);
        }
        
        if (errors && errors.length > 0) {
          console.error('Bulk generation errors:', errors);
        }
        
        // Refresh tables to get updated QR code data
        const tablesResponse = await tableService.getTables(selectedBranch.id.toString());
        if (tablesResponse.success && tablesResponse.data && tablesResponse.data.tables) {
          setTables(tablesResponse.data.tables);
        }
      } else {
        toast.error('Failed to generate QR codes');
      }
    } catch (err) {
      console.error('Error bulk generating QR codes:', err);
      toast.error('Failed to generate QR codes');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  // CSV import handler
  const handleCSVImport = async (csvTables: Array<{ table_name: string; section: string; is_active: boolean }>) => {
    if (!selectedBranch) return;

    try {
      setIsImporting(true);
      
      const response = await tableService.bulkCreateTables(selectedBranch.id.toString(), { tables: csvTables });
      
      if (response.success && response.data) {
        toast.success(`Successfully imported ${csvTables.length} table${csvTables.length !== 1 ? 's' : ''}`);
        
        // Refresh tables
        const tablesResponse = await tableService.getTables(selectedBranch.id.toString());
        if (tablesResponse.success && tablesResponse.data && tablesResponse.data.tables) {
          setTables(tablesResponse.data.tables);
        }
      } else {
        toast.error('Failed to import tables');
      }
    } catch (err) {
      console.error('Error importing tables:', err);
      toast.error('Failed to import tables');
    } finally {
      setIsImporting(false);
    }
  };



  console.log(uiTables, 'uiTables');
  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
        {/* Breadcrumbs */}
        {/* <div className="mb-6"> */}
        <SettingsHeader
          breadcrumbs={breadcrumbItems}
        />
        {/* </div> */}


      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Table Setup</h1>
              <p className="text-gray-600">Add and organize tables for this branch.</p>
            </div>
            <BranchSelector
              branches={branches}
              selectedBranch={selectedBranch}
              onBranchChange={handleBranchChange}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleAddTable}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </button>
          {/* Bulk Generate */}
          {tables.length > 0 && (
          <button 
            onClick={() => setBulkGenerateModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Bulk Generate
          </button>
          )}
          {/* Import CSV */}
          <button 
            onClick={() => setCsvImportModal(true)}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Upload className="w-4 h-4 mr-1" />
            Import CSV
          </button>
          {/* Go to QR Codes */}
          <button onClick={() => window.location.href = `/settings/qr-codes?branch=${selectedBranch?.id}`} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
            <QrCode className="w-4 h-4 mr-1" />
            Go to QR Codes
          </button>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSection={selectedSection}
          onSectionChange={handleSectionChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          sections={sections}
        />

        {/* Table List */}
        <div className="bg-white rounded-lg shadow">
          <TableList
            tables={uiTables}
            onToggleActive={handleToggleActive}
            onGenerateQrCode={handleGenerateQrCodeFromUI}
            onGenerateDualQrCodes={handleGenerateDualQrCodesFromUI}
            onDownloadQrCode={handleDownloadQrCodeFromUI}
            onEditTable={handleEditTable}
            onDeleteTable={handleDeleteTable}
            onViewQrCodes={handleViewQrCodes}
            hasFilters={!!(searchTerm || selectedSection || selectedStatus !== 'all')}
            totalTables={tables.length}
          />
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTables.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      {/* Table Modal */}
      <TableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTable}
        table={editingTable ? {
          id: editingTable.id,
          table_name: editingTable.table_name,
          section: editingTable.section || '',
          active: editingTable.is_active
        } : undefined}
        sections={sections}
      />

      {/* QR Code Viewer Modal */}
      {qrCodeViewerModal.table && (
        <QRCodeViewerModal
          isOpen={qrCodeViewerModal.isOpen}
          onClose={() => setQrCodeViewerModal({ isOpen: false, table: null })}
          table={qrCodeViewerModal.table}
          onDownload={handleDownloadQrCodeFromUI}
          onCopyLink={(url, type) => {
            navigator.clipboard.writeText(url);
            toast.success(`${type === 'whatsapp' ? 'WhatsApp' : 'Table ordering'} link copied to clipboard`);
          }}
          onOpen={(url) => window.open(url, '_blank')}
        />
      )}

      {/* Bulk Generate Modal */}
      <BulkGenerateModal
        isOpen={bulkGenerateModal}
        onClose={() => setBulkGenerateModal(false)}
        onGenerate={handleBulkGenerate}
        tables={uiTables}
        isGenerating={isBulkGenerating}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={csvImportModal}
        onClose={() => setCsvImportModal(false)}
        onImport={handleCSVImport}
        isImporting={isImporting}
      />
    </div>
  );
};

export default TableSetup;
