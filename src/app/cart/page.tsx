"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { useUser } from "@/lib/user-context";
import { deliveryLocations } from "@/lib/data";
import { Minus, Plus, Trash2, MapPin, ShoppingBag, Check, ArrowRight, Truck, AlertCircle, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types/order";
import PasswordResetModal from "@/components/PasswordResetModal";
import CreateAccountModal from "@/components/CreateAccountModal";
import LoginModal from "@/components/LoginModal";

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

  const { user, loginOrSignup, logout, isLoading: userLoading, updateUser } = useUser();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(!user);

  // Pre-fill user details when user logs in
  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerPhone(user.phone);
      setAddress(user.address);
      setShowLoginModal(false);
    } else {
      setShowLoginModal(true);
    }
  }, [user]);

  const filteredLocations = deliveryLocations.filter((loc) =>
    loc.name.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const handlePlaceOrder = () => {
    if (!customerName || !customerPhone || !deliveryLocation || items.length === 0) {
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    try {
      if (!supabase) {
        console.error("Supabase not initialized");
        setShowConfirmation(false);
        alert("Database connection failed. Please try again.");
        return;
      }

      // Create order object - omit id, created_at, and updated_at (let database handle these)
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: address || null,
        delivery_location: deliveryLocation?.name || "",
        items: items.map(item => ({
          id: item.item.id,
          name: item.item.name,
          price: item.item.price,
          quantity: item.quantity,
        })),
        subtotal: parseFloat(subtotal.toFixed(2)),
        delivery_fee: parseFloat(deliveryFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        status: "pending",
      };

      console.log("Saving order:", orderData);

      // Save order to Supabase
      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select();

      if (error) {
        console.error("Error saving order:", error);
        alert("Failed to place order: " + error.message);
        return;
      }

      console.log("Order saved successfully:", data);

      // Clear cart and show success message
      clearCart();
      setShowConfirmation(false);
      setOrderPlaced(true);

      // Reset form after showing success
      setTimeout(() => {
        setCustomerName("");
        setCustomerPhone("");
        setAddress("");
      }, 2000);
    } catch (err: any) {
      console.error("Error placing order:", err);
      alert("An error occurred. Please try again.");
    }
  };

  // Success Page
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <Check size={48} className="text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-2 text-base sm:text-lg">
              Thank you for your order! We'll deliver it soon.
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-[#DC2626] rounded-xl p-4 sm:p-6 mb-8 mt-6">
              <p className="text-gray-700 font-semibold mb-1 text-sm sm:text-base">Total Amount</p>
              <p className="text-[#DC2626] font-bold text-3xl sm:text-4xl mb-3">GH₵{total.toFixed(2)}</p>
              <p className="text-gray-600 text-sm sm:text-base font-medium">Payment on Delivery</p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg"
            >
              Order Again
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Order Confirmation Modal
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto w-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-4 sm:p-6 my-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Truck className="text-blue-600" size={32} />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0A0A] mb-2">Order Summary</h2>
            <p className="text-gray-600 text-sm">Review and confirm your order</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-6 border border-gray-200">
            <div className="space-y-3 mb-4">
              <h3 className="font-semibold text-gray-700 text-sm px-1">Items</h3>
              {items.map((cartItem) => (
                <div key={cartItem.item.id} className="flex justify-between text-sm bg-white p-3 rounded-lg">
                  <span className="text-gray-600 font-medium">
                    {cartItem.item.name} x{cartItem.quantity}
                  </span>
                  <span className="font-bold text-gray-800">GH₵{(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-800">GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold text-gray-800">GH₵{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#DC2626] pt-2 bg-red-50 p-3 rounded-lg">
                <span>Total</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-green-900">Delivery Location</p>
                <p className="text-green-700">{deliveryLocation?.name}</p>
              </div>
            </div>
            <div className="text-xs text-green-700 ml-7 font-medium">
              <span className="font-bold">Name:</span> {customerName} | <span className="font-bold">Phone:</span> {customerPhone}
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex gap-3 items-start">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">Payment on Delivery</p>
                <p className="text-blue-700">
                  You will pay <span className="font-bold">GH₵{total.toFixed(2)}</span> when your order arrives
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleConfirmOrder}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:shadow-lg text-white px-4 py-3 rounded-xl font-bold transition-all"
            >
              <Check size={20} />
              Confirm Order
            </button>
          </div>
        </motion.div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-12 px-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-6 sm:mb-8 text-center"
        >
          Your <span className="text-[#DC2626]">Cart</span>
        </motion.h1>

        {/* User Login Modal & Signup Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
          }}
          onForgotPassword={() => setShowPasswordReset(true)}
          onCreateAccount={() => setShowCreateAccount(true)}
        />

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Check size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900">{user.name}</p>
                <p className="text-sm text-green-700">{user.phone}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setShowLoginModal(true);
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="font-display text-lg md:text-2xl font-bold mb-4 md:mb-6 text-[#0A0A0A]">
                Order Items ({items.length})
              </h2>
              <div className="space-y-4 md:space-y-5">
                {items.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 hover:border-[#DC2626]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-semibold text-base md:text-lg text-[#0A0A0A] line-clamp-2 mb-1">
                        {cartItem.item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 mb-2">
                        {cartItem.item.description}
                      </p>
                      <p className="text-[#DC2626] font-bold text-base md:text-lg">
                        GH₵{cartItem.item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        onClick={() =>
                          updateQuantity(cartItem.item.id, cartItem.quantity - 1)
                        }
                        className="w-8 h-8 sm:w-9 md:w-10 flex items-center justify-center bg-gray-300 hover:bg-gray-400 rounded-full transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold text-base flex-shrink-0">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(cartItem.item.id, cartItem.quantity + 1)
                        }
                        className="w-8 h-8 sm:w-9 md:w-10 flex items-center justify-center bg-gray-300 hover:bg-gray-400 rounded-full transition-colors"
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

            {/* Delivery Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="font-display text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-[#0A0A0A]">
                <MapPin className="text-[#DC2626] flex-shrink-0" size={24} />
                Delivery Location
              </h2>
              
              <div>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-base text-left bg-white flex items-center justify-between font-medium"
                >
                  <span className={deliveryLocation ? "text-gray-800" : "text-gray-400"}>
                    {deliveryLocation ? deliveryLocation.name : "Select delivery area..."}
                  </span>
                  <ChevronDown size={20} className={`text-gray-600 transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <input
                    type="text"
                    placeholder="Type to search areas..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-base placeholder:text-gray-400 mb-3"
                    autoFocus
                  />

                  <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc) => (
                        <button
                          key={loc.name}
                          onClick={() => {
                            setDeliveryLocation(loc);
                            setSearchLocation("");
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all font-semibold ${
                            deliveryLocation?.name === loc.name
                              ? "bg-[#DC2626] text-white shadow-lg"
                              : "bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-100"
                          }`}
                        >
                          <span className="truncate flex-1 text-left text-base">{loc.name}</span>
                          <span className="flex-shrink-0 ml-3 text-base font-bold">
                            GH₵{loc.price.toFixed(2)}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">No areas found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {deliveryLocation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border-2 border-green-300 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-green-900 font-bold text-base">{deliveryLocation.name}</p>
                      <p className="text-green-700 text-sm">Delivery fee: GH₵{deliveryLocation.price.toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Customer Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
            >
              <h2 className="font-display text-lg md:text-2xl font-bold mb-4 md:mb-6 text-[#0A0A0A]">Delivery Details</h2>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Address <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    placeholder="Enter specific address/landmark for easier delivery"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-lg sm:rounded-xl border-2 border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all resize-none text-base"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 mt-4 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white sticky top-16 sm:top-20 md:top-24 shadow-2xl"
            >
              <h2 className="font-display text-xl md:text-2xl font-bold mb-6 text-white">Order Summary</h2>
              <div className="space-y-3 md:space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map((cartItem) => (
                  <div key={cartItem.item.id} className="flex justify-between text-sm md:text-base bg-gray-800/50 p-2 rounded-lg">
                    <span className="text-gray-300 line-clamp-1">
                      {cartItem.item.name} x{cartItem.quantity}
                    </span>
                    <span className="font-bold text-white flex-shrink-0 ml-2">
                      GH₵{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-600 pt-4 md:pt-6 space-y-3 md:space-y-4 mb-6">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="font-bold text-white">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-300">Delivery Fee</span>
                  <span className="font-bold text-white">
                    {deliveryLocation
                      ? `GH₵${deliveryFee.toFixed(2)}`
                      : "Select location"}
                  </span>
                </div>
                <div className="flex justify-between text-2xl md:text-3xl font-black pt-4 md:pt-6 border-t border-gray-600 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-3 rounded-lg">
                  <span className="text-white">Total</span>
                  <span className="text-yellow-300">GH₵{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={!customerName || !customerPhone || !deliveryLocation || items.length === 0}
                className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:shadow-lg disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2 group"
              >
                <Truck size={20} />
                Proceed to Checkout
              </button>
              {(!customerName || !customerPhone || !deliveryLocation) && (
                <p className="text-center text-gray-400 text-xs mt-2 md:mt-3">
                  Please fill in all required fields
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        <PasswordResetModal isOpen={showPasswordReset} onClose={() => setShowPasswordReset(false)} />
        <CreateAccountModal 
          isOpen={showCreateAccount} 
          onClose={() => setShowCreateAccount(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      </div>
    </div>
  );
}
        console.error("Error saving order:", error);
        alert(`Failed to save order: ${error.message}`);
      } else {
        console.log("Order saved successfully:", data);
        // Simulate order processing
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setShowConfirmation(false);
        setOrderPlaced(true);
        clearCart();
      }
    } catch (err) {
      console.error("Error confirming order:", err);
      alert("An error occurred while placing the order");
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-12 px-0 w-full overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check size={48} className="text-white" />
          </motion.div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0A0A] mb-4">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">
            Thank you for your order! We&apos;ll deliver it soon.
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mb-8">
            Total: <span className="font-bold text-[#DC2626]">GH₵{total.toFixed(2)}</span> • Payment on Delivery
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

  // Order Confirmation Modal
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto w-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 my-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="text-blue-600" size={32} />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0A0A0A] mb-2">Order Summary</h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="space-y-2 mb-4">
              {items.map((cartItem) => (
                <div key={cartItem.item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {cartItem.item.name} x{cartItem.quantity}
                  </span>
                  <span className="font-semibold">GH₵{(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span>GH₵{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#DC2626] pt-2">
                <span>Total</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex gap-2 items-start">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">Payment on Delivery</p>
                <p className="text-blue-700 text-xs sm:text-sm">
                  You will pay <span className="font-bold">GH₵{total.toFixed(2)}</span> when your order arrives
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 mb-6">
            <p className="text-xs sm:text-sm text-green-800">
              <span className="font-bold">Delivering to:</span> {deliveryLocation?.name}
            </p>
            <p className="text-xs text-green-700 mt-1">
              <span className="font-semibold">Name:</span> {customerName}
            </p>
            <p className="text-xs text-green-700">
              <span className="font-semibold">Phone:</span> {customerPhone}
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm"
            >
              Back
            </button>
            <button
              onClick={handleConfirmOrder}
              className="flex-1 flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all text-sm"
            >
              <Check size={18} />
              Confirm Order
            </button>
          </div>
        </motion.div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 sm:py-12 px-0">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A0A0A] mb-6 sm:mb-8 text-center"
        >
          Your <span className="text-[#DC2626]">Cart</span>
        </motion.h1>

        {/* User Login Modal & Signup Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            // After login, show cart
            setShowLoginForm(false);
          }}
          onForgotPassword={() => setShowPasswordReset(true)}
          onCreateAccount={() => setShowCreateAccount(true)}
        />

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900">{user.name}</p>
                <p className="text-sm text-green-700">{user.phone}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setShowLoginModal(true);
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
          <div className="md:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6"
            >
              <h2 className="font-display text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">Order Items</h2>
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {items.map((cartItem) => (
                  <div
                    key={cartItem.item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-6 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 hover:border-[#DC2626]/20 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-semibold text-sm sm:text-base md:text-lg text-[#0A0A0A] line-clamp-2 mb-1">
                        {cartItem.item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-1 mb-2">
                        {cartItem.item.description}
                      </p>
                      <p className="text-[#DC2626] font-bold text-sm sm:text-base md:text-lg">
                        GH₵{cartItem.item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <button
                        onClick={() =>
                          updateQuantity(cartItem.item.id, cartItem.quantity - 1)
                        }
                        className="w-8 h-8 sm:w-9 md:w-10 md:h-10 flex items-center justify-center bg-gray-300 hover:bg-gray-400 rounded-full transition-colors flex-shrink-0"
                      >
                        <Minus size={16} className="sm:w-4 md:w-5 md:h-5" />
                      </button>
                      <span className="w-8 sm:w-10 text-center font-bold text-sm sm:text-base md:text-lg flex-shrink-0">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(cartItem.item.id, cartItem.quantity + 1)
                        }
                        className="w-8 h-8 sm:w-9 md:w-10 md:h-10 flex items-center justify-center bg-gray-300 hover:bg-gray-400 rounded-full transition-colors flex-shrink-0"
                      >
                        <Plus size={16} className="sm:w-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(cartItem.item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={20} className="sm:w-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6"
            >
              <h2 className="font-display text-base sm:text-lg md:text-xl font-bold mb-4 sm:mb-5 flex items-center gap-2">
                <MapPin className="text-[#DC2626] flex-shrink-0" size={20} />
                Delivery Location
              </h2>
              
              <div className="mb-4 sm:mb-5">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Search or select your area
                </label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-sm text-left bg-white flex items-center justify-between"
                >
                  <span className={deliveryLocation ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {deliveryLocation ? deliveryLocation.name : "Select delivery area..."}
                  </span>
                  <ChevronDown size={18} className={`text-gray-600 transition-transform flex-shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 sm:mb-5"
                >
                  <input
                    type="text"
                    placeholder="Type to search (e.g., East Legon, Osu)..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-sm placeholder:text-gray-400 mb-3"
                    autoFocus
                  />

                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-xs font-medium text-gray-500 px-1">Popular Areas</p>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-2">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => (
                          <button
                            key={loc.name}
                            onClick={() => {
                              setDeliveryLocation(loc);
                              setSearchLocation("");
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 sm:px-5 md:px-6 py-4 sm:py-4 md:py-5 rounded-lg sm:rounded-xl transition-all text-base md:text-lg font-medium group ${
                              deliveryLocation?.name === loc.name
                                ? "bg-[#DC2626] text-white shadow-lg"
                                : "bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-100"
                            }`}
                          >
                            <span className="truncate flex-1 text-left">{loc.name}</span>
                            <span className="font-semibold flex-shrink-0 ml-3 text-sm sm:text-base">
                              GH₵{loc.price.toFixed(2)}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400 text-sm">No areas found</p>
                          <p className="text-gray-300 text-xs mt-1">Try a different search term</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {deliveryLocation && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border-2 border-green-300 shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-green-900 font-bold text-sm sm:text-base">
                        {deliveryLocation.name}
                      </p>
                      <p className="text-green-700 text-xs sm:text-sm mt-0.5">
                        Delivery fee: <span className="font-semibold">GH₵{deliveryLocation.price.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6"
            >
              <h2 className="font-display text-base sm:text-lg md:text-xl font-bold mb-4 md:mb-6">Your Details</h2>
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl border border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl border border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address (Optional)
                  </label>
                  <textarea
                    placeholder="Enter specific address/landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 rounded-lg sm:rounded-xl border border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all resize-none text-base"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-1 mt-4 md:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0A0A0A] rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 text-white sticky top-16 sm:top-20 md:top-24"
            >
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold mb-6 md:mb-8">Order Summary</h2>
              <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-6 md:mb-8">
                {items.map((cartItem) => (
                  <div key={cartItem.item.id} className="flex justify-between text-sm sm:text-base md:text-lg">
                    <span className="text-gray-300 truncate">
                      {cartItem.item.name} x{cartItem.quantity}
                    </span>
                    <span className="font-semibold flex-shrink-0 ml-3">GH₵{(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-600 pt-4 md:pt-6 space-y-3 sm:space-y-4 md:space-y-5">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-base sm:text-lg font-semibold">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-300">Delivery Fee</span>
                  <span className="text-base sm:text-lg font-semibold">
                    {deliveryLocation
                      ? `GH₵${deliveryFee.toFixed(2)}`
                      : "Select location"}
                  </span>
                </div>
                <div className="flex justify-between text-xl sm:text-2xl md:text-3xl font-bold pt-4 md:pt-6 border-t border-gray-600">
                  <span>Total</span>
                  <span className="text-[#F7D000]">GH₵{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={!customerName || !customerPhone || !deliveryLocation}
                className="w-full mt-3 sm:mt-4 md:mt-6 bg-[#DC2626] hover:bg-[#B91C1C] disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all flex items-center justify-center gap-1 sm:gap-2"
              >
                <Truck size={16} className="sm:w-4 md:w-5 md:h-5" />
                Proceed to Checkout
              </button>
              {(!customerName || !customerPhone || !deliveryLocation) && (
                <p className="text-center text-gray-500 text-xs mt-1.5 sm:mt-2 md:mt-3">
                  Please fill in all required fields
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Password Reset Modal */}
        <PasswordResetModal isOpen={showPasswordReset} onClose={() => setShowPasswordReset(false)} />

        {/* Create Account Modal */}
        <CreateAccountModal 
          isOpen={showCreateAccount} 
          onClose={() => setShowCreateAccount(false)}
          onSuccess={() => {
            // After account creation, user is logged in
            setShowLoginModal(false);
          }}
        />
      </div>
    </div>
  );
}
