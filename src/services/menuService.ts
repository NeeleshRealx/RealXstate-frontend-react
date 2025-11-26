import api from "../lib/api";

// Menu Category Interfaces
export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  item_count: number;
  branch_id: string;
  created_at: string;
  updated_at: string;
}

export interface MenuCategoriesResponse {
  categories: MenuCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

// Menu Item Interfaces
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  category_id: string;
  branch_id: string;
  is_active: boolean;
  has_variants: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItemsResponse {
  categories: {
    id: string;
    name: string;
    item_count: number;
    items: MenuItem[];
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  base_price: number;
  category_id: string;
  is_active?: boolean;
  has_variants?: boolean;
  image_url?: string;
  variants?: Array<{
    name: string;
    price: number;
    is_active?: boolean;
  }>;
  modifiers?: Array<{
    name: string;
    is_required?: boolean;
    max_select: number;
    is_active?: boolean;
    options?: Array<{
      name: string;
      extra_price?: number;
      is_active?: boolean;
    }>;
  }>;
  tags?: string[];
  availability?: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_active?: boolean;
  }>;
}

export type UpdateMenuItemData = Partial<CreateMenuItemData>;

// Tag Interfaces
export interface MenuItemTag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTagData {
  name: string;
  color: string;
  icon?: string;
}

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
  };
  message?: string;
}

class MenuService {
  // Category Management

  // Get all categories for a branch
  async getCategories(branchId: string): Promise<ApiResponse<MenuCategoriesResponse>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/categories`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Create new category
  async createCategory(
    branchId: string,
    data: CreateCategoryData
  ): Promise<ApiResponse<MenuCategory>> {
    try {
      const response = await api.post(
        `/business/menu/branches/${branchId}/categories`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get specific category
  async getCategory(
    branchId: string,
    categoryId: string
  ): Promise<ApiResponse<MenuCategory>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/categories/${categoryId}`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update category
  async updateCategory(
    branchId: string,
    categoryId: string,
    data: UpdateCategoryData
  ): Promise<ApiResponse<MenuCategory>> {
    try {
      const response = await api.put(
        `/business/menu/branches/${branchId}/categories/${categoryId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Delete category
  async deleteCategory(
    branchId: string,
    categoryId: string
  ): Promise<ApiResponse> {
    try {
      const response = await api.delete(
        `/business/menu/branches/${branchId}/categories/${categoryId}`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Reorder categories
  async reorderCategories(
    branchId: string,
    categories: Array<{ id: number; sort_order: number }>
  ): Promise<ApiResponse> {
    try {
      const response = await api.put(
        `/business/menu/branches/${branchId}/categories/reorder`,
        {
          categories: categories,
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get item count for category
  async getCategoryItemCount(
    branchId: string,
    categoryId: string
  ): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/categories/${categoryId}/item-count`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Menu Item Management

  // Get all items for a branch
  async getItems(branchId: string): Promise<ApiResponse<MenuItemsResponse>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/items`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Create new item
  async createItem(
    branchId: string,
    data: CreateMenuItemData
  ): Promise<ApiResponse<MenuItem>> {
    try {
      const response = await api.post(
        `/business/menu/branches/${branchId}/items`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get specific item
  async getItem(
    branchId: string,
    itemId: string
  ): Promise<ApiResponse<MenuItem>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/items/${itemId}`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update item
  async updateItem(
    branchId: string,
    itemId: string,
    data: UpdateMenuItemData
  ): Promise<ApiResponse<MenuItem>> {
    try {
      const response = await api.put(
        `/business/menu/branches/${branchId}/items/${itemId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Delete item
  async deleteItem(branchId: string, itemId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(
        `/business/menu/branches/${branchId}/items/${itemId}`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Search items
  async searchItems(
    branchId: string,
    query: string
  ): Promise<ApiResponse<MenuItem[]>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/items/search`,
        {
          params: { q: query },
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get item stats
  async getItemStats(branchId: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/items/stats`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Reorder items
  async reorderItems(
    branchId: string,
    itemIds: string[]
  ): Promise<ApiResponse> {
    try {
      const response = await api.put(
        `/business/menu/branches/${branchId}/items/reorder`,
        {
          item_ids: itemIds,
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update item status
  async updateItemStatus(
    branchId: string,
    itemId: string,
    isActive: boolean
  ): Promise<ApiResponse<MenuItem>> {
    try {
      const response = await api.put(
        `/business/menu/branches/${branchId}/items/${itemId}/status`,
        {
          is_active: isActive,
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Upload item image
  async uploadItemImage(
    branchId: string,
    itemId: string,
    file: File
  ): Promise<ApiResponse<{ image_url: string }>> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post(
        `/business/menu/branches/${branchId}/items/${itemId}/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get item for editing
  async getItemForEdit(
    branchId: string,
    itemId: string
  ): Promise<ApiResponse<MenuItem>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/items/${itemId}/edit`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get category count
  async getCategoryCount(
    branchId: string,
    categoryId: string
  ): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/items/categories/${categoryId}/count`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Tag Management

  // Get all tags
  async getTags(branchId: string): Promise<ApiResponse<MenuItemTag[]>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/tags`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Create new tag
  async createTag(
    branchId: string,
    data: CreateTagData
  ): Promise<ApiResponse<MenuItemTag>> {
    try {
      const response = await api.post(
        `/business/menu/branches/${branchId}/tags`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Update tag
  async updateTag(
    branchId: string,
    tagId: string,
    data: Partial<CreateTagData>
  ): Promise<ApiResponse<MenuItemTag>> {
    try {
      const response = await api.put(
        `/business/menu/branches/${branchId}/tags/${tagId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Delete tag
  async deleteTag(branchId: string, tagId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(
        `/business/menu/branches/${branchId}/tags/${tagId}`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Get tag stats
  async getTagStats(branchId: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get(
        `/business/menu/branches/${branchId}/tags/stats`
      );
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error as ApiError);
    }
  }

  // Error handler
  private handleError(error: ApiError): Error {
    // Check for validation errors first (422 responses)
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat();
      return new Error(errorMessages.join(", "));
    }
    
    // Check for general message
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    
    return new Error(error.message || "An unexpected error occurred");
  }
}

export const menuService = new MenuService();
export default menuService;
