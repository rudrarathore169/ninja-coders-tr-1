import { createSlice } from "@reduxjs/toolkit";

const loadAuthFromStorage = () => {
  try {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (user && token) {
      return {
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    }
  } catch (err) {
    console.error("Error loading auth from storage:", err);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
    name: 'auth',
    initialState: loadAuthFromStorage(),
    reducers: {
        loginStart: (state) => {
            state.loading = true
            state.error = null
        },
        loginSuccess: (state, action) => {
            state.loading = false
            state.isAuthenticated = true
            state.user = action.payload.user  // Already correct!
                // Accept either a direct token or tokens.accessToken (from backend)
                state.token = action.payload.token || action.payload.tokens?.accessToken
            state.error = null

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(action.payload.user))
            localStorage.setItem('token', state.token)
        },
        loginFailure: (state, action) => {
            state.loading = false
            state.isAuthenticated = false
            state.user = null
            state.token = null
            state.error = action.payload
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.error = null

      // ✅ Persist securely
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
