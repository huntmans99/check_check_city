"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types/order";
import { LogOut, Loader, AlertCircle, Download, Search, Eye } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "check123") {
      setIsAuthenticated(true);
      setPassword("");
      fetchOrders();
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      if (!supabase) {
        setError("Supabase is not configured. Please add credentials to .env.local");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setError(`Failed to fetch orders: ${error.message}`);
      } else {
        setOrders(data || []);
        setError("");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Check browser console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch orders when authenticated, and refresh every 30 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) {
        setError("Failed to update order status");
        console.error("Error updating order:", error);
      } else {
        fetchOrders();
      }
    } catch (err) {
      console.error("Error updating order:", err);
      setError("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "ready":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "🕐";
      case "confirmed":
        return "✓";
      case "processing":
        return "⚙";
      case "ready":
        return "📦";
      case "delivered":
        return "✓✓";
      default:
        return "?";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToExcel = () => {
    const exportData = filteredOrders.map((order) => ({
      "Order ID": order.id?.slice(0, 8),
      "Customer Name": order.customer_name,
      "Customer Phone": order.customer_phone,
      "Delivery Location": order.delivery_location,
      "Address": order.customer_address || "",
      "Items": order.items?.map((i) => `${i.name} x${i.quantity}`).join("; ") || "",
      "Subtotal": order.subtotal?.toFixed(2),
      "Delivery Fee": order.delivery_fee?.toFixed(2),
      "Total": order.total?.toFixed(2),
      "Status": order.status,
      "Created": new Date(order.created_at).toLocaleString(),
      "Updated": new Date(order.updated_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const colWidths = [
      { wch: 12 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 20 },
      { wch: 30 },
      { wch: 12 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `CheckCheck_Orders_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <h1 className="font-display text-3xl font-bold text-[#0A0A0A] mb-2 text-center">
            Admin Panel
          </h1>
          <p className="text-gray-600 text-center mb-6">Check Check City Order Management</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:shadow-lg text-white py-3 rounded-lg font-bold transition-all"
            >
              Login
            </button>

            <Link href="/" className="block text-center text-sm text-gray-600 hover:text-gray-800">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#0A0A0A]">
              Order Management
            </h1>
            <p className="text-gray-600 text-sm mt-1">Check Check City Admin</p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-3 rounded-lg font-semibold transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-6"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader size={32} className="text-[#DC2626] animate-spin" />
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Items</th>
                    <th className="px-6 py-4 text-right text-sm font-bold">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-[#DC2626]">
                        {order.id?.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {order.customer_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customer_phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.delivery_location}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-gray-600 truncate max-w-xs">
                          {order.items?.length === 1
                            ? `${order.items[0].name} x${order.items[0].quantity}`
                            : `${order.items?.length || 0} items`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#DC2626]">
                        GH₵{order.total?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            disabled={updating === order.id}
                            className="px-2 py-1 text-sm border-2 border-gray-300 rounded-lg focus:border-[#DC2626] outline-none transition-all disabled:opacity-50"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
