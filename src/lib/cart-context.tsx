"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { MenuItem, DeliveryLocation } from "./data";

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  deliveryLocation: DeliveryLocation | null;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setDeliveryLocation: (location: DeliveryLocation | null) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("checkcheck_cart");
      const savedLocation = localStorage.getItem("checkcheck_delivery_location");
      
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      if (savedLocation) {
        setDeliveryLocation(JSON.parse(savedLocation));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("checkcheck_cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  // Save delivery location to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      if (deliveryLocation) {
        localStorage.setItem("checkcheck_delivery_location", JSON.stringify(deliveryLocation));
      } else {
        localStorage.removeItem("checkcheck_delivery_location");
      }
    }
  }, [deliveryLocation, isHydrated]);

  const addItem = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.item.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setDeliveryLocation(null);
    localStorage.removeItem("checkcheck_cart");
    localStorage.removeItem("checkcheck_delivery_location");
  };

  const subtotal = items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const deliveryFee = deliveryLocation?.price ?? 0;
  const total = subtotal + deliveryFee;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        deliveryLocation,
        addItem,
        removeItem,
        updateQuantity,
        setDeliveryLocation,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
