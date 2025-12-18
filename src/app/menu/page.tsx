"use client";

import { motion } from "framer-motion";
import { menuItems } from "@/lib/data";
import { MenuCard } from "@/components/MenuCard";

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#0A0A0A] mb-4">
            Our <span className="text-[#DC2626]">Menu</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            All our meals come with our signature CheckCheck Rice, fresh Special Salad Mix, 
            and your choice of portion size.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <MenuCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-[#0A0A0A] rounded-3xl p-8 sm:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
                What&apos;s in Every <span className="text-[#F7D000]">Meal?</span>
              </h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
                  Signature CheckCheck Rice
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
                  Perfectly Grilled Chicken
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
                  Fresh Special Salad Mix
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#DC2626] rounded-full" />
                  Farm Fresh Eggs
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-[#F7D000] rounded-full" />
                  Loaded & Odogwu include Sausage
                </li>
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80"
                alt="Delicious meal"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
