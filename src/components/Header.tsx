"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/LOGO-1765892314660.jpeg?width=8000&height=8000&resize=contain"
              alt="Check Check City"
              className="h-12 md:h-14 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-white hover:text-[#F7D000] transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="text-white hover:text-[#F7D000] transition-colors font-medium"
            >
              Menu
            </Link>
            <Link
              href="/delivery"
              className="text-white hover:text-[#F7D000] transition-colors font-medium"
            >
              Delivery Areas
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 py-2 rounded-full transition-all font-medium"
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F7D000] text-[#0A0A0A] text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A0A0A] border-t border-[#262626]"
          >
            <nav className="flex flex-col px-4 py-4 gap-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-[#F7D000] transition-colors font-medium py-2"
              >
                Home
              </Link>
              <Link
                href="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-[#F7D000] transition-colors font-medium py-2"
              >
                Menu
              </Link>
              <Link
                href="/delivery"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-[#F7D000] transition-colors font-medium py-2"
              >
                Delivery Areas
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
