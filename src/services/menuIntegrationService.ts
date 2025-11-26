import { OrderItem, OrderItemModifier } from '@/types/order';
import { menuService, MenuItem as ApiMenuItem, MenuCategory as ApiMenuCategory } from './menuService';

// Extended interfaces for manual order entry
export interface MenuItem extends ApiMenuItem {
  description?: string;
  category?: string;
  image?: string;
  isPopular?: boolean;
  variants?: ItemVariant[];
  modifiers?: ItemModifier[];
}

export interface ItemVariant {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ItemModifier {
  id: string;
  menu_item_id: string;
  name: string;
  is_required: boolean;
  max_select: number;
  is_active: boolean;
  sort_order: number;
  options: ItemModifierOption[];
  created_at: string;
  updated_at: string;
}

export interface ItemModifierOption {
  id: string;
  modifier_id: string;
  name: string;
  extra_price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory extends ApiMenuCategory {
  items: MenuItem[];
}

class MenuIntegrationService {
  private cachedMenuData: { categories: MenuCategory[], items: MenuItem[] } | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get menu categories and items from the backend
  async getMenuData(branchId: string): Promise<{ categories: MenuCategory[], items: MenuItem[] }> {
    // Check if we have valid cached data
    if (this.cachedMenuData && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedMenuData;
    }

    try {
      // Fetch categories and items from the backend
      const [categoriesResponse, itemsResponse] = await Promise.all([
        menuService.getCategories(branchId),
        menuService.getItems(branchId)
      ]);

      if (!categoriesResponse.success || !itemsResponse.success) {
        throw new Error('Failed to fetch menu data from backend');
      }

      // Transform API data to our interface
      const categories: MenuCategory[] = categoriesResponse.data?.categories.map(cat => ({
        ...cat,
        items: []
      })) || [];

      const items: MenuItem[] = itemsResponse.data?.categories.flatMap(cat => 
        cat.items.map(item => ({
          ...item,
          category: cat.name,
          description: item.description || '',
          image: item.image_url || '/images/placeholder-food.jpg',
          isPopular: false, // This could be determined by order frequency in the future
          variants: [], // TODO: Fetch variants from API
          modifiers: [] // TODO: Fetch modifiers from API
        }))
      ) || [];

      // Group items by category
      categories.forEach(category => {
        category.items = items.filter(item => item.category_id === category.id);
      });

      // Cache the data
      this.cachedMenuData = { categories, items };
      this.cacheTimestamp = Date.now();

      return { categories, items };
    } catch (error) {
      console.error('Error fetching menu data:', error);
      // Fallback to mock data if API fails
      return this.getMockMenuData();
    }
  }

