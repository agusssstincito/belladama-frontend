import { create } from "zustand";
import api from "@/lib/api";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price);
};

export interface StoreDiscount {
  _id: string;
  type: 'category' | 'store';
  categoryId?: string | { _id: string; name: string };
  discountType: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  expiresAt?: string;
}

interface AppliedDiscountInfo {
  label: string;
  amount: number;
  expiresAt?: string;
}

interface DiscountState {
  activeDiscounts: StoreDiscount[];
  isLoading: boolean;
  fetchActiveDiscounts: () => Promise<void>;
  calculateDiscountedPrice: (product: any) => { 
    price: number; 
    originalPrice: number; 
    basePrice: number;
    hasDiscount: boolean;
    hasGlobalDiscount: boolean;
    discountLabel?: string;
    appliedDiscounts: AppliedDiscountInfo[];
  };
}

export const useDiscountStore = create<DiscountState>((set, get) => ({
  activeDiscounts: [],
  isLoading: false,

  fetchActiveDiscounts: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/store-discounts/active");
      if (response.data.success) {
        set({ activeDiscounts: response.data.data });
      }
    } catch (error) {
      console.error("Error fetching active discounts:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  calculateDiscountedPrice: (product: any) => {
    const originalPrice = product.price;
    // Step 1: Base Price (Sale Price takes precedence as base)
    const basePrice = (product.isOnSale && product.salePrice) ? product.salePrice : originalPrice;
    let currentPrice = basePrice;
    
    const { activeDiscounts } = get();
    const appliedDiscounts: AppliedDiscountInfo[] = [];

    // Step 0: Product Sale Price (if applicable)
    if (product.isOnSale && product.salePrice) {
      appliedDiscounts.push({
        label: "Precio oferta",
        amount: originalPrice - product.salePrice,
        expiresAt: product.saleEndsAt // Assuming product might have this already
      });
    }

    // Step 2: Apply Category Discount ON TOP of current price
    const categoryId = (product.category?._id || product.category || "").toString();
    const categoryDiscount = activeDiscounts.find(
      (d) => 
        d.type === 'category' && 
        (typeof d.categoryId === 'object' ? d.categoryId?._id : d.categoryId || "").toString() === categoryId
    );

    if (categoryDiscount) {
      const priceBefore = currentPrice;
      if (categoryDiscount.discountType === 'percentage') {
        currentPrice = currentPrice * (1 - categoryDiscount.value / 100);
      } else {
        currentPrice = Math.max(0, currentPrice - categoryDiscount.value);
      }
      appliedDiscounts.push({
        label: `Descuento ${categoryDiscount.discountType === 'percentage' ? `${categoryDiscount.value}%` : `-$${categoryDiscount.value}`} en ${product.category?.name || 'la categoría'}`,
        amount: priceBefore - currentPrice,
        expiresAt: categoryDiscount.expiresAt
      });
    }

    // Step 3: Apply Store-wide Discount ON TOP of result
    const storeDiscount = activeDiscounts.find((d) => d.type === 'store');
    if (storeDiscount) {
      const priceBefore = currentPrice;
      if (storeDiscount.discountType === 'percentage') {
        currentPrice = currentPrice * (1 - storeDiscount.value / 100);
      } else {
        currentPrice = Math.max(0, currentPrice - storeDiscount.value);
      }
      appliedDiscounts.push({
        label: `Descuento ${storeDiscount.discountType === 'percentage' ? `${storeDiscount.value}%` : `-$${storeDiscount.value}`} en toda la tienda`,
        amount: priceBefore - currentPrice,
        expiresAt: storeDiscount.expiresAt
      });
    }

    // Determine return values for UI
    const hasGlobalDiscount = appliedDiscounts.some(d => d.label !== "Precio oferta");
    const finalPrice = Math.round(currentPrice);

    return {
      price: finalPrice,
      originalPrice,
      basePrice,
      hasDiscount: finalPrice < originalPrice,
      hasGlobalDiscount,
      discountLabel: "OFERTA",
      appliedDiscounts
    };
  }
}));
