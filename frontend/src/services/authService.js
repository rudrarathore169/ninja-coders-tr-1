// src/services/authService.js
const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

class AuthService {
  // ✅ Login
  async login(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    // Backend may return tokens in different shapes. Normalize to { user, token }
    // Common shapes handled:
    //  - { data: { user, tokens: { accessToken, refreshToken } } }
    //  - { data: { user, token } }
    //  - { user, token }
    //  - { user, tokens: { accessToken } }
    const user = data.data?.user || data.user;

    // Try to grab an access token from multiple possible locations
    const token =
      data.data?.tokens?.accessToken ||
      data.tokens?.accessToken ||
      data.data?.token ||
      data.token ||
      null;

    if (!token) {
      console.warn('⚠️ No access token returned from backend. Received response:', data);
    }

    return { user, token };
  }

  // ✅ Signup
  async signup(name, email, password, role = "customer") {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Signup failed");
    }

    const data = await response.json();
    const user = data.data?.user || data.user;
    const token = data.data?.tokens?.accessToken || data.tokens?.accessToken || data.data?.token || data.token || null;
    return { user, token };
  }

  // ✅ Get current user (for persistent login)
  async getCurrentUser(token) {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to get user");

    const data = await response.json();
    return data.data?.user || data.user;
  }

  // ✅ Logout
  async logout(token) {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
  }
}

export default new AuthService();
