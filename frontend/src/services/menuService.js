const API_URL = `${import.meta.env.VITE_API_URL}/api/menu`

class MenuService {
  // Get all categories
  async getCategories() {
    const response = await fetch(`${API_URL}/categories`)
    const data = await response.json()
    return data.data // Returns array of categories
  }

  // Get menu items with filters
  async getMenuItems({ search = '', category = '', page = 1, limit = 20, sort = 'name' }) {
    const params = new URLSearchParams({
      ...(search && { search }),
      ...(category && { category }),
      page,
      limit,
      sort
    })
    
    const response = await fetch(`${API_URL}/items?${params}`)
    const data = await response.json()
    
    return {
      items: data.data,
      pagination: data.pagination // { page, limit, total, pages }
    }
  }

  // Get single item
  async getMenuItem(id) {
    const response = await fetch(`${API_URL}/items/${id}`)
    const data = await response.json()
    return data.data
  }

  // Admin: Create item
  async createMenuItem(itemData, token) {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    })
    
    const data = await response.json()
    return data.data
  }

  // Admin: Upload item image
  async uploadItemImage(itemId, imageFile, token) {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    const response = await fetch(`${API_URL}/items/${itemId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    const data = await response.json()
    return data.data.imageUrl
  }
}

export default new MenuService()