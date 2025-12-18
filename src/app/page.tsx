"use client";

import Link from "next/link";
import { ArrowRight, Truck, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import { menuItems } from "@/lib/data";
import { MenuCard } from "@/components/MenuCard";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block bg-[#F7D000] text-[#0A0A0A] text-sm font-bold px-4 py-2 rounded-full mb-6">
              Now Delivering Across Accra
            </span>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Looks Good,
              <br />
              <span className="text-[#F7D000]">Tastes Even Better</span>
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl mb-8 max-w-xl">
              Experience the irresistible flavors of Check Check City. Our signature 
              rice meals, with perfectly grilled chicken await you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all group"
              >
                Order Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/delivery"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-semibold text-lg transition-all"
              >
                View Delivery Areas
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "Quick delivery across all areas in Accra" },
              { icon: Clock, title: "Fresh & Hot", desc: "Your meal arrives fresh and ready to eat" },
              { icon: Star, title: "Quality Meals", desc: "Made with premium ingredients every time" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-[#DC2626] rounded-xl flex items-center justify-center">
                  <feature.icon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#0A0A0A] mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
              Our <span className="text-[#DC2626]">Menu</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our delicious meal options, each packed with our signature CheckCheck rice, 
              perfectly grilled chicken, and fresh salad mix.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {menuItems.map((item, index) => (
              <MenuCard key={item.id} item={item} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-[#DC2626] hover:text-[#B91C1C] font-semibold transition-colors"
            >
              View Full Menu
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to <span className="text-[#F7D000]">Order?</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Get your favorite Check Check City meals delivered right to your doorstep. 
              We deliver across Accra with affordable delivery fees.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 bg-[#F7D000] hover:bg-[#E5C200] text-[#0A0A0A] px-10 py-4 rounded-full font-bold text-lg transition-all"
            >
              Start Your Order
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
