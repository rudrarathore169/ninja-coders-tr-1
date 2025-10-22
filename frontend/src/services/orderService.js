const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`

class OrderService {
  // Create order (guest or authenticated)
  async createOrder(orderData, token = null) {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(orderData)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Order creation failed')
    }
    
    const data = await response.json()
    return data.data // Returns order object
  }

  // Get order by ID
  async getOrder(orderId, token) {
    const response = await fetch(`${API_URL}/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    const data = await response.json()
    return data.data
  }

  // Get all orders (staff/admin)
  async getOrders({ status = '', table = '', page = 1, limit = 20 }, token) {
    const params = new URLSearchParams({
      ...(status && { status }),
      ...(table && { table }),
      page,
      limit
    })
    
    const response = await fetch(`${API_URL}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    const data = await response.json()
    return {
      orders: data.data,
      pagination: data.pagination
    }
  }

  // Update order status (staff/admin)
  async updateOrderStatus(orderId, status, token) {
    const response = await fetch(`${API_URL}/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ status })
    })
    
    const data = await response.json()
    return data.data
  }
}

export default new OrderService()