import React from 'react';
import { QrCode, MoreVertical, Download, MessageSquare, Globe, Table, Database } from 'lucide-react';

interface Table {
  id: string;
  name: string;
  section: string;
  active: boolean;
  qrCodeUrl?: string;
  whatsappUrl?: string;
  hasQrCode?: boolean;
  hasWhatsappQr?: boolean;
}

interface TableListProps {
  tables: Table[];
  onToggleActive: (id: string) => void;
  onEditTable: (table: Table) => void;
  onDeleteTable: (id: string) => void;
  onGenerateQrCode?: (table: Table) => void;
  onGenerateDualQrCodes?: (table: Table) => void;
  onDownloadQrCode?: (table: Table, type?: 'whatsapp' | 'table_ordering' | 'both') => void;
  onViewQrCodes?: (table: Table) => void;
  hasFilters?: boolean; // Indicates if search/filters are applied
  totalTables?: number; // Total number of tables before filtering
}

const TableList: React.FC<TableListProps> = ({
  tables,
  onToggleActive,
  onEditTable,
  onDeleteTable,
  onGenerateQrCode,
  onGenerateDualQrCodes,
  onDownloadQrCode,
  onViewQrCodes,
  hasFilters = false,
  totalTables = 0,
}) => {
  console.log(tables, 'tables');
  // console.log(onGenerateQrCode, 'onGenerateQrCode');
  // console.log(onGenerateDualQrCodes, 'onGenerateDualQrCodes');
  // console.log(onDownloadQrCode, 'onDownloadQrCode');
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Table Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                QR Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tables.length > 0 ? (
              tables.map((table) => (
                <tr key={table.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {table.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {table.section || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleActive(table.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        table.active ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          table.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      {/* QR Code Status Indicators */}
                      <div className="flex items-center space-x-1">
                        {/* {table.hasQrCode && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Globe className="w-3 h-3 mr-1" />
                            Table
                          </span>
                        )} */}
                        {table.hasWhatsappQr && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            WhatsApp
                          </span>
                        )}
                        {!table.hasQrCode && !table.hasWhatsappQr && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <QrCode className="w-3 h-3 mr-1" />
                            No QR
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {/* View QR Codes Button - Always Show */}
                        {onViewQrCodes && (
                          <button
                            onClick={() => onViewQrCodes(table)}
                            // onClick={() => {
                            //   window.location.href = `/settings/qr-codes?tableId=${table.id}`;
                            // }}
                            className="flex items-center text-purple-600 hover:text-purple-700 text-xs font-medium px-2 py-1 rounded border border-purple-300 hover:bg-purple-50"
                            title="View QR Codes"
                          >
                            <QrCode className="w-3 h-3 mr-1" />
                            View
                          </button>
                        )}

                        {table.hasQrCode || table.hasWhatsappQr ? (
                        <>
                          {/* {table.hasQrCode && onDownloadQrCode && (
                            <button
                              onClick={() => onDownloadQrCode(table, 'table_ordering')}
                              className="flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-300 hover:bg-blue-50"
                              title="Download Table Ordering QR"
                            >
                              <Globe className="w-3 h-3 mr-1" />
                              Table
                            </button>
                          )}
                          {table.hasWhatsappQr && onDownloadQrCode && (
                            <button
                              onClick={() => onDownloadQrCode(table, 'whatsapp')}
                              className="flex items-center text-green-600 hover:text-green-700 text-xs font-medium px-2 py-1 rounded border border-green-300 hover:bg-green-50"
                              title="Download WhatsApp QR"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              WhatsApp
                            </button>
                          )}
                          {(table.hasQrCode && table.hasWhatsappQr) && onDownloadQrCode && (
                            <button
                              onClick={() => onDownloadQrCode(table, 'both')}
                              className="flex items-center text-gray-600 hover:text-gray-700 text-xs font-medium px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                              title="Download Both QR Codes"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Both
                            </button>
                          )} */}
                        </>
                      ) : (
                        <div className="flex items-center space-x-1">
                          {!table.hasQrCode && onGenerateQrCode && (
                            <button
                              onClick={() => onGenerateQrCode(table)}
                              className="flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium px-2 py-1 rounded border border-blue-300 hover:bg-blue-50"
                              title="Generate Standard QR Code"
                            >
                              <QrCode className="w-3 h-3 mr-1" />
                              Generate
                            </button>
                          )}
                          {/* Dual QR button - HIDDEN FOR NOW (includes table ordering) */}
                          {/* {!table.hasQrCode && !table.hasWhatsappQr && onGenerateDualQrCodes && (
                            <button
                              onClick={() => onGenerateDualQrCodes(table)}
                              className="flex items-center text-green-600 hover:text-green-700 text-xs font-medium px-2 py-1 rounded border border-green-300 hover:bg-green-50"
                              title="Generate Dual QR Codes (WhatsApp + Table Ordering)"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Dual QR
                            </button>
                          )} */}
                        </div>
                      )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => {
                          // Toggle dropdown or handle actions
                          const dropdown = document.getElementById(`dropdown-${table.id}`);
                          if (dropdown) {
                            dropdown.classList.toggle('hidden');
                          }
                        }}
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      <div
                        id={`dropdown-${table.id}`}
                        className="hidden absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                      >
                        <button
                          onClick={() => {
                            onEditTable(table);
                            document.getElementById(`dropdown-${table.id}`)?.classList.add('hidden');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDeleteTable(table.id);
                            document.getElementById(`dropdown-${table.id}`)?.classList.add('hidden');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      {hasFilters ? (
                        <Table className="w-8 h-8 text-gray-400" />
                      ) : (
                        <Database className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="text-gray-500">
                      {hasFilters ? (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No tables found</h3>
                          <p className="text-sm">
                            No tables match your current search or filter criteria. Try adjusting your search terms or filters.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No tables found</h3>
                          <p className="text-sm">
                            Get started by adding your first table. Click the "Add Table" button to create a new table.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableList;
