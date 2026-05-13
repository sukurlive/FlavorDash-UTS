export type Category = {
  id: number;
  uuid: string;
  name: string;
  icon: string;
};

export type Product = {
  id: number;
  uuid: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock?: number;
  is_available?: boolean;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
};

export type User = {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
};

export type CartItem = {
  productId: number;
  quantity: number;
  product: Product;
  subtotal: number;
};

export type Order = {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  item_count: number;
};