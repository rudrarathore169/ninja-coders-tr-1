import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import orderService from '../../services/orderService'

const CustomerOrderStatus = () => {
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState(() => searchParams.get('id') || localStorage.getItem('lastOrderId'))
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) return
    fetchOrder()

    // Poll for updates every 8 seconds
    const t = setInterval(() => {
      fetchOrder()
    }, 8000)

    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      // orderService.getOrder may require token for private endpoint; this is a guest flow so backend should allow access via token/tableToken
      const token = localStorage.getItem("token");
      const data = await orderService.getOrder(orderId, token);
      setOrder(data || null)
    } catch (err) {
      console.error('Failed to fetch order:', err)
      // Fallback: if backend requires auth, try to read stored lastOrderData from localStorage
      try {
        const raw = localStorage.getItem('lastOrderData')
        if (raw) {
          const parsed = JSON.parse(raw)
          const storedId = parsed.id || parsed._id || parsed.data?.id
          if (storedId && storedId.toString() === orderId.toString()) {
            setOrder(parsed)
            setLoading(false)
            return
          }
        }
      } catch (e) {
        // ignore parse errors
      }
      setError(err.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  if (!orderId) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">No recent order found</h2>
          <p className="text-gray-600 mb-4">You don't have a recent order to track. Place an order from the menu.</p>
          <Link to="/customer/menu" className="px-4 py-2 bg-amber-800 text-white rounded">Browse Menu</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading order</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Order not found or it may take a moment to appear.</p>
          <div className="mt-4">
            <Link to="/customer/menu" className="px-4 py-2 bg-amber-800 text-white rounded">Browse Menu</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-2">Order Status</h2>
        <p className="text-sm text-gray-500 mb-4">Order ID: {order.id || order._id}</p>

        <div className="mb-4">
          <p className="font-semibold">Status:</p>
          <p className="text-lg">{order.status || order.orderStatus || 'Pending'}</p>
        </div>

        <div className="mb-4">
          <p className="font-semibold">Items</p>
          <div className="mt-2 space-y-3">
            {Array.isArray(order.items) && order.items.map((it) => (
              <div key={it.menuItemId || it.id || Math.random()} className="flex justify-between">
                <div>
                  <div className="font-medium">{it.name || it.menuItemName || 'Item'}</div>
                  <div className="text-sm text-gray-500">Qty: {it.qty}</div>
                </div>
                <div className="font-semibold">₹{((it.price || 0) * (it.qty || 1)).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div>
            <p className="text-sm text-gray-500">Placed at</p>
            <p className="font-medium">{new Date(order.createdAt || order.created || Date.now()).toLocaleString()}</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-amber-800">₹{(order.totals || order.total || order.amount || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerOrderStatus