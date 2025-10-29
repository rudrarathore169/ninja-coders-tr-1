const API_URL = `${import.meta.env.VITE_API_URL}/api/customers`

class CustomerService {
  // Create customer session when scanning QR code
  async createSession(qrSlug, customerData = {}) {
    const response = await fetch(`${API_URL}/session/${qrSlug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create customer session')
    }

    // Store token in localStorage
    if (data.data?.token) {
      localStorage.setItem('customerToken', data.data.token)
    }

    return data.data
  }

  // Get customer profile
  async getProfile() {
    const token = localStorage.getItem('customerToken')
    if (!token) {
      throw new Error('No customer token found')
    }

    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get customer profile')
    }

    return data.data
  }

  // Update customer profile
  async updateProfile(profileData) {
    const token = localStorage.getItem('customerToken')
    if (!token) {
      throw new Error('No customer token found')
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile')
    }

    return data.data
  }

  // Logout customer
  async logout() {
    const token = localStorage.getItem('customerToken')
    if (!token) {
      return // Already logged out
    }

    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('customerToken')
    }
  }

  // Check if customer is logged in
  isLoggedIn() {
    return !!localStorage.getItem('customerToken')
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('customerToken')
  }

  // Get customer info from token (without API call)
  getCustomerInfo() {
    const token = this.getToken()
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.id,
        name: payload.name,
        table: payload.table
      }
    } catch (error) {
      console.error('Failed to parse customer token:', error)
      return null
    }
  }
}

export default new CustomerService()
