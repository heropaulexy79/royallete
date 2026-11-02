'use client';

import React, { createContext, useContext, useState } from 'react';
import { FoodItem, OrderItem } from '@/types/schema';

export interface ItemCustomization {
  summary: string;
  unitPrice: number;
}

interface CartContextType {
  cart: OrderItem[];
  addToCart: (item: FoodItem, quantity?: number, customization?: ItemCustomization) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<OrderItem[]>([]);

  const addToCart = (
    item: FoodItem,
    quantity: number = 1,
    customization?: ItemCustomization
  ) => {
    const lineItemPrice = customization ? customization.unitPrice : item.price;
    const lineItemName = customization ? `${item.name} (${customization.summary})` : item.name;
    const lineItemId = customization
      ? `${item.id}-${customization.summary.replace(/[^a-zA-Z0-9]/g, '_')}`
      : item.id;

    setCart((prev) => {
      const existing = prev.find((i) => i.food_item_id === lineItemId);
      if (existing) {
        return prev.map((i) =>
          i.food_item_id === lineItemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          food_item_id: lineItemId,
          name: lineItemName,
          price: lineItemPrice,
          quantity,
          image_url: item.image_url,
          category: item.category,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.food_item_id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.food_item_id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.food_item_id !== itemId);
    });
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