  // Fallback mock data for development/error cases
  private getMockMenuData(): { categories: MenuCategory[], items: MenuItem[] } {
    const mockItems: MenuItem[] = [
      {
        id: '1',
        name: 'Margherita Pizza',
        description: 'Classic tomato and mozzarella pizza',
        base_price: 12.99,
        category_id: '2',
        branch_id: '1',
        is_active: true,
        has_variants: false,
        category: 'Pizzas',
        image: '/images/margherita-pizza.jpg',
        isPopular: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with mozzarella',
        base_price: 14.99,
        category_id: '2',
        branch_id: '1',
        is_active: true,
        has_variants: false,
        category: 'Pizzas',
        image: '/images/pepperoni-pizza.jpg',
        isPopular: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing',
        base_price: 8.99,
        category_id: '1',
        branch_id: '1',
        is_active: true,
        has_variants: false,
        category: 'Starters',
        image: '/images/caesar-salad.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Garlic Bread',
        description: 'Crispy bread with garlic butter',
        base_price: 5.50,
        category_id: '1',
        branch_id: '1',
        is_active: true,
        has_variants: false,
        category: 'Starters',
        image: '/images/garlic-bread.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '8',
        name: 'Chicken Wings',
        description: 'Spicy buffalo wings with ranch dip',
        base_price: 11.99,
        category_id: '1',
        branch_id: '1',
        is_active: true,
        has_variants: false,
        category: 'Starters',
        image: '/images/chicken-wings.jpg',
        isPopular: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const mockCategories: MenuCategory[] = [
      {
        id: '1',
        name: 'Starters',
        sort_order: 10,
        is_active: true,
        branch_id: '1',
        item_count: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: mockItems.filter(item => item.category === 'Starters')
      },
      {
        id: '2',
        name: 'Pizzas',
        sort_order: 20,
        is_active: true,
        branch_id: '1',
        item_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: mockItems.filter(item => item.category === 'Pizzas')
      }
    ];

    return { categories: mockCategories, items: mockItems };
  }

  // Get all menu items (async version)
  async getMenuItems(branchId: string): Promise<MenuItem[]> {
    const { items } = await this.getMenuData(branchId);
    return items;
  }

  // Get menu items by category (async version)
  async getMenuItemsByCategory(branchId: string, category: string): Promise<MenuItem[]> {
    const { items } = await this.getMenuData(branchId);
    return items.filter(item => 
      item.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // Get popular items (async version)
  async getPopularItems(branchId: string): Promise<MenuItem[]> {
    const { items } = await this.getMenuData(branchId);
    return items.filter(item => item.isPopular);
  }

  // Get menu categories (async version)
  async getMenuCategories(branchId: string): Promise<MenuCategory[]> {
    const { categories } = await this.getMenuData(branchId);
    return categories;
  }

  // Search menu items (async version)
  async searchMenuItems(branchId: string, query: string): Promise<MenuItem[]> {
    const { items } = await this.getMenuData(branchId);
    const searchTerm = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm)
    );
  }

  // Convert menu item to order item
  menuItemToOrderItem(
    menuItem: MenuItem, 
    quantity: number = 1, 
    specialInstructions?: string,
    variantId?: string,
    modifiers?: OrderItemModifier[]
  ): OrderItem {
    const selectedVariant = variantId ? menuItem.variants?.find(v => v.id === variantId) : null;
    const basePrice = selectedVariant ? selectedVariant.price : menuItem.base_price;
    const modifierTotal = modifiers?.reduce((sum, mod) => sum + mod.extra_price, 0) || 0;
    const itemTotal = (basePrice + modifierTotal) * quantity;

    return {
      id: `${menuItem.id}-${Date.now()}`,
      menu_item_id: menuItem.id,
      menu_item_name: menuItem.name,
      quantity,
      price: basePrice,
      total_price: itemTotal,
      special_instructions: specialInstructions || '',
      menu_item_image: menuItem.image,
      variant_id: variantId,
      variant_name: selectedVariant?.name,
      modifiers: modifiers || []
    };
  }

  // Process natural language order (async version)
  async processNaturalLanguageOrder(branchId: string, message: string): Promise<{ items: OrderItem[]; response: string }> {
    const { items } = await this.getMenuData(branchId);
    const lowerMessage = message.toLowerCase();
    const detectedItems: OrderItem[] = [];
    let response = '';

    // Pizza detection
    if (lowerMessage.includes('pizza') || lowerMessage.includes('margherita')) {
      const pizzaItem = items.find(item => 
        item.name.toLowerCase().includes('margherita')
      );
      if (pizzaItem) {
        const quantity = this.extractQuantity(message) || 1;
        detectedItems.push(this.menuItemToOrderItem(pizzaItem, quantity));
        response = `Great! I've added ${quantity} Margherita pizza${quantity > 1 ? 's' : ''} to your order. Would you like any drinks with that?`;
      }
    }

    // Caesar salad detection
    if (lowerMessage.includes('caesar') || lowerMessage.includes('salad')) {
      const saladItem = items.find(item => 
        item.name.toLowerCase().includes('caesar')
      );
      if (saladItem) {
        const quantity = this.extractQuantity(message) || 1;
        detectedItems.push(this.menuItemToOrderItem(saladItem, quantity));
        response = `Great choice! I've added ${quantity} Caesar salad${quantity > 1 ? 's' : ''} to your order.`;
      }
    }

    // Garlic bread detection
    if (lowerMessage.includes('garlic bread')) {
      const breadItem = items.find(item => 
        item.name.toLowerCase().includes('garlic bread')
      );
      if (breadItem) {
        const quantity = this.extractQuantity(message) || 1;
        const withCheese = lowerMessage.includes('cheese');
        detectedItems.push(this.menuItemToOrderItem(breadItem, quantity, withCheese ? 'With cheese' : ''));
        response = `Excellent choice! I've added garlic bread${withCheese ? ' with cheese' : ''} to your order.`;
      }
    }

    // Chicken wings detection
    if (lowerMessage.includes('chicken wings') || lowerMessage.includes('wings')) {
      const wingsItem = items.find(item => 
        item.name.toLowerCase().includes('chicken wings')
      );
      if (wingsItem) {
        const quantity = this.extractQuantity(message) || 1;
        detectedItems.push(this.menuItemToOrderItem(wingsItem, quantity));
        response = `Perfect! I've added ${quantity} chicken wing${quantity > 1 ? 's' : ''} to your order.`;
      }
    }

    // Default response if no items detected
    if (detectedItems.length === 0) {
      response = "I understand you'd like to order. Could you please specify what items you'd like? I can help you with our menu items!";
    }

    return { items: detectedItems, response };
  }

  // Extract quantity from natural language
  private extractQuantity(message: string): number | null {
    const quantityRegex = /(\d+)\s*(?:x|×|\*)?/i;
    const match = message.match(quantityRegex);
    return match ? parseInt(match[1], 10) : null;
  }

  // Get suggested items based on current order (async version)
  async getSuggestedItems(branchId: string, currentOrder: OrderItem[]): Promise<MenuItem[]> {
    const { items } = await this.getMenuData(branchId);
    const currentCategories = currentOrder.map(item => 
      items.find(menuItem => menuItem.id === item.menu_item_id)?.category
    ).filter(Boolean);

    // Suggest popular items from different categories
    const suggestions = items.filter(item => 
      item.isPopular && !currentCategories.includes(item.category)
    );

    return suggestions.slice(0, 3);
  }

  // Clear cache (useful for testing or when menu data changes)
  clearCache(): void {
    this.cachedMenuData = null;
    this.cacheTimestamp = 0;
  }
}

export const menuIntegrationService = new MenuIntegrationService();
export default menuIntegrationService;