export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  sizes: Size[];
  colors: Color[];
  stock: number;
  reservedStock?: number;
  isNew?: boolean;
  featured?: boolean;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  salePrice?: number;
  saleEndsAt?: string | null;
  isOnSale?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  image: string;
}

export interface Size {
  id: string;
  name: string;
  available: boolean;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  price: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role?: string;
  avatar?: string;
  wishlist?: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: any[];
  total: number;
  pricing: {
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  };
  status: string;
  createdAt: string;
}

export type OrderStatus = "pendiente" | "confirmado" | "listo para retirar" | "entregado" | "cancelado";

export interface WishlistItem {
  product: Product;
  addedAt: string;
}