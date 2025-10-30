import { createSlice } from '@reduxjs/toolkit'

let toastId = 0

const toastSlice = createSlice({
  name: 'toast',
  initialState: {
    toasts: []
  },
  reducers: {
    addToast: (state, action) => {
      const id = ++toastId
      state.toasts.push({
        id,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 5000
      })
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload)
    },
    clearToasts: (state) => {
      state.toasts = []
    }
  }
})

export const { addToast, removeToast, clearToasts } = toastSlice.actions
export default toastSlice.reducer
