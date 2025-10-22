import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import tableService from "../../services/tableService";
import { Loader2, RefreshCcw, Plus, QrCode, Copy } from "lucide-react";

const AdminTableManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [creating, setCreating] = useState(false);

  // ✅ Fetch all tables
  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await tableService.getTables(token);
      const list = Array.isArray(res)
        ? res
        : res?.tables || res?.data || [];
      setTables(list);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError("Failed to load tables. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // ✅ Create new table
  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableNumber) return;
    try {
      setCreating(true);
      await tableService.createTable({ number: newTableNumber }, token);
      setNewTableNumber("");
      await fetchTables();
    } catch (err) {
      console.error("Error creating table:", err);
      alert("Failed to create table. Please check console.");
    } finally {
      setCreating(false);
    }
  };

  // ✅ Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
    setRefreshing(false);
  };

  // ✅ Copy QR link
  const handleCopyQR = async (table) => {
    try {
      const url = await tableService.getTableQRUrl(table._id, token);
      navigator.clipboard.writeText(url);
      alert("QR URL copied to clipboard!");
    } catch (err) {
      console.error("QR copy error:", err);
      alert("Failed to copy QR URL.");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Table Management</h1>
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

      {/* Create Table */}
      <form
        onSubmit={handleCreateTable}
        className="mb-6 bg-white p-4 rounded-xl shadow border border-gray-200 flex flex-col md:flex-row gap-3 md:items-center"
      >
        <input
          type="number"
          placeholder="Enter table number"
          value={newTableNumber}
          onChange={(e) => setNewTableNumber(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Table
        </button>
      </form>

      {/* Tables */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-orange-600" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : tables.length === 0 ? (
        <p className="text-gray-600 text-center text-lg">
          No tables found. Create one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-200">
          <table className="w-full table-auto">
            <thead className="bg-orange-600 text-white text-sm uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Table No.</th>
                <th className="px-4 py-3 text-left">QR Slug</th>
                <th className="px-4 py-3 text-left">Active Session</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-center">QR / Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {tables.map((table, idx) => (
                <tr
                  key={table._id}
                  className="hover:bg-orange-50 transition-all"
                >
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {table.number}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{table.qrSlug}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {table.activeSessionId ? (
                      <span className="text-green-600 font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(table.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => handleCopyQR(table)}
                      className="text-orange-600 hover:text-orange-800 flex items-center gap-1"
                    >
                      <Copy className="h-4 w-4" /> Copy QR
                    </button>
                    <a
                      href={`/m/${table.qrSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      <QrCode className="h-4 w-4" /> Open
                    </a>
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

export default AdminTableManagement;
