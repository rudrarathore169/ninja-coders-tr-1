import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import orderService from '../../services/orderService'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

const AdminOrderDetail = () => {
  const navigate = useNavigate()
  const { id: orderId } = useParams()
  const { token } = useSelector((state) => state.auth)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  const fetchOrder = async () => {
    if (!orderId) {
      setError('No order id provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await orderService.getOrder(orderId, token)
      setOrder(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError(err.message || 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const handleUpdateStatus = async (newStatus) => {
    if (!orderId) return
    try {
      setUpdating(true)
      await orderService.updateOrderStatus(orderId, newStatus, token)
      // Refetch the full order data after status update
      await fetchOrder()
    } catch (err) {
      console.error('Failed to update status:', err)
      setError(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePayment = async (newStatus) => {
    if (!orderId) return
    try {
      setUpdating(true)
      await orderService.updateOrderPayment(orderId, newStatus, token)
      // Refetch the full order data after payment update
      await fetchOrder()
    } catch (err) {
      console.error('Failed to update payment status:', err)
      setError(err.message || 'Failed to update payment status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-orange-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-2 px-4 py-2 bg-amber-800 text-white rounded">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order #{order.orderNumber}</h2>
            <p className="text-gray-600">Customer: {order.customer?.name ?? 'Guest'}</p>
            <p className="text-gray-500 text-sm">Placed: {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm') : '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Table: {order.table?.number ?? '—'}</p>
            <p className="text-sm font-semibold mt-2">Status: {order.status}</p>
            <p className="text-sm font-semibold mt-1">Payment: {order.payment?.status ?? 'pending'}</p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
          <ul className="divide-y divide-gray-200">
            {order.items?.map((it) => (
              <li key={it._id} className="py-3 flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{it.name}</p>
                  <p className="text-sm text-gray-500">Qty: {it.qty}</p>
                </div>
                <div className="text-gray-800 font-semibold">₹{(parseFloat(it.price) * it.qty).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Total: <span className="font-bold text-gray-800">₹{order.totals?.toFixed(2) ?? '0.00'}</span></p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Payment:</span>
              <select
                value={order.payment?.status ?? 'pending'}
                onChange={(e) => handleUpdatePayment(e.target.value)}
                disabled={updating}
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleUpdateStatus('preparing')} disabled={updating} className="px-4 py-2 bg-blue-600 text-white rounded">Mark Preparing</button>
            <button onClick={() => handleUpdateStatus('ready')} disabled={updating} className="px-4 py-2 bg-green-600 text-white rounded">Mark Ready</button>
            <button onClick={() => handleUpdateStatus('served')} disabled={updating} className="px-4 py-2 bg-purple-600 text-white rounded">Mark Served</button>
            <button onClick={() => handleUpdateStatus('completed')} disabled={updating} className="px-4 py-2 bg-gray-600 text-white rounded">Mark Completed</button>
            <button onClick={() => handleUpdateStatus('canceled')} disabled={updating} className="px-4 py-2 bg-red-600 text-white rounded">Cancel Order</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail
