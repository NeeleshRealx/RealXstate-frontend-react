export interface Table {
  id: string;
  table_name: string;
  section?: string;
  is_active: boolean;
  qr_code_url?: string;
  qr_code_image_url?: string;
  whatsapp_url?: string;
  whatsapp_qr_code_image_url?: string;
  branch_id: string;
  business_id: string;
  created_at: string;
  updated_at: string;
}

export interface TableSection {
  id: string;
  name: string;
  description?: string;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTableData {
  table_name: string;
  section?: string;
  is_active?: boolean;
}

export interface UpdateTableData extends Partial<CreateTableData> {
  id?: string;
}

export interface BulkCreateTableData {
  tables: CreateTableData[];
}

export interface TableFilters {
  search: string;
  section: string;
  status: 'all' | 'active' | 'inactive';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

// QR Code related interfaces
export interface QRCodeResponse {
  qr_code_url: string;
  qr_code_image_url: string;
  message: string;
}

export interface DualQRCodeResponse {
  whatsapp_url: string;
  table_ordering_url: string;
  whatsapp_qr_code_image_url: string;
  table_ordering_qr_code_image_url: string;
  urls: {
    whatsapp_url: string;
    table_ordering_url: string;
    whatsapp_with_menu: string;
    table_ordering_with_menu: string;
  };
  message: string;
}

export interface QRCodeUrlTypes {
  whatsapp: string;
  tableOrdering: string;
  whatsappWithMenu: string;
  tableOrderingWithMenu: string;
}

export interface QRCode {
  id: string;
  tableId: string;
  tableName: string;
  section: string;
  url: string;
  generated: boolean;
  qrCodeImage?: string;
  whatsappUrl?: string;
  whatsappQrCodeImage?: string;
  tableOrderingUrl?: string;
  tableOrderingQrCodeImage?: string;
}
