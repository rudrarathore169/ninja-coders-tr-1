import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    currentOrder: null,
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    addOrder: (state, action) => {
      state.orders.push(action.payload)
    },
    updateOrderStatus: (state, action) => {
      const order = state.orders.find(o => o.id === action.payload.id)
      if (order) {
        order.status = action.payload.status
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
})

export const { setCurrentOrder, addOrder, updateOrderStatus, clearCurrentOrder } = orderSlice.actions
export default orderSlice.reducer