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
  calculateQuantityDiscount: (items: any[]) => {
    totalDiscount: number;
    appliedDiscounts: { label: string; amount: number; discountId: string }[];
    pendingDiscounts: { label: string; needed: number; discountId: string; target: string; value: number; type: string }[];
  };
}

export const useDiscountStore = create<DiscountState>((set, get) => ({
  activeDiscounts: [],
  quantityDiscounts: [],
  isLoading: false,

  fetchActiveDiscounts: async () => {
    set({ isLoading: true });
    try {
      const [storeRes, qtyRes] = await Promise.all([
        api.get("/store-discounts/active"),
        api.get("/quantity-discounts/active")
      ]);
      
      let storeDiscounts = [];
      let quantityDiscounts = [];

      if (storeRes.data.success) storeDiscounts = storeRes.data.data;
      if (qtyRes.data.success) quantityDiscounts = qtyRes.data.data;

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

  calculateQuantityDiscount: (items: any[]) => {
    const { quantityDiscounts } = get();
    const appliedDiscounts: { label: string; amount: number; discountId: string }[] = [];
    const pendingDiscounts: { label: string; needed: number; discountId: string; target: string; value: number; type: string }[] = [];
    let totalDiscount = 0;

    quantityDiscounts.forEach(discount => {
      let matchingItems = [];
      let totalUnits = 0;
      let targetName = "";

      if (discount.scope === 'product') {
        const prodId = typeof discount.productId === 'object' ? discount.productId?._id : discount.productId;
        matchingItems = items.filter(item => (item.product.id || (item.product as any)._id) === prodId);
        targetName = typeof discount.productId === 'object' ? (discount.productId as any).name : "producto";
      } else if (discount.scope === 'category') {
        const catId = typeof discount.categoryId === 'object' ? discount.categoryId?._id : discount.categoryId;
        matchingItems = items.filter(item => (item.product.category?._id || item.product.category) === catId);
        targetName = typeof discount.categoryId === 'object' ? (discount.categoryId as any).name : "categoría";
      } else if (discount.scope === 'store') {
        matchingItems = items;
        targetName = "la tienda";
      }

      totalUnits = matchingItems.reduce((acc, item) => acc + item.quantity, 0);
      const subtotalMatching = matchingItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      if (totalUnits >= discount.minQuantity) {
        let discountAmount = 0;
        if (discount.discountType === 'percentage') {
          discountAmount = (subtotalMatching * discount.value) / 100;
        } else {
          // Fixed amount ($): apply ONCE to the affected subtotal, capped by the subtotal itself
          discountAmount = Math.min(discount.value, subtotalMatching);
        }
        
        totalDiscount += discountAmount;
        const discountStr = discount.discountType === 'percentage' ? `${discount.value}% off` : formatPrice(discount.value) + ' off';
        appliedDiscounts.push({
          label: `✓ ${discountStr} aplicado en ${discount.scope === 'store' ? 'todo el carrito' : targetName}`,
          amount: discountAmount,
          discountId: discount._id
        });
      } else if (totalUnits > 0) {
        const discountStr = discount.discountType === 'percentage' ? `${discount.value}% off` : formatPrice(discount.value) + ' off';
        pendingDiscounts.push({
          label: `Agregá ${discount.minQuantity - totalUnits} productos más ${discount.scope === 'store' ? '' : `de ${targetName} `}y obtenés ${discountStr}${discount.scope === 'store' ? ' en todo' : ''}`,
          needed: discount.minQuantity - totalUnits,
          discountId: discount._id,
          target: targetName,
          value: discount.value,
          type: discount.discountType
        });
      }
    });

    return { totalDiscount, appliedDiscounts, pendingDiscounts };
  }
}));
