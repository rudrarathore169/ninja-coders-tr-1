import React, { useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice'
import orderService from '../../services/orderService'
import { useNavigate } from 'react-router-dom'

const CustomerCart = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(state => state.cart.items)
  const tableToken = useSelector(state => state.cart.tableToken)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const total = useMemo(() => items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0), [items])

  const handleRemove = (id) => {
    dispatch(removeFromCart(id))
  }

  const handleQtyChange = (id, qty) => {
    const q = Math.max(1, parseInt(qty) || 1)
    dispatch(updateQuantity({ id, quantity: q }))
  }

  const handleClear = () => {
    if (!window.confirm('Clear the cart?')) return
    dispatch(clearCart())
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert('Cart is empty')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Backend expects each item to include menuItemId, name, price, qty
      const orderData = {
        items: items.map(i => ({ menuItemId: i.id, name: i.name, price: parseFloat(i.price), qty: parseInt(i.quantity, 10) || 1 })),
        // include tableToken in meta so backend can resolve table if needed
        meta: tableToken ? { tableToken } : {}
      }

      const created = await orderService.createOrder(orderData)
      dispatch(clearCart())
      try { window.alert('Order placed successfully') } catch (_) {}
      // navigate to order status page if created and has id
      const orderId = created && (created.id || created._id)
      try {
        // persist last order id and the full order payload so unauthenticated users can view it
        if (orderId) localStorage.setItem('lastOrderId', orderId)
        localStorage.setItem('lastOrderData', JSON.stringify(created || {}))
      } catch (_) {}

      if (orderId) {
        navigate(`/customer/order-status?id=${orderId}`)
      } else {
        navigate('/customer/order-status')
      }
    } catch (err) {
      console.error('Checkout failed:', err)
      setError(err.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty.</p>
            <a href="/customer/menu" className="px-4 py-2 bg-amber-800 text-white rounded">Browse Menu</a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between border-b py-4">
                <div>
                  <h3 className="font-semibold">{it.name}</h3>
                  <p className="text-sm text-gray-500">₹{it.price} each</p>
                </div>

                <div className="flex items-center gap-4">
                  <input type="number" min={1} value={it.quantity} onChange={(e) => handleQtyChange(it.id, e.target.value)} className="w-20 px-3 py-2 border rounded" />
                  <p className="font-semibold">₹{(it.price * it.quantity).toFixed(2)}</p>
                  <button onClick={() => handleRemove(it.id)} className="px-3 py-2 bg-red-100 text-red-700 rounded">Remove</button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between mt-6">
              <div>
                <button onClick={handleClear} className="px-4 py-2 bg-gray-100 rounded">Clear Cart</button>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-amber-800">₹{total.toFixed(2)}</p>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="mt-3 flex gap-2 justify-end">
                  <button onClick={() => navigate('/customer/menu')} className="px-4 py-2 bg-gray-100 rounded">Continue Shopping</button>
                  <button onClick={handleCheckout} disabled={loading} className="px-4 py-2 bg-amber-800 text-white rounded">
                    {loading ? 'Placing Order...' : 'Checkout'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerCart