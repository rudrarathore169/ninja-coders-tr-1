import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import menuService from '../../services/menuService'

const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    availability: true,
    tags: ''
  })

  const { token } = useSelector((state) => state.auth)

  // Fetch menu items and categories on component mount
  useEffect(() => {
    fetchMenuItems()
    fetchCategories()
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        description: editingItem.description || '',
        price: editingItem.price || '',
        categoryId: editingItem.category?._id || '',
        availability: editingItem.availability,
        tags: editingItem.tags ? editingItem.tags.join(', ') : ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        availability: true,
        tags: ''
      })
    }
  }, [editingItem])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const data = await menuService.getMenuItems({})

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.menuItems)
            ? data.menuItems
            : Array.isArray(data.data?.menuItems)
              ? data.data.menuItems
              : []

      setMenuItems(items)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch menu items:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await menuService.getCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }


  const handleToggleAvailability = async (item) => {
    try {
      await menuService.updateMenuItem(item.id || item._id, {
        ...item,
        availability: !item.availability
      }, token)

      // Update local state
      setMenuItems(menuItems.map(i =>
        (i.id || i._id) === (item.id || item._id) ? { ...i, availability: !i.availability } : i
      ))
    } catch (err) {
      alert('Failed to update availability: ' + err.message)
    }
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      await menuService.deleteMenuItem(itemId, token)
      setMenuItems(menuItems.filter(i => (i.id || i._id) !== itemId))
    } catch (err) {
      alert('Failed to delete item: ' + err.message)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    // Frontend validation
    if (!formData.name.trim()) {
      alert('Please enter a valid item name')
      return
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      alert('Please enter a description with at least 10 characters')
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price greater than 0')
      return
    }

    if (!formData.categoryId) {
      alert('Please select a category')
      return
    }

    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        categoryId: formData.categoryId,
        availability: formData.availability,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }

      if (editingItem) {
        await menuService.updateMenuItem(editingItem.id || editingItem._id, itemData, token)
        setMenuItems(menuItems.map(item =>
          (item.id || item._id) === (editingItem.id || editingItem._id) ? { ...item, ...itemData } : item
        ))
      } else {
        const newItem = await menuService.createMenuItem(itemData, token)
        setMenuItems([...menuItems, newItem])
        window.location.reload() // Reload the page after adding new item
      }

      setShowAddModal(false)
      setEditingItem(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        availability: true,
        tags: ''
      })
    } catch (err) {
      // Show detailed validation errors if available
      if (err.message.includes('Validation failed')) {
        alert('Validation failed. Please check all fields and try again.')
      } else {
        alert('Failed to save item: ' + err.message)
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error loading menu items</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchMenuItems}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant menu items</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-amber-800 text-white rounded-lg font-semibold hover:bg-amber-900 transition-all shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Items</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{menuItems.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Available</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {menuItems.filter(i => i.availability).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Unavailable</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {menuItems.filter(i => !i.availability).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Categories</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {new Set(menuItems.map(i => i.category?.name)).size}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {menuItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No menu items yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first menu item</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900"
          >
            Add Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Item Image */}
              <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <svg
                  className={`w-16 h-16 text-amber-300 ${item.imageUrl ? 'hidden' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>

              {/* Item Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.availability
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {item.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {item.category?.name}
                  </span>
                </p>

                <p className="text-2xl font-bold text-amber-800 mb-4">₹{item.price}</p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${item.availability
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    {item.availability ? 'Mark Unavailable' : 'Mark Available'}
                  </button>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id || item._id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingItem(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter item name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter item description"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id || category._id} value={category.id || category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="spicy, vegetarian, popular"
                />
              </div>

              {/* Availability */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Available for ordering
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingItem(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors font-semibold"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMenuManagement