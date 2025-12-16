import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/LOGO-1765892314660.jpeg?width=8000&height=8000&resize=contain"
              alt="Check Check City"
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm">
              Looks good, tastes even better...
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-[#F7D000] mb-4">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-gray-400 hover:text-[#F7D000] transition-colors">
                Home
              </Link>
              <Link href="/menu" className="text-gray-400 hover:text-[#F7D000] transition-colors">
                Menu
              </Link>
              <Link href="/delivery" className="text-gray-400 hover:text-[#F7D000] transition-colors">
                Delivery Areas
              </Link>
              <Link href="/cart" className="text-gray-400 hover:text-[#F7D000] transition-colors">
                Cart
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-[#F7D000] mb-4">
              Contact
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin size={18} className="text-[#DC2626]" />
                <span>Accra, Ghana</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone size={18} className="text-[#DC2626]" />
                <span>+233 XX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Clock size={18} className="text-[#DC2626]" />
                <span>Open Daily</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#262626] mt-8 pt-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Check Check City. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
