// src/services/authService.js
// Use VITE_API_URL when provided, otherwise fall back to localhost backend
const DEFAULT_API = 'http://localhost:5000'
const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API
const API_URL = `${API_BASE}/api/auth`

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
      // If validation errors are present, prefer the first field message
      if (error && Array.isArray(error.errors) && error.errors.length > 0) {
        throw new Error(error.errors[0].message || error.message || 'Login failed')
      }
      throw new Error(error.message || 'Login failed')
    }
    
    const data = await response.json()
    // Backend returns: { success: true, data: { user, tokens } }
    // Return both the tokens object and a top-level access token for compatibility
    return {
      user: data.data.user,
      tokens: data.data.tokens,
      token: data.data.tokens?.accessToken || null
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
      if (error && Array.isArray(error.errors) && error.errors.length > 0) {
        throw new Error(error.errors[0].message || error.message || 'Signup failed')
      }
      throw new Error(error.message || 'Signup failed')
    }
    
    const data = await response.json()
    // Backend returns data.tokens
    return {
      user: data.data.user,
      tokens: data.data.tokens,
      token: data.data.tokens?.accessToken || null
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