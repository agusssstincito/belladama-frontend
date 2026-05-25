import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useDiscountStore } from "./useDiscountStore";
import type { CartItem, Product } from "@/types";

interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minCartTotal: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  refreshPrices: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  getCouponDiscount: () => number;
  getQuantityDiscount: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,

      addItem: (product, size, color, quantity = 1) => {
        const items = get().items;
        const productId = product.id || (product as any)._id;
        
        // Calculate effective price using useDiscountStore logic
        const discountStore = useDiscountStore.getState();
        const { price: effectivePrice } = discountStore.calculateDiscountedPrice(product);

        const existingItem = items.find(
          (item) =>
            (item.product.id || (item.product as any)._id) === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              (item.product.id || (item.product as any)._id) === productId &&
              item.selectedSize === size &&
              item.selectedColor === color
                ? { ...item, quantity: item.quantity + quantity, price: effectivePrice }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { product, quantity, selectedSize: size, selectedColor: color, price: effectivePrice }],
          });
        }
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (item) =>
              !(
                (item.product.id || (item.product as any)._id) === productId &&
                item.selectedSize === size &&
                item.selectedColor === color
              )
          ),
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set({
          items: get().items.map((item) =>
            (item.product.id || (item.product as any)._id) === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      refreshPrices: () => {
        const discountStore = useDiscountStore.getState();
        const items = get().items;
        const updatedItems = items.map(item => {
          const { price } = discountStore.calculateDiscountedPrice(item.product);
          return { ...item, price };
        });
        set({ items: updatedItems });
      },

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      getCouponDiscount: () => {
        const subtotal = get().getTotalPrice();
        const coupon = get().appliedCoupon;
        
        if (!coupon) return 0;
        if (coupon.minCartTotal && subtotal < coupon.minCartTotal) return 0;
        
        if (coupon.type === 'percentage') {
          return (subtotal * coupon.value) / 100;
        } else {
          return Math.min(coupon.value, subtotal);
        }
      },

      getQuantityDiscount: () => {
        const discountStore = useDiscountStore.getState();
        const { totalDiscount } = discountStore.calculateQuantityDiscount(get().items);
        return totalDiscount;
      },

      getFinalTotal: () => {
        const subtotal = get().getTotalPrice();
        const qtyDiscount = get().getQuantityDiscount();
        const couponDiscount = get().getCouponDiscount();
        return Math.max(0, subtotal - qtyDiscount - couponDiscount);
      },
    }),
    { name: "lumiere-cart" }
  )
);