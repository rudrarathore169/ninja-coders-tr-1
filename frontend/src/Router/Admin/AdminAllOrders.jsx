import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import orderService from "../../services/orderService";
import { format } from "date-fns";
import { Loader2, RefreshCcw, Eye, CircleCheck } from "lucide-react";

const statusColors = {
  placed: "bg-yellow-100 text-yellow-700",
  preparing: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  served: "bg-purple-100 text-purple-700",
  completed: "bg-gray-100 text-gray-700",
  canceled: "bg-red-100 text-red-700",
};

const AdminAllOrders = () => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const orderList = await orderService.getOrders({}, token);
      setOrders(orderList);
    } catch (err) {
      console.error("Error fetching orders:", err);
      // Surface backend/network error message to the UI for easier debugging
      setError(err.message || "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Orders</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-orange-600" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">
          No orders found yet.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
          <table className="w-full table-auto">
            <thead className="bg-orange-600 text-white text-sm uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Table</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {orders.map((order, idx) => (
                <tr key={order._id} className="hover:bg-orange-50 transition-all">
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.table?.number ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.customer?.name ?? "Guest"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.items?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-semibold">
                    ₹{order.totals?.toFixed(2) ?? "0.00"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {order.payment?.status === "paid" ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CircleCheck className="h-4 w-4" /> Paid
                      </span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {order.createdAt
                      ? format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/admin/order/${order._id}`)}
                      className="text-orange-600 hover:text-orange-800 flex items-center justify-center gap-1"
                    >
                      <Eye className="h-4 w-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAllOrders;
