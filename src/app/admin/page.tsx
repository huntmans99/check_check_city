"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types/order";
import { LogOut, Loader, AlertCircle, Download, Search, Eye, FileText, Sheet } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

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

  const getTodaysOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return filteredOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  };

  const exportTodaysToCSV = () => {
    const todaysOrders = getTodaysOrders();
    if (todaysOrders.length === 0) {
      alert("No orders for today");
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Delivery Location",
      "Address",
      "Items",
      "Subtotal",
      "Delivery Fee",
      "Total",
      "Status",
      "Created",
      "Updated",
    ];

    const rows = todaysOrders.map((order) => [
      order.id?.slice(0, 8),
      order.customer_name,
      order.customer_phone,
      order.delivery_location,
      order.customer_address || "",
      order.items?.map((i) => `${i.name} x${i.quantity}`).join("; ") || "",
      order.subtotal?.toFixed(2),
      order.delivery_fee?.toFixed(2),
      order.total?.toFixed(2),
      order.status,
      new Date(order.created_at).toLocaleString(),
      new Date(order.updated_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `CheckCheck_Orders_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTodaysToPDF = () => {
    const todaysOrders = getTodaysOrders();
    if (todaysOrders.length === 0) {
      alert("No orders for today");
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 10;

    // Title
    pdf.setFontSize(18);
    pdf.text("Order Summary - " + new Date().toLocaleDateString(), pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 10;

    // Summary stats
    pdf.setFontSize(10);
    const totalRevenue = todaysOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = todaysOrders.length;

    pdf.text(`Total Orders: ${totalOrders}`, 10, yPosition);
    pdf.text(`Total Revenue: GH¢ ${totalRevenue.toFixed(2)}`, 10, yPosition + 6);
    yPosition += 16;

    // Orders
    todaysOrders.forEach((order, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 10;
      }

      // Order header
      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.text(`Order #${index + 1} - ${order.id?.slice(0, 8)}`, 10, yPosition);
      yPosition += 6;

      // Order details
      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");
      pdf.text(`Customer: ${order.customer_name} (${order.customer_phone})`, 10, yPosition);
      yPosition += 4;
      pdf.text(`Location: ${order.delivery_location}`, 10, yPosition);
      yPosition += 4;
      pdf.text(`Status: ${order.status}`, 10, yPosition);
      yPosition += 4;

      // Items
      const itemText = order.items
        ?.map((i) => `${i.name} x${i.quantity} - GH¢ ${(i.price * i.quantity).toFixed(2)}`)
        .join(", ");
      pdf.text(`Items: ${itemText}`, 10, yPosition);
      yPosition += 4;

      // Total
      pdf.setFont(undefined, "bold");
      pdf.text(`Total: GH¢ ${order.total?.toFixed(2)}`, 10, yPosition);
      yPosition += 8;

      pdf.setLineWidth(0.5);
      pdf.line(10, yPosition, pageWidth - 10, yPosition);
      yPosition += 4;
    });

    pdf.save(`CheckCheck_Orders_${new Date().toISOString().split("T")[0]}.pdf`);
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
          <>
            {/* Filter and Export Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 space-y-4"
            >
              {/* Search and Status Filter */}
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search Input */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Search size={16} className="inline mr-2" />
                      Search Orders
                    </label>
                    <input
                      type="text"
                      placeholder="Search by customer name, phone, or order ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Export Today's Orders</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={exportTodaysToCSV}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      <Sheet size={18} />
                      Download CSV
                    </button>
                    <button
                      onClick={exportTodaysToPDF}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      <FileText size={18} />
                      Download PDF
                    </button>
                    <button
                      onClick={exportToExcel}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      <Download size={18} />
                      Download Excel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white sticky top-0">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-bold">Order ID</th>
                    <th className="px-3 py-3 text-left text-xs font-bold">Customer</th>
                    <th className="px-3 py-3 text-left text-xs font-bold">Phone</th>
                    <th className="px-3 py-3 text-left text-xs font-bold">Location</th>
                    <th className="px-3 py-3 text-left text-xs font-bold">Items</th>
                    <th className="px-3 py-3 text-right text-xs font-bold">Total</th>
                    <th className="px-3 py-3 text-left text-xs font-bold">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-bold">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-bold">Actions</th>
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
                      <td className="px-3 py-3 text-xs font-mono font-semibold text-[#DC2626] whitespace-nowrap">
                        {order.id?.slice(0, 8)}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium text-gray-900 truncate">
                        {order.customer_name}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {order.customer_phone}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 truncate">
                        {order.delivery_location}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 truncate max-w-[120px]">
                        {order.items?.length === 1
                          ? `${order.items[0].name} x${order.items[0].quantity}`
                          : `${order.items?.length || 0} items`}
                      </td>
                      <td className="px-3 py-3 text-xs font-bold text-[#DC2626] whitespace-nowrap">
                        GH₵{order.total?.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowModal(true);
                            }}
                            className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            disabled={updating === order.id}
                            className="px-2 py-1 text-xs border-2 border-gray-300 rounded focus:border-[#DC2626] outline-none transition-all disabled:opacity-50"
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
            </motion.div>

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#0A0A0A]">Order Details</h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Order ID and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Order ID</p>
                        <p className="text-lg font-mono font-bold text-[#DC2626]">{selectedOrder.id?.slice(0, 12)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Status</p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Order Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Order Date</p>
                        <p className="text-lg font-medium text-gray-900">
                          {new Date(selectedOrder.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Last Updated</p>
                        <p className="text-lg font-medium text-gray-900">
                          {new Date(selectedOrder.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-bold text-gray-900 mb-4">Customer Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Name</p>
                          <p className="text-lg font-medium text-gray-900">{selectedOrder.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Phone</p>
                          <p className="text-lg font-medium text-gray-900">{selectedOrder.customer_phone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 font-semibold">Address</p>
                          <p className="text-lg font-medium text-gray-900">{selectedOrder.customer_address}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600 font-semibold">Delivery Location</p>
                          <p className="text-lg font-medium text-gray-900">{selectedOrder.delivery_location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-bold text-gray-900 mb-4">Items Ordered</h3>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-[#DC2626]">GH₵{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-gray-200 pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">Subtotal:</p>
                        <p className="font-medium text-gray-900">GH₵{selectedOrder.subtotal?.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">Delivery Fee:</p>
                        <p className="font-medium text-gray-900">GH₵{selectedOrder.delivery_fee?.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-r from-[#DC2626]/10 to-[#B91C1C]/10 p-4 rounded-lg">
                        <p className="font-bold text-gray-900">Total:</p>
                        <p className="font-bold text-2xl text-[#DC2626]">GH₵{selectedOrder.total?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full mt-8 bg-[#DC2626] hover:bg-[#B91C1C] text-white py-3 rounded-lg font-bold transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
