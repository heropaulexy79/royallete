export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type ProductCategory =
  | 'Shawarma'
  | 'Pizza'
  | 'Burger'
  | 'Chicken & Chips'
  | 'Food'
  | 'Drinks'
  | 'Ice Cream'
  | 'Snacks';

export const APPROVED_CATEGORIES: ProductCategory[] = [
  'Shawarma',
  'Pizza',
  'Burger',
  'Chicken & Chips',
  'Food',
  'Drinks',
  'Ice Cream',
  'Snacks',
];

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
  is_featured?: boolean;
}

export interface OrderItem {
  food_item_id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
  category?: string;
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
  created_at?: unknown; // Firestore Timestamp
}
