import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useDiscountStore } from "./useDiscountStore";
import type { CartItem, Product } from "@/types";

interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minCartTotal: number;
  combinable?: boolean;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupons: AppliedCoupon[];
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
  removeCoupon: (code: string) => void;
  getCouponDiscount: () => number;
  getQuantityDiscount: () => number;
  getFinalTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupons: [],

      addItem: (product, size, color, quantity = 1) => {
        const items = get().items;
        const productId = product.id || (product as any)._id;
        
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

      clearCart: () => set({ items: [], appliedCoupons: [] }),
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

      applyCoupon: (coupon) => {
        const current = get().appliedCoupons;
        // The controller already validates duplicates and combinable, 
        // but we double check here just in case.
        if (current.find(c => c.code === coupon.code)) return;
        set({ appliedCoupons: [...current, coupon] });
      },

      removeCoupon: (code) => {
        set({ 
          appliedCoupons: get().appliedCoupons.filter(c => c.code !== code) 
        });
      },

      getCouponDiscount: () => {
        const subtotal = get().getTotalPrice();
        const qtyDiscount = get().getQuantityDiscount();
        // Base for coupons is subtotal after quantity discounts
        const baseSubtotal = Math.max(0, subtotal - qtyDiscount);
        
        const coupons = get().appliedCoupons;
        if (coupons.length === 0) return 0;
        
        // Simpler approach: all apply to the same base
        let totalDiscount = 0;
        coupons.forEach(coupon => {
          if (coupon.minCartTotal && subtotal < coupon.minCartTotal) return;
          
          if (coupon.type === 'percentage') {
            totalDiscount += (baseSubtotal * coupon.value) / 100;
          } else {
            totalDiscount += coupon.value;
          }
        });
        
        return Math.min(totalDiscount, baseSubtotal);
      },

      getQuantityDiscount: () => {
        const discountStore = useDiscountStore.getState();
        const { total } = discountStore.calculateQuantityDiscounts(get().items);
        return total;
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