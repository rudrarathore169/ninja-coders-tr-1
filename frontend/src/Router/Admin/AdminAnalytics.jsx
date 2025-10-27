import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import orderService from "../../services/orderService";
import {
  Loader2,
  RefreshCcw,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Pie,
  PieChart as RePieChart,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";

const AdminAnalytics = () => {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const list = await orderService.getOrders({}, token);
      setOrders(list);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  // ✅ Prepare data for charts
  const dailyStats = {};
  let totalRevenue = 0;

  orders.forEach((order) => {
    // Count all orders for analytics (both paid and pending)
    const date = format(new Date(order.createdAt), "dd MMM");
    const total = parseFloat(order.totals) || 0;
    totalRevenue += total;
    dailyStats[date] = (dailyStats[date] || 0) + total;
  });

  const chartData = Object.keys(dailyStats).map((day) => ({
    date: day,
    revenue: dailyStats[day],
  }));

  // ✅ Payment status breakdown
  const paymentStats = orders.reduce(
    (acc, order) => {
      const status = order.payment?.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const pieData = Object.entries(paymentStats).map(([key, value]) => ({
    name: key,
    value,
  }));

  const COLORS = ["#f97316", "#10b981", "#3b82f6", "#a855f7"];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-orange-600" />
          Analytics Dashboard
        </h1>
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
          <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No order data found to generate analytics.
        </p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
              <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">
                {orders.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
              <TrendingUp className="h-10 w-10 text-green-600 mb-2" />
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
              <PieChart className="h-10 w-10 text-purple-600 mb-2" />
              <p className="text-gray-500 text-sm">Payment Types</p>
              <p className="text-lg font-medium text-gray-800">
                {pieData.map((p) => p.name).join(", ")}
              </p>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💰 Revenue Trend (Daily)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Status Pie */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💳 Payment Status Distribution
            </h2>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
