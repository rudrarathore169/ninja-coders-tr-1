// src/services/authService.js
const API_URL = import.meta.env.VITE_API_URL + '/api/auth'

class AuthService {
  // Login
  async login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }
    
    const data = await response.json()
    // Backend returns: { success: true, data: { user, token } }
    return {
      user: data.data.user,
      token: data.data.token
    }
  }

  // Signup
  async signup(name, email, password, role = 'customer') {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password, role }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Signup failed')
    }
    
    const data = await response.json()
    return {
      user: data.data.user,
      token: data.data.token
    }
  }

  // Get current user
  async getCurrentUser(token) {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Failed to get user')
    }
    
    const data = await response.json()
    return data.data.user
  }

  // Logout
  async logout(token) {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
  }
}

export default new AuthService()