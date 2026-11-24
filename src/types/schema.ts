export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type ProductCategory =
  | 'Shawarma'
  | 'Pizza'
  | 'Burger'
  | 'Chicken & Chips'
  | 'Food'
  | 'Drinks'
  | 'Ice Cream'
  | 'Snacks'
  | (string & {});

export const APPROVED_CATEGORIES: string[] = [
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

export interface CategoryMeta {
  id: string; // usually slugified category name, e.g. "shawarma"
  name: string; // display name e.g. "Shawarma"
  image_url?: string;
  tag?: string;
  order_index?: number;
  created_at?: string;
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
  order_index?: number;
  is_configurable?: boolean;
  configurator_type?: 'shawarma' | 'pizza';
  pizza_size?: 'mini' | 'small' | 'medium';
  shawarma_type?: 'no_hotdog' | 'single_hotdog' | 'double_hotdog';
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
  order_number?: number;
  customer_name: string;
  phone: string;
  order_notes?: string;
  items: OrderItem[];
  status: OrderStatus;
  total_price: number;
  payment_method: 'whatsapp';
  created_at?: unknown; // Firestore Timestamp
}

export interface Review {
  id?: string;
  order_id?: string;
  order_number?: number;
  customer_name: string;
  phone?: string;
  rating: number;
  comment: string;
  show_on_homepage?: boolean;
  created_at?: unknown; // Firestore Timestamp
}
