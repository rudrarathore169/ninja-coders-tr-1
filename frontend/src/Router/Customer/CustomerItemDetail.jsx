import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import menuService from '../../services/menuService'
import { addToCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/toastSlice'

const CustomerItemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!id) return
    fetchItem()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchItem = async () => {
    setLoading(true)
    try {
      const data = await menuService.getMenuItem(id)
      const resolved = data?.menuItem || data?.data || data || null
      setItem(resolved)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch item:', err)
      setError(err.message || 'Failed to load item')
    } finally {
      setLoading(false)
    }
  }

  const changeQuantity = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleAddToCart = () => {
    if (!item) return
    if (!item.availability) {
      dispatch(addToast({
        message: 'This item is currently unavailable',
        type: 'warning'
      }))
      return
    }

    const itemId = item.id || item._id
    dispatch(addToCart({ id: itemId, name: item.name, price: item.price, quantity }))
    dispatch(addToast({
      message: `${item.name} added to cart`,
      type: 'success'
    }))
    navigate('/customer/cart')
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading item...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchItem} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">Retry</button>
      </div>
    </div>
  )

  if (!item) return (
    <div className="p-6">
      <p className="text-gray-600">Item not found</p>
    </div>
  )

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="lg:flex">
          <div className="lg:w-1/2 h-72 bg-amber-100 flex items-center justify-center">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <svg className="w-20 h-20 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2M7 10h10M7 14h4" />
              </svg>
            )}
          </div>

          <div className="lg:w-1/2 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h2>
            <p className="text-sm text-gray-500 mb-4">Category: {item.category?.name || item.category}</p>
            <p className="text-gray-700 mb-4">{item.description}</p>
            <p className="text-3xl font-bold text-amber-800 mb-6">₹{item.price}</p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => changeQuantity(-1)} className="px-3 py-2 bg-gray-100">-</button>
                <div className="px-4 py-2">{quantity}</div>
                <button onClick={() => changeQuantity(1)} className="px-3 py-2 bg-gray-100">+</button>
              </div>

              <div className={`px-3 py-2 rounded-full text-sm font-semibold ${item.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {item.availability ? 'Available' : 'Unavailable'}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={!item.availability} className={`px-6 py-3 rounded-lg font-semibold ${item.availability ? 'bg-amber-800 text-white hover:bg-amber-900' : 'bg-gray-200 text-gray-500'}`}>
                Add to Cart
              </button>

              <button onClick={() => navigate('/customer/menu')} className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200">
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerItemDetail