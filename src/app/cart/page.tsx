"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { deliveryLocations } from "@/lib/data";
import { Minus, Plus, Trash2, MapPin, ShoppingBag, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const {
    items,
    deliveryLocation,
    setDeliveryLocation,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const filteredLocations = deliveryLocations.filter((loc) =>
    loc.name.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const handlePlaceOrder = () => {
    if (!customerName || !customerPhone || !deliveryLocation || items.length === 0) {
      return;
    }
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check size={48} className="text-white" />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-[#0A0A0A] mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your order! We&apos;ll contact you shortly to confirm your delivery.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-4 rounded-full font-semibold transition-all"
          >
            Order Again
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag size={80} className="text-gray-300 mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-[#0A0A0A] mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              Add some delicious meals to get started!
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-4 rounded-full font-semibold transition-all"
            >
              Browse Menu
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-8 text-center"
        >
          Your <span className="text-[#DC2626]">Cart</span>
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="font-display text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <img
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0A0A0A]">
                        {cartItem.item.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {cartItem.item.description}
                      </p>
                      <p className="text-[#DC2626] font-bold">
                        GH₵{cartItem.item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(cartItem.item.id, cartItem.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(cartItem.item.id, cartItem.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(cartItem.item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-[#DC2626]" />
                Delivery Location
              </h2>
              <input
                type="text"
                placeholder="Search your area..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all mb-4"
              />
              <div className="max-h-48 overflow-y-auto space-y-2">
                {filteredLocations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setDeliveryLocation(loc);
                      setSearchLocation("");
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      deliveryLocation?.name === loc.name
                        ? "bg-[#DC2626] text-white"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <span>{loc.name}</span>
                    <span className="font-semibold">GH₵{loc.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
              {deliveryLocation && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 font-medium">
                    Delivering to: <span className="font-bold">{deliveryLocation.name}</span>
                  </p>
                  <p className="text-green-600 text-sm">
                    Delivery fee: GH₵{deliveryLocation.price.toFixed(2)}
                  </p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="font-display text-xl font-bold mb-4">Your Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address (Optional)
                  </label>
                  <textarea
                    placeholder="Enter specific address/landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0A0A0A] rounded-2xl p-6 text-white sticky top-24"
            >
              <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((cartItem) => (
                  <div key={cartItem.item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {cartItem.item.name} x{cartItem.quantity}
                    </span>
                    <span>GH₵{(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Fee</span>
                  <span>
                    {deliveryLocation
                      ? `GH₵${deliveryFee.toFixed(2)}`
                      : "Select location"}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-700">
                  <span>Total</span>
                  <span className="text-[#F7D000]">GH₵{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={!customerName || !customerPhone || !deliveryLocation}
                className="w-full mt-6 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all"
              >
                Place Order
              </button>
              {(!customerName || !customerPhone || !deliveryLocation) && (
                <p className="text-center text-gray-500 text-sm mt-3">
                  Please fill in all required fields
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
