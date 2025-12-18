"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/lib/user-context";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types/order";
import { LogOut, Loader, AlertCircle, Package, ArrowRight, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const { user, logout } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchUserOrders = async () => {
      setLoading(true);
      setError("");

      try {
        if (!supabase) {
          setError("Database not configured");
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_phone", user.phone)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching orders:", fetchError);
          setError("Failed to fetch orders");
        } else {
          setOrders(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-[#0A0A0A] mb-2">Not Logged In</h1>
          <p className="text-gray-600 mb-8">Please login to see your orders</p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-4 rounded-full font-semibold transition-all"
          >
            Go to Cart
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={18} />;
      case "confirmed":
      case "processing":
      case "ready":
        return <CheckCircle size={18} />;
      case "delivered":
        return <CheckCircle size={18} />;
      default:
        return <Package size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#0A0A0A]">
              Your Orders
            </h1>
            <p className="text-gray-600 text-sm mt-1">{user.name} • {user.phone}</p>
          </div>
          <button
            onClick={() => {
              logout();
            }}
            className="flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-3 rounded-lg font-semibold transition-all"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-8">You haven't placed any orders yet</p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-4 rounded-full font-semibold transition-all"
            >
              Start Ordering
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-[#0A0A0A]">
                        Order #{order.id?.slice(0, 8) || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 font-medium text-sm flex items-center gap-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Items</p>
                      <div className="space-y-1">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any, i: number) => (
                            <p key={i} className="text-sm text-gray-700">
                              {item.name} x{item.quantity} - <span className="font-semibold">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No items</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Delivery Details</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700"><span className="font-semibold">Location:</span> {order.delivery_location}</p>
                        {order.customer_address && (
                          <p className="text-gray-700"><span className="font-semibold">Address:</span> {order.customer_address}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>GH₵{order.subtotal?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span>GH₵{order.delivery_fee?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                        <span>Total:</span>
                        <span className="text-[#DC2626]">GH₵{order.total?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-[#DC2626] hover:text-[#B91C1C] font-semibold"
          >
            ← Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
