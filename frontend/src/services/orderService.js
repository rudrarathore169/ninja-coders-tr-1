// Use VITE_API_URL when provided, otherwise fall back to localhost backend
const DEFAULT_API = 'http://localhost:5000'
const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API
const API_URL = `${API_BASE}/api/orders`

if (!import.meta.env.VITE_API_URL) {
  console.warn('[orderService] VITE_API_URL is not defined. Falling back to', DEFAULT_API);
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
      const error = await response.json().catch(() => ({}))
      if (error && Array.isArray(error.errors) && error.errors.length) {
        throw new Error(error.errors[0].message || error.message || 'Order creation failed')
      }
      throw new Error(error.message || 'Order creation failed')
    }

    const data = await response.json()
    return data.data // Returns order object
  }

  // Get order by ID
  async getOrder(orderId, token) {
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`${API_URL}/${orderId}`, {
      headers,
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to fetch order')
    }

    const data = await response.json()
    return data.data
  }

  // Get all orders (staff/admin)
  async getOrders({ status = '', table = '', page = 1, limit = 20 }, token) {
    const params = new URLSearchParams({
      ...(status && { status }),
      ...(table && { tableId: table }),
      page,
      limit
    })
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const url = `${API_URL}?${params}`
    try {
      const response = await fetch(url, {
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `Failed to fetch orders (${response.status})`)
      }

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
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to update order status')
    }

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
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Failed to update order payment')
    }

    const data = await response.json()
    return data.data
  }
}

export default new OrderService()