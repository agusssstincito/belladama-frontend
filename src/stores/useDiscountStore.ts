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

export interface QuantityDiscount {
  _id: string;
  scope: 'product' | 'category' | 'store';
  productId?: string | { _id: string; name: string; slug: string };
  categoryId?: string | { _id: string; name: string; slug: string };
  minQuantity: number;
  discountType: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
}

export interface AppliedDiscountInfo {
  label: string;
  amount: number;
  expiresAt?: string;
}

interface DiscountState {
  activeDiscounts: StoreDiscount[];
  quantityDiscounts: QuantityDiscount[];
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
  calculateQuantityDiscounts: (items: any[]) => {
    total: number;
    applied: { name: string; benefit: string; amount: number; rule: any }[];
    pending: { name: string; benefit: string; current: number; needed: number; progress: number; rule: any }[];
  };
}

export const useDiscountStore = create<DiscountState>((set, get) => ({
  activeDiscounts: [],
  quantityDiscounts: [],
  isLoading: false,

  fetchActiveDiscounts: async () => {
    set({ isLoading: true });
    try {
      const { cachedGet } = await import("@/lib/api");
      const [storeData, qtyData] = await Promise.all([
        cachedGet("/store-discounts/active", 120), // 2 minutes
        cachedGet("/quantity-discounts/active", 120) // 2 minutes
      ]);
      
      let storeDiscounts = [];
      let quantityDiscounts = [];

      if (storeData.success) storeDiscounts = storeData.data;
      if (qtyData.success) quantityDiscounts = qtyData.data;

      set({ activeDiscounts: storeDiscounts, quantityDiscounts });
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
        expiresAt: product.saleEndsAt
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
  },

  calculateQuantityDiscounts: (items: any[]) => {
    const { quantityDiscounts } = get();
    const applied: { name: string; benefit: string; amount: number; rule: any }[] = [];
    const pending: { name: string; benefit: string; current: number; needed: number; progress: number; rule: any }[] = [];
    let total = 0;

    quantityDiscounts.forEach(rule => {
      let matchingItems = [];
      let totalUnits = 0;
      let targetName = rule.name || "";

      if (rule.scope === 'product') {
        const prodId = typeof rule.productId === 'object' ? rule.productId?._id : rule.productId;
        matchingItems = items.filter(item => (item.product.id || (item.product as any)._id) === prodId);
        if (!targetName) targetName = typeof rule.productId === 'object' ? (rule.productId as any).name : "producto";
      } else if (rule.scope === 'category') {
        const catId = typeof rule.categoryId === 'object' ? rule.categoryId?._id : rule.categoryId;
        matchingItems = items.filter(item => {
          const itemCatId = item.product.category?._id || item.product.category;
          return itemCatId === catId;
        });
        if (!targetName) targetName = typeof rule.categoryId === 'object' ? (rule.categoryId as any).name : "categoría";
      } else if (rule.scope === 'store') {
        matchingItems = items;
        if (!targetName) targetName = "productos en total";
      }

      totalUnits = matchingItems.reduce((acc, item) => acc + item.quantity, 0);
      const subtotalMatching = matchingItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      const benefitStr = rule.discountType === 'percentage' ? `${rule.value}% off` : `$${rule.value} off`;
      const ruleName = rule.name || `${rule.minQuantity}+ ${targetName}`;

      if (totalUnits >= rule.minQuantity) {
        let discountAmount = 0;
        if (rule.discountType === 'percentage') {
          discountAmount = (subtotalMatching * rule.value) / 100;
        } else {
          discountAmount = Math.min(rule.value, subtotalMatching);
        }
        
        applied.push({
          name: ruleName,
          benefit: benefitStr,
          amount: discountAmount,
          rule: rule
        });
        total += discountAmount;
      } else {
        pending.push({
          name: targetName,
          benefit: benefitStr,
          current: totalUnits,
          needed: rule.minQuantity,
          progress: Math.min((totalUnits / rule.minQuantity) * 100, 100),
          rule: rule
        });
      }
    });

    return { applied, pending, total };
  }
}));
