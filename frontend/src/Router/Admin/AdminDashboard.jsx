import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import orderService from "../../services/orderService";
import menuService from "../../services/menuService";
import tableService from "../../services/tableService";
import {
  Loader2,
  RefreshCcw,
  ShoppingBag,
  DollarSign,
  UtensilsCrossed,
  LayoutGrid,
} from "lucide-react";

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalTables: 0,
    totalMenuItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all necessary data
      const orders = await orderService.getOrders({}, token);
      const tablesRes = await tableService.getTables(token);
      const menuRes = await menuService.getMenuItems({}, token);

      const tables = Array.isArray(tablesRes)
        ? tablesRes
        : tablesRes?.tables || [];
      const menuItems = Array.isArray(menuRes)
        ? menuRes
        : menuRes?.items || [];

      // Calculate stats
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => {
        // Only count revenue for paid orders
        if (o.payment?.status === 'paid') {
          return sum + (parseFloat(o.totals) || 0);
        }
        return sum;
      }, 0);
      const totalTables = tables.length;
      const totalMenuItems = menuItems.length;

      setStats({
        totalOrders,
        totalRevenue,
        totalTables,
        totalMenuItems,
      });
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
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
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center gap-4">
              <ShoppingBag className="h-10 w-10 text-orange-600" />
              <div>
                <p className="text-gray-500 text-sm">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.totalOrders}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center gap-4">
              <DollarSign className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-800">
                  ₹{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center gap-4">
              <UtensilsCrossed className="h-10 w-10 text-blue-600" />
              <div>
                <p className="text-gray-500 text-sm">Total Tables</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.totalTables}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex items-center gap-4">
              <LayoutGrid className="h-10 w-10 text-purple-600" />
              <div>
                <p className="text-gray-500 text-sm">Menu Items</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {stats.totalMenuItems}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Revenue Summary
            </h2>
            <p className="text-gray-600">
              You have generated a total of{" "}
              <span className="font-bold text-orange-600">
                ₹{stats.totalRevenue.toFixed(2)}
              </span>{" "}
              from <span className="font-bold">{stats.totalOrders}</span> orders.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
