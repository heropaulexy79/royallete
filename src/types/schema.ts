export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'assigned' | 'delivered';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin' | 'rider';
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  restaurant_id: string;
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
  address: string;
  items: OrderItem[];
  status: OrderStatus;
  total_price: number;
  payment_method: 'cod' | 'paystack';
  payment_status: 'pending' | 'paid';
  created_at: any; // Firestore Timestamp
  rider_id?: string;
  rider_name?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  is_available: boolean;
}
