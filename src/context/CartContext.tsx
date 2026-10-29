'use client';

import React, { createContext, useContext, useState } from 'react';
import { FoodItem, OrderItem } from '@/types/schema';

interface CartContextType {
  cart: OrderItem[];
   addToCart: (item: FoodItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<OrderItem[]>([]);

  const addToCart = (item: FoodItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.food_item_id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.food_item_id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { food_item_id: item.id, name: item.name, price: item.price, quantity }];
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
