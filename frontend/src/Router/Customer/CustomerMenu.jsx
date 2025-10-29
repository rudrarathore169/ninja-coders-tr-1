import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../store/slices/cartSlice'
import {
  fetchMenuItems,
  fetchCategories,
  setSearchFilter,
  setCategoryFilter
} from '../../store/slices/menuSlice'

import { useSearchParams } from 'react-router-dom'
import tableService from '../../services/tableService'

const CustomerMenu = () => {
  const dispatch = useDispatch()
  const { items: menuItems, categories, loading, error, lastUpdated } = useSelector((state) => state.menu)
  const [searchParams] = useSearchParams() // ← ADD THIS
  const tableSlug = searchParams.get('table') // ← ADD THIS
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [table, setTable] = useState(null)
  const [tableLoading, setTableLoading] = useState(false)
  const [tableError, setTableError] = useState(null)

  // ← ADD THIS EFFECT (Place BEFORE existing useEffect)
  useEffect(() => {
    const fetchTable = async () => {
      if (!tableSlug) {
        // No table specified - allow browsing without table
        console.log('No table specified, showing menu anyway')
        return
      }

      try {
        setTableLoading(true)
        const tableData = await tableService.getTableBySlug(tableSlug)

        if (tableData.occupied) {
          setTableError('This table is currently occupied. Please ask staff for assistance.')
          return
        }

        setTable(tableData)
        setTableError(null)
      } catch (err) {
        console.error('Error fetching table:', err)
        setTableError(err.message || 'Failed to load table information')
      } finally {
        setTableLoading(false)
      }
    }

    fetchTable()
  }, [tableSlug])

  useEffect(() => {
    dispatch(fetchCategories())
    dispatch(fetchMenuItems({ limit: 100 }))
  }, [dispatch])

  const handleSearch = (e) => {
    const val = e.target.value
    setSearch(val)
  }

  const applyFilters = () => {
    const opts = { limit: 100 }
    if (search) opts.search = search
    if (selectedCategory) opts.categoryId = selectedCategory
    dispatch(fetchMenuItems(opts))
  }

  useEffect(() => {
    // apply filters when selectedCategory changes
    applyFilters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  const handleAddToCart = (item) => {
    if (!item.availability && item.availability !== undefined) {
      alert('Item is currently unavailable')
      return
    }

    const id = item.id || item._id
    dispatch(addToCart({ id, name: item.name, price: item.price, quantity: 1 }))
    // optionally show a toast - for now a small confirmation
    // eslint-disable-next-line no-undef
    try { window.alert(`${item.name} added to cart`) } catch (_) { }
  }

  if (loading || tableLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (tableError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Table Unavailable</h2>
          <p className="text-gray-600 mb-6">{tableError}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading menu</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => dispatch(fetchMenuItems({ limit: 100 }))}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  // Apply category filter on the frontend
  const filteredItems = menuItems.filter((item) => {
    // match category
    const matchesCategory =
      selectedCategory === '' ||
      item.category?.id === selectedCategory ||
      item.category?._id === selectedCategory

    // match search (optional)
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))

    return matchesCategory && matchesSearch
  })


  return (
    <div className="p-6">
      {table && (
      <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-orange-900">
              🍽️ Table {table.number}
            </h2>
            <p className="text-sm text-orange-700">
              Your orders will be associated with this table
            </p>
          </div>
          <div className="bg-green-100 px-4 py-2 rounded-full">
            <span className="text-green-800 font-semibold text-sm">✓ Available</span>
          </div>
        </div>
      </div>
    )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Menu</h1>
          <p className="text-gray-600 mt-1">Browse and add items to your cart</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search items or tags..."
            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none"
          />
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900"
          >
            Search
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full ${selectedCategory === '' ? 'bg-amber-800 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id || cat._id}
            onClick={() => setSelectedCategory(cat.id || cat._id)}
            className={`px-4 py-2 rounded-full ${selectedCategory === (cat.id || cat._id) ? 'bg-amber-800 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
          <p className="text-gray-600">Try a different category or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id || item._id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                {/* If backend provides imageUrl use it here, otherwise placeholder */}
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                ) : (
                  <svg className="w-16 h-16 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>

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

                <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                <p className="text-2xl font-bold text-amber-800 mb-4">₹{item.price}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.availability}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${item.availability
                      ? 'bg-amber-800 text-white hover:bg-amber-900'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    Add to Cart
                  </button>

                  <a
                    href={`/customer/item/${item.id || item._id}`}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


export default CustomerMenu