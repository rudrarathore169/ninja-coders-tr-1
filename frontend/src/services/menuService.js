// ============================================
// src/services/menuService.js
// ============================================

const API_URL = `${import.meta.env.VITE_API_URL}/api/menu`;

class MenuService {
  // ============================
  // Get all menu items
  // ============================
  async getMenuItems({ search = '', category = '', page = 1, limit = 100, sort = 'name' } = {}, token = null) {
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(category && { category }),
        page,
        limit,
        sort
      });

      const url = `${API_URL}/items?${params}`;
      console.log('➡️ Fetching menu items from:', url);


      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(url, { headers, credentials: 'include' });

      console.log('⬅️ Response status:', response.status, response.statusText);

      if (!response.ok) {
        // Try to parse error message from backend if available
        let errorMsg = 'Failed to fetch menu items';
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMsg = errorData.message;
        } catch (_) {
          // no JSON body
        }
        throw new Error(errorMsg + ` (HTTP ${response.status})`);
      }

      const data = await response.json();

      return {
        items: data.data?.menuItems || [],
        pagination: data.data?.pagination || {}
      };
    } catch (error) {
      console.error('❌ Get menu items error:', error);
      throw error;
    }
  }

  // ============================
  // Get single menu item by ID
  // ============================
  async getMenuItem(id) {
    try {
      const url = `${API_URL}/items/${id}`;
      console.log('➡️ Fetching menu item:', url);

      const response = await fetch(url, { credentials: 'include' });
      console.log('⬅️ Response status:', response.status);

      if (!response.ok) throw new Error(`Failed to fetch menu item (HTTP ${response.status})`);

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Get menu item error:', error);
      throw error;
    }
  }

  // ============================
  // Get all categories
  // ============================
  async getCategories() {
    try {
      const url = `${API_URL}/categories`;
      console.log('➡️ Fetching categories from:', url);

      const response = await fetch(url, { credentials: 'include' });
      console.log('⬅️ Response status:', response.status);

      if (!response.ok) throw new Error(`Failed to fetch categories (HTTP ${response.status})`);

      const data = await response.json();
      return data.data?.categories || [];
    } catch (error) {
      console.error('❌ Get categories error:', error);
      throw error;
    }
  }

  // ============================
  // Create new menu item (Admin)
  // ============================
  async createMenuItem(itemData, token) {
    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to create menu item (HTTP ${response.status})`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Create menu item error:', error);
      throw error;
    }
  }

  // ============================
  // Update menu item (Admin)
  // ============================
  async updateMenuItem(id, itemData, token) {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to update menu item (HTTP ${response.status})`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Update menu item error:', error);
      throw error;
    }
  }

  // ============================
  // Delete menu item (Admin)
  // ============================
  async deleteMenuItem(id, token) {
    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to delete menu item (HTTP ${response.status})`);
      }

      return true;
    } catch (error) {
      console.error('❌ Delete menu item error:', error);
      throw error;
    }
  }

  // ============================
  // Toggle item availability
  // ============================
  async toggleAvailability(id, availability, token) {
    try {
      const response = await fetch(`${API_URL}/items/${id}/availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ availability })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to toggle availability (HTTP ${response.status})`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ Toggle availability error:', error);
      throw error;
    }
  }

  // ============================
  // Upload item image (Admin)
  // ============================
  async uploadItemImage(itemId, imageFile, token) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_URL}/items/${itemId}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to upload image (HTTP ${response.status})`);
      }

      const data = await response.json();
      return data.data.imageUrl;
    } catch (error) {
      console.error('❌ Upload image error:', error);
      throw error;
    }
  }
}

export default new MenuService();
