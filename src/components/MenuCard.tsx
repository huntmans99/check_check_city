"use client";

import { MenuItem } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import { Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface MenuCardProps {
  item: MenuItem;
  index?: number;
}

export function MenuCard({ item, index = 0 }: MenuCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="inline-block bg-[#F7D000] text-[#0A0A0A] text-xs font-bold px-3 py-1 rounded-full">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-xl font-bold text-[#0A0A0A]">
            {item.name}
          </h3>
          <span className="text-[#DC2626] font-bold text-lg whitespace-nowrap">
            GH₵{item.price}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>

        <button
          onClick={handleAdd}
          disabled={added}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
            added
              ? "bg-green-500 text-white"
              : "bg-[#DC2626] hover:bg-[#B91C1C] text-white"
          }`}
        >
          {added ? (
            <>
              <Check size={20} />
              Added!
            </>
          ) : (
            <>
              <Plus size={20} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
