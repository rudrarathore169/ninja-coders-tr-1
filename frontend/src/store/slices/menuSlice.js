import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import menuService from '../../services/menuService'

// Async thunks for menu operations
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await menuService.getMenuItems(params)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'menu/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await menuService.getCategories()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createMenuItem = createAsyncThunk(
  'menu/createMenuItem',
  async ({ itemData, token }, { rejectWithValue }) => {
    try {
      const data = await menuService.createMenuItem(itemData, token)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateMenuItem = createAsyncThunk(
  'menu/updateMenuItem',
  async ({ id, itemData, token }, { rejectWithValue }) => {
    try {
      const data = await menuService.updateMenuItem(id, itemData, token)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      await menuService.deleteMenuItem(id, token)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const toggleMenuItemAvailability = createAsyncThunk(
  'menu/toggleMenuItemAvailability',
  async ({ id, availability, token }, { rejectWithValue }) => {
    try {
      const data = await menuService.toggleAvailability(id, availability, token)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    categories: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSearchFilter: (state, action) => {
      state.searchFilter = action.payload
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch menu items
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.lastUpdated = Date.now()
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload || []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create menu item
      .addCase(createMenuItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload.menuItem)
        state.lastUpdated = Date.now()
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update menu item
      .addCase(updateMenuItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.menuItem.id || item._id === action.payload.menuItem._id)
        if (index !== -1) {
          state.items[index] = action.payload.menuItem
        }
        state.lastUpdated = Date.now()
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete menu item
      .addCase(deleteMenuItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => (item.id || item._id) !== action.payload)
        state.lastUpdated = Date.now()
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Toggle availability
      .addCase(toggleMenuItemAvailability.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleMenuItemAvailability.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.menuItem.id || item._id === action.payload.menuItem._id)
        if (index !== -1) {
          state.items[index] = action.payload.menuItem
        }
        state.lastUpdated = Date.now()
      })
      .addCase(toggleMenuItemAvailability.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setSearchFilter, setCategoryFilter } = menuSlice.actions
export default menuSlice.reducer
