export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin';
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url: string;
  is_available: boolean;
  restaurant_id?: string;
}

export interface OrderItem {
  food_item_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  customer_name: string;
  phone: string;
  order_notes?: string;
  items: OrderItem[];
  status: OrderStatus;
  total_price: number;
  payment_method: 'whatsapp';
  created_at: any; // Firestore Timestamp
}
