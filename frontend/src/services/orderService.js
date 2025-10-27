const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`

// Helpful dev-time warning when VITE_API_URL is not set
if (!import.meta.env.VITE_API_URL) {
  console.warn('[orderService] VITE_API_URL is not defined. Requests may fail.');
} else {
  console.debug('[orderService] API base URL:', import.meta.env.VITE_API_URL);
}

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
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const url = `${API_URL}?${params}`
    try {
      const response = await fetch(url, {
        headers,
        credentials: 'include'
      })

      const data = await response.json()
      return data.data || []
    } catch (err) {
      // Re-throw a clearer error including the URL and original error
      console.error('[orderService] Failed fetching orders from', url, err)
      throw new Error(`Network error while fetching orders from ${url}: ${err.message}`)
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

  // Update order payment status (staff/admin)
  async updateOrderPayment(orderId, status, token) {
    const response = await fetch(`${API_URL}/${orderId}/payment`, {
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