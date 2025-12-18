"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types/order";
import { LogOut, Loader, AlertCircle, CheckCircle, Clock, Package } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

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

      console.log("Fetching orders from Supabase...");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        if (error.code === "PGRST116") {
          setError("Orders table not found. Please create the table in Supabase SQL Editor using the provided script.");
        } else {
          setError(`Failed to fetch orders: ${error.message}`);
        }
      } else {
        console.log("Orders fetched:", data);
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
      const interval = setInterval(fetchOrders, 30000); // 30 seconds
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
        return "bg-green-100 text-green-800 border-green-300";
      case "delivered":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock size={18} />;
      case "confirmed":
        return <CheckCircle size={18} />;
      case "processing":
        return <Package size={18} />;
      case "ready":
        return <CheckCircle size={18} />;
      case "delivered":
        return <CheckCircle size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  // Group orders by date
  const groupOrdersByDate = (ordersList: Order[]) => {
    const grouped: { [key: string]: Order[] } = {};
    
    ordersList.forEach((order) => {
      const date = new Date(order.created_at);
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(order);
    });

    // Sort dates in descending order (newest first)
    return Object.entries(grouped).sort((a, b) => {
      return new Date(b[0]).getTime() - new Date(a[0]).getTime();
    });
  };

  const groupedOrders = groupOrdersByDate(orders);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <h1 className="font-display text-3xl font-bold text-[#0A0A0A] mb-2 text-center">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-center mb-8">Check Check City</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-sm"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-3 rounded-lg font-semibold transition-all"
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
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 text-sm">
                Total Orders: <span className="font-bold text-[#DC2626]">{orders.length}</span>
              </p>
              <button
                onClick={fetchOrders}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-all"
              >
                Refresh
              </button>
            </div>

            {groupedOrders.map(([dateKey, dayOrders], dateIndex) => (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dateIndex * 0.1 }}
                className="space-y-3"
              >
                <div className="sticky top-20 z-10 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] rounded-lg p-4 shadow-md">
                  <h2 className="font-display text-xl font-bold text-white">
                    {dateKey}
                  </h2>
                  <p className="text-red-100 text-sm">
                    {dayOrders.length} order{dayOrders.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {dayOrders.map((order, orderIndex) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (dateIndex * 0.1) + (orderIndex * 0.05) }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg text-[#0A0A0A] mb-3">
                        Order #{order.id?.slice(0, 8) || "N/A"}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-gray-600">Customer</p>
                          <p className="font-medium text-[#0A0A0A]">{order.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Phone</p>
                          <p className="font-medium text-[#0A0A0A]">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Delivery Location</p>
                          <p className="font-medium text-[#0A0A0A]">{order.delivery_location}</p>
                        </div>
                        {order.customer_address && (
                          <div>
                            <p className="text-gray-600">Address</p>
                            <p className="font-medium text-[#0A0A0A]">{order.customer_address}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="space-y-1 mb-3">
                          {order.items && order.items.length > 0 ? (
                            <>
                              <p className="text-xs font-medium text-gray-600 mb-2">Items</p>
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span>
                                    {item.name} x{item.quantity}
                                  </span>
                                  <span className="font-medium">
                                    GH₵{(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </>
                          ) : (
                            <p className="text-gray-500 text-sm">No items</p>
                          )}
                        </div>
                        <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>GH₵{order.subtotal?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery:</span>
                            <span>GH₵{order.delivery_fee?.toFixed(2) || "0.00"}</span>
                          </div>
                          <div className="flex justify-between font-bold text-base">
                            <span>Total:</span>
                            <span className="text-[#DC2626]">
                              GH₵{order.total?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600">Order Status</p>
                        <div className="flex flex-wrap gap-2">
                          {(["pending", "confirmed", "processing", "ready", "delivered"] as OrderStatus[]).map(
                            (status) => (
                              <button
                                key={status}
                                onClick={() => updateOrderStatus(order.id, status)}
                                disabled={updating === order.id}
                                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-1 ${
                                  order.status === status
                                    ? `${getStatusColor(status)} ring-2 ring-offset-2`
                                    : `${getStatusColor(status)} opacity-50 hover:opacity-100`
                                } ${updating === order.id ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                {order.status === status && (
                                  <span>{getStatusIcon(status)}</span>
                                )}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                    <span>Created: {new Date(order.created_at).toLocaleString()}</span>
                    <span>Updated: {new Date(order.updated_at).toLocaleString()}</span>
                  </div>
                </div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
