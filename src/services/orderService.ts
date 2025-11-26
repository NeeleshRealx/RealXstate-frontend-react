import api from '../lib/api';
import { 
  Order, 
  CreateOrderData, 
  UpdateOrderData, 
  OrderFilters, 
  OrderStats,
  OrderResponse, 
  OrdersResponse, 
  OrderStatsResponse 
} from '@/types/order';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
}

class OrderService {
  // Get all orders for a branch with filters and pagination
  async getOrders(branchId: string, filters?: OrderFilters, page: number = 1, perPage: number = 20): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(filters?.status && { status: filters.status.join(',') }),
        ...(filters?.order_type && { order_type: filters.order_type.join(',') }),
        ...(filters?.table_id && { table_id: filters.table_id }),
        ...(filters?.date_from && { date_from: filters.date_from }),
        ...(filters?.date_to && { date_to: filters.date_to }),
        ...(filters?.search && { search: filters.search }),
      });

      // Use the new order API endpoints
      const response = await api.get(`/business/orders/branches/${branchId}/orders?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      // If the endpoint doesn't exist yet, return mock data for development
      console.warn('Order API endpoint not implemented yet, returning mock data');
      return this.getMockOrders(filters, page, perPage);
    }
  }

  // Get a specific order by ID
  async getOrder(orderId: string): Promise<OrderResponse> {
    try {
      const response = await api.get(`/business/orders/branches/1/orders/${orderId}`);
      return response.data;
    } catch (error: unknown) {
      // If the endpoint doesn't exist yet, return mock data for development
      console.warn('Order API endpoint not implemented yet, returning mock data');
      return this.getMockOrder(orderId);
    }
  }

  // Create a new order
  async createOrder(branchId: string, data: CreateOrderData): Promise<OrderResponse> {
    try {
      const response = await api.post(`/business/orders/branches/${branchId}/orders`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update an existing order
  async updateOrder(orderId: string, data: UpdateOrderData): Promise<OrderResponse> {
    try {
      const response = await api.put(`/business/orders/branches/1/orders/${orderId}`, data);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Cancel an order
  async cancelOrder(orderId: string, reason?: string): Promise<OrderResponse> {
    try {
      const response = await api.post(`/business/orders/branches/1/orders/${orderId}/status`, { 
        status: 'cancelled', 
        notes: reason 
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Mark order as ready
  async markOrderReady(orderId: string): Promise<OrderResponse> {
    try {
      const response = await api.post(`/business/orders/branches/1/orders/${orderId}/status`, { 
        status: 'ready' 
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Mark order as served
  async markOrderServed(orderId: string): Promise<OrderResponse> {
    try {
      const response = await api.post(`/business/orders/branches/1/orders/${orderId}/status`, { 
        status: 'completed' 
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get order statistics
  async getOrderStats(branchId: string, dateFrom?: string, dateTo?: string): Promise<OrderStatsResponse> {
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await api.get(`/business/orders/branches/${branchId}/orders/stats?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      // If the endpoint doesn't exist yet, return mock data for development
      console.warn('Order stats API endpoint not implemented yet, returning mock data');
      return this.getMockOrderStats();
    }
  }

  // Get orders by table
  async getOrdersByTable(branchId: string, tableId: string): Promise<OrdersResponse> {
    try {
      const response = await api.get(`/business/branches/${branchId}/tables/${tableId}/orders`);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get today's orders
  async getTodaysOrders(branchId: string): Promise<OrdersResponse> {
    try {
      const today = new Date().toISOString().split('T')[0];
      return this.getOrders(branchId, { date_from: today, date_to: today });
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get pending orders (orders that need attention)
  async getPendingOrders(branchId: string): Promise<OrdersResponse> {
    try {
      return this.getOrders(branchId, { 
        status: ['draft', 'sent_to_kitchen', 'in_progress'] 
      });
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Bulk update order status
  async bulkUpdateOrderStatus(orderIds: string[], status: string): Promise<ApiResponse<{ success: number; failed: number; errors: string[] }>> {
    try {
      const response = await api.post('/business/orders/bulk-update-status', {
        order_ids: orderIds,
        status
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Validate order data
  validateOrderData(data: CreateOrderData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.table_id) {
      errors.push('Table ID is required');
    }

    if (!data.order_type) {
      errors.push('Order type is required');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required');
    } else {
              data.items.forEach((item: any, index: number) => {
        if (!item.menu_item_id) {
          errors.push(`Item ${index + 1}: Menu item ID is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (!item.price || item.price < 0) {
          errors.push(`Item ${index + 1}: Price must be greater than or equal to 0`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Mock data methods for development (remove when backend APIs are implemented)
  private getMockOrders(filters?: OrderFilters, page: number = 1, perPage: number = 20): OrdersResponse {
    const mockOrders: Order[] = [
      {
        id: '1',
        order_number: 'ORD-001',
        table_id: '1',
        table_name: 'Table 1',
        table_section: 'Main Hall',
        customer_name: 'John Doe',
        customer_phone: '+1234567890',
        customer_email: 'john@example.com',
        status: 'draft',
        order_type: 'dine_in',
        items: [
          {
            id: '1',
            menu_item_id: '1',
            menu_item_name: 'Grilled Chicken',
            quantity: 2,
            price: 15.99,
            total_price: 31.98,
            special_instructions: 'Extra crispy',
            menu_item_image: '/images/grilled-chicken.jpg'
          },
          {
            id: '2',
            menu_item_id: '2',
            menu_item_name: 'Caesar Salad',
            quantity: 1,
            price: 8.99,
            total_price: 8.99,
            menu_item_image: '/images/caesar-salad.jpg'
          }
        ],
        subtotal: 40.97,
        tax_amount: 3.28,
        service_charge: 2.00,
        total_amount: 46.25,
        payment_status: 'pending',
        payment_method: 'cash',
        notes: 'Customer prefers booth seating',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        estimated_ready_time: new Date(Date.now() + 30 * 60000).toISOString(),
        branch_id: '1',
        branch_name: 'Main Branch'
      },
      {
        id: '2',
        order_number: 'ORD-002',
        table_id: '2',
        table_name: 'Table 2',
        table_section: 'Outdoor',
        customer_name: 'Jane Smith',
        customer_phone: '+1234567891',
        status: 'in_progress',
        order_type: 'dine_in',
        items: [
          {
            id: '3',
            menu_item_id: '3',
            menu_item_name: 'Beef Burger',
            quantity: 1,
            price: 12.99,
            total_price: 12.99,
            special_instructions: 'Medium rare',
            menu_item_image: '/images/beef-burger.jpg'
          }
        ],
        subtotal: 12.99,
        tax_amount: 1.04,
        service_charge: 1.00,
        total_amount: 15.03,
        payment_status: 'paid',
        payment_method: 'card',
        created_at: new Date(Date.now() - 15 * 60000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
        estimated_ready_time: new Date(Date.now() + 15 * 60000).toISOString(),
        branch_id: '1',
        branch_name: 'Main Branch'
      },
      {
        id: '3',
        order_number: 'ORD-003',
        table_id: '3',
        table_name: 'Table 3',
        table_section: 'Main Hall',
        customer_name: 'Mike Johnson',
        customer_phone: '+1234567892',
        status: 'ready',
        order_type: 'takeaway',
        items: [
          {
            id: '4',
            menu_item_id: '4',
            menu_item_name: 'Fish & Chips',
            quantity: 1,
            price: 14.99,
            total_price: 14.99,
            menu_item_image: '/images/fish-chips.jpg'
          },
          {
            id: '5',
            menu_item_id: '5',
            menu_item_name: 'Cola',
            quantity: 2,
            price: 2.99,
            total_price: 5.98,
            menu_item_image: '/images/cola.jpg'
          }
        ],
        subtotal: 20.97,
        tax_amount: 1.68,
        service_charge: 0,
        total_amount: 22.65,
        payment_status: 'paid',
        payment_method: 'digital_wallet',
        created_at: new Date(Date.now() - 45 * 60000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60000).toISOString(),
        completed_at: new Date(Date.now() - 2 * 60000).toISOString(),
        branch_id: '1',
        branch_name: 'Main Branch'
      }
    ];

    // Apply filters
    let filteredOrders = mockOrders;
    
    if (filters?.status && filters.status.length > 0) {
      filteredOrders = filteredOrders.filter(order => filters.status!.includes(order.status));
    }
    
    if (filters?.order_type && filters.order_type.length > 0) {
      filteredOrders = filteredOrders.filter(order => filters.order_type!.includes(order.order_type));
    }
    
    if (filters?.table_id) {
      filteredOrders = filteredOrders.filter(order => order.table_id === filters.table_id);
    }
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm) ||
        order.customer_name?.toLowerCase().includes(searchTerm) ||
        order.customer_phone?.includes(searchTerm)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      success: true,
      message: 'Orders retrieved successfully (mock data)',
      data: {
        orders: paginatedOrders,
        pagination: {
          current_page: page,
          per_page: perPage,
          total: filteredOrders.length,
          last_page: Math.ceil(filteredOrders.length / perPage)
        }
      }
    };
  }

  private getMockOrder(orderId: string): OrderResponse {
    const mockOrder: Order = {
      id: orderId,
      order_number: 'ORD-001',
      table_id: '1',
      table_name: 'Table 1',
      table_section: 'Main Hall',
      customer_name: 'John Doe',
      customer_phone: '+1234567890',
      customer_email: 'john@example.com',
      status: 'draft',
      order_type: 'dine_in',
      items: [
        {
          id: '1',
          menu_item_id: '1',
          menu_item_name: 'Grilled Chicken',
          quantity: 2,
          price: 15.99,
          total_price: 31.98,
          special_instructions: 'Extra crispy',
          menu_item_image: '/images/grilled-chicken.jpg'
        }
      ],
      subtotal: 31.98,
      tax_amount: 2.56,
      service_charge: 2.00,
      total_amount: 36.54,
      payment_status: 'pending',
      payment_method: 'cash',
      notes: 'Customer prefers booth seating',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      estimated_ready_time: new Date(Date.now() + 30 * 60000).toISOString(),
      branch_id: '1',
      branch_name: 'Main Branch'
    };

    return {
      success: true,
      message: 'Order retrieved successfully (mock data)',
      data: mockOrder
    };
  }

  private getMockOrderStats(): OrderStatsResponse {
    const mockStats: OrderStats = {
      total_orders: 25,
      pending_orders: 3,
      preparing_orders: 5,
      ready_orders: 2,
      completed_orders: 14,
      cancelled_orders: 1,
      total_revenue: 1250.75,
      average_order_value: 50.03
    };

    return {
      success: true,
      message: 'Order statistics retrieved successfully (mock data)',
      data: mockStats
    };
  }

  // Update order status
  async updateOrderStatus(branchId: string, orderId: string, status: string): Promise<ApiResponse> {
    try {
      const response = await api.post(`/business/orders/branches/${branchId}/orders/${orderId}/status`, {
        status: status
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Error updating order status:', error);
      const apiError = error as ApiError;
      
      // Return mock success for development
      return {
        success: true,
        message: `Order status updated to ${status} (mock response)`,
        data: {
          id: orderId,
          status: status,
          updated_at: new Date().toISOString()
        }
      };
    }
  }

  // Error handler with enhanced error information
  private handleError(error: ApiError): Error {
    if (error.response?.status === 401) {
      return new Error('Authentication required. Please log in again.');
    }
    
    if (error.response?.status === 403) {
      return new Error('You do not have permission to perform this action.');
    }
    
    if (error.response?.status === 404) {
      return new Error('Order not found.');
    }
    
    if (error.response?.status === 422) {
      if (error.response.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        return new Error(errorMessages.join(', '));
      }
    }
    
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    if (error.response?.status === 500) {
      return new Error('Server error. Please try again later.');
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export const orderService = new OrderService();
export default orderService;
