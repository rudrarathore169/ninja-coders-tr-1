import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import tableService from "../../services/tableService";
import { Loader2, RefreshCcw, Plus, QrCode, Copy, Check, X, Lock, Unlock } from "lucide-react";

// QR Code Display Component
const QRCodeDisplay = ({ url, tableNumber }) => {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    setQrDataUrl(qrUrl);
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h3 className="text-xl font-bold text-gray-800">Table {tableNumber} QR Code</h3>
      <div className="bg-white p-4 rounded-lg border-4 border-orange-600">
        <img src={qrDataUrl} alt={`QR Code for Table ${tableNumber}`} className="w-64 h-64" />
      </div>
      <p className="text-sm text-gray-600 text-center max-w-xs">
        Scan this QR code to access the menu for Table {tableNumber}
      </p>
      <div className="text-xs text-gray-500 break-all max-w-xs text-center font-mono bg-gray-100 p-2 rounded">
        {url}
      </div>
    </div>
  );
};

const AdminTableManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [creating, setCreating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Helper function to get table ID (handles both _id and id)
  const getTableId = (table) => {
    return table._id || table.id;
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await tableService.getTables(token);
      const list = Array.isArray(res) ? res : res?.tables || [];
      
      // Debug: Check what ID field your backend uses
      console.log('📊 Tables received:', list);
      if (list.length > 0) {
        console.log('🔑 First table keys:', Object.keys(list[0]));
        console.log('🆔 First table ID:', list[0]._id || list[0].id);
      }
      
      setTables(list);
      setError(null);
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

  const handleCreateTable = async () => {
    if (!newTableNumber.trim()) return;

    try {
      setCreating(true);
      await tableService.createTable({ number: newTableNumber }, token);
      setNewTableNumber("");
      await fetchTables();
    } catch (err) {
      console.error("Error creating table:", err);
      alert("Failed to create table: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
    setRefreshing(false);
  };

  const handleToggleOccupancy = async (table) => {
    const tableId = getTableId(table);
    
    if (!tableId) {
      console.error('❌ No table ID found:', table);
      alert("Error: Table ID not found. Check console for details.");
      return;
    }
    
    console.log('🔄 Toggling occupancy for table:', tableId, 'Current status:', table.occupied);
    
    try {
      await tableService.toggleOccupancy(tableId, !table.occupied, token);
      // Update local state
      setTables(tables.map(t => 
        getTableId(t) === tableId ? { ...t, occupied: !t.occupied } : t
      ));
    } catch (err) {
      console.error("Error updating occupancy:", err);
      alert("Failed to update table occupancy: " + err.message);
    }
  };

  const getTableQRUrl = (table) => {
    return tableService.getCustomerQRUrl(table.qrSlug);
  };

  const handleCopyQR = async (table) => {
    const url = getTableQRUrl(table);
    try {
      await navigator.clipboard.writeText(url);
      const tableId = getTableId(table);
      setCopiedId(tableId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy URL to clipboard");
    }
  };

  const handleShowQR = (table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleDownloadQR = async (table) => {
    const url = getTableQRUrl(table);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `table-${table.number}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Failed to download QR:", err);
      alert("Failed to download QR code");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Table Management</h1>
          <p className="text-gray-600 mt-1">Manage tables, QR codes, and occupancy</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all shadow-lg disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Tables</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{tables.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Occupied</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {tables.filter(t => t.occupied).length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {tables.filter(t => !t.occupied).length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Unlock className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Table Form */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          type="text"
          placeholder="Enter table number (e.g., 1, 2, A1, VIP-1)"
          value={newTableNumber}
          onChange={(e) => setNewTableNumber(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateTable()}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={handleCreateTable}
          disabled={creating || !newTableNumber}
          className="flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Table
        </button>
      </div>

      {/* Tables List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-orange-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchTables}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No tables yet</h3>
          <p className="text-gray-600 mb-6">Create your first table to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-orange-600 text-white">
                  <th className="px-4 py-4 text-center font-semibold text-sm uppercase tracking-wide w-16">#</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm uppercase tracking-wide w-32">Table No.</th>
                  <th className="px-4 py-4 text-left font-semibold text-sm uppercase tracking-wide">QR Slug</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm uppercase tracking-wide w-40">Status</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm uppercase tracking-wide w-40">Created At</th>
                  <th className="px-4 py-4 text-center font-semibold text-sm uppercase tracking-wide w-64">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tables.map((table, idx) => (
                  <tr key={getTableId(table)} className="hover:bg-orange-50 transition-all">
                    <td className="px-4 py-4 text-center font-bold text-gray-700 text-base">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block px-4 py-2 bg-orange-100 text-orange-800 font-bold text-lg rounded-lg">
                        {table.number}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 font-mono text-xs">
                      {table.qrSlug}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleOccupancy(table)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                            table.occupied
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {table.occupied ? (
                            <>
                              <Lock className="h-4 w-4" />
                              Occupied
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4" />
                              Available
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-500 text-sm">
                      {new Date(table.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleCopyQR(table)}
                          className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all font-medium text-sm"
                          title="Copy QR URL"
                        >
                          {copiedId === getTableId(table) ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy QR
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleShowQR(table)}
                          className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all font-medium text-sm"
                          title="View QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                          View QR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Table {selectedTable.number} QR Code
              </h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <QRCodeDisplay 
              url={getTableQRUrl(selectedTable)} 
              tableNumber={selectedTable.number} 
            />
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => handleDownloadQR(selectedTable)}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-semibold"
              >
                Download QR
              </button>
              <button
                onClick={() => handleCopyQR(selectedTable)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTableManagement;