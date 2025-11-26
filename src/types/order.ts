export interface OrderItem {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  price: number;
  total_price: number;
  special_instructions?: string;
  menu_item_image?: string;
  variant_id?: string;
  variant_name?: string;
  modifiers?: OrderItemModifier[];
}

export interface OrderItemModifier {
  id: string;
  modifier_option_id: string;
  modifier_name: string;
  option_name: string;
  extra_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  table_id: string;
  table_name: string;
  table_section?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  status: OrderStatus;
  order_type: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  service_charge?: number;
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at: string;
  estimated_ready_time?: string;
  completed_at?: string;
  branch_id: string;
  branch_name: string;
}

export type OrderStatus = 
  | 'draft' 
  | 'sent_to_kitchen' 
  | 'in_progress' 
  | 'ready' 
  | 'completed' 
  | 'cancelled';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'digital_wallet' | 'online';

export interface OrderFilters {
  status?: OrderStatus[];
  order_type?: OrderType[];
  payment_status?: PaymentStatus[];
  table_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface CreateOrderData {
  branch_id: string;
  table_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  order_type: OrderType;
  status?: OrderStatus;
  items: {
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions?: string;
    variant_id?: string;
    modifiers?: {
      modifier_option_id: string;
      extra_price: number;
    }[];
  }[];
  subtotal?: number;
  discount_amount?: number;
  service_charge?: number;
  tax_amount?: number;
  total_amount?: number;
  kitchen_notes?: string;
  customer_notes?: string;
  notes?: string;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod;
  notes?: string;
  estimated_ready_time?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data?: Order;
  errors?: Record<string, string[]>;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data?: {
    orders: Order[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
  errors?: Record<string, string[]>;
}

export interface OrderStatsResponse {
  success: boolean;
  message: string;
  data?: OrderStats;
  errors?: Record<string, string[]>;
}
