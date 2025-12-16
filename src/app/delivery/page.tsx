"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { deliveryLocations } from "@/lib/data";
import { MapPin, Search, Truck } from "lucide-react";
import Link from "next/link";

export default function DeliveryPage() {
  const [search, setSearch] = useState("");

  const filteredLocations = deliveryLocations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedLocations = [...filteredLocations].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DC2626] rounded-2xl mb-4">
            <Truck size={32} className="text-white" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0A0A0A] mb-4">
            Delivery <span className="text-[#DC2626]">Areas</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We deliver across Accra! Find your area below to see the delivery fee. 
            Prices range from GH₵20 to GH₵60 depending on your location.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search your area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 outline-none transition-all shadow-sm"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sortedLocations.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center justify-between p-4 border-b border-r border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-[#DC2626]" />
                  <span className="font-medium text-[#0A0A0A]">{location.name}</span>
                </div>
                <span className="font-bold text-[#DC2626]">
                  GH₵{location.price.toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>

          {sortedLocations.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">No locations found matching &quot;{search}&quot;</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-[#0A0A0A] rounded-3xl p-8 sm:p-12 text-center"
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
            Don&apos;t See Your <span className="text-[#F7D000]">Location?</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            Contact us and we&apos;ll try our best to deliver to you! We&apos;re constantly 
            expanding our delivery areas.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#F7D000] hover:bg-[#E5C200] text-[#0A0A0A] px-8 py-4 rounded-full font-bold transition-all"
          >
            Start Ordering
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
