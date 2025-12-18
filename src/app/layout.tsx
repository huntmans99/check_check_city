import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { UserProvider } from "@/lib/user-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Check Check City | Delicious Meals Delivered",
  description: "Looks good, tastes even better. Order your favorite CheckCheck meals for delivery in Accra.",
  icons: {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/LOGO-1765892314660.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden w-screen">
        <UserProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 w-full overflow-x-hidden">{children}</main>
            <Footer />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
