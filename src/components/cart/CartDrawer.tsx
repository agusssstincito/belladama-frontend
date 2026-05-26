"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, Check, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";
import { useDiscountStore } from "@/stores/useDiscountStore";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import api from "@/lib/api";

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getTotalPrice, 
    getQuantityDiscount,
    appliedCoupons, 
    applyCoupon, 
    removeCoupon, 
    getCouponDiscount,
    getFinalTotal, 
    refreshPrices 
  } = useCartStore();
  const { fetchActiveDiscounts, calculateQuantityDiscounts, quantityDiscounts } = useDiscountStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const subtotal = getTotalPrice();
  const qtyDiscount = getQuantityDiscount();
  const couponDiscount = getCouponDiscount();
  const finalTotal = getFinalTotal();

  const { applied, pending } = calculateQuantityDiscounts(items);

  // Refresh prices and discounts whenever the cart opens
  useEffect(() => {
    if (isOpen) {
      refreshPrices();
      fetchActiveDiscounts();
    }
  }, [isOpen, refreshPrices, fetchActiveDiscounts]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await api.post("/coupons/validate", { 
        code: couponInput.toUpperCase(), 
        currentCoupons: appliedCoupons.map(c => c.code),
        cartTotal: Math.max(0, subtotal - qtyDiscount)
      });
      if (res.data.valid) {
        applyCoupon(res.data.data);
        setCouponInput("");
      } else {
        setCouponError(res.data.message || "Código inválido");
      }
    } catch {
      setCouponError("Error al verificar cupón");
    } finally {
      setCouponLoading(false);
    }
  };

  const getItemMotivation = (item: any) => {
    const isProductApplied = applied.some(a => 
      a.rule.scope === 'product' && 
      (a.rule.productId?._id || a.rule.productId) === (item.product.id || item.product._id)
    );
    if (isProductApplied) return { text: "✓ Descuento aplicado", color: "text-green-600" };

    const productPending = pending.find(p => 
      p.rule.scope === 'product' && 
      (p.rule.productId?._id || p.rule.productId) === (item.product.id || item.product._id)
    );

    if (productPending) {
      return { 
        text: `➕ Agregá ${productPending.needed - productPending.current} más → ${productPending.benefit} en este producto`,
        color: "text-[#D4537E]"
      };
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-lumiere-charcoal/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white border-l-2 border-lumiere-warm shadow-soft-lg flex flex-col"
          >
            <div className="flex h-20 items-center justify-between border-b border-lumiere-warm px-6 flex-shrink-0">
              <h2 className="font-heading text-xl font-bold">Tu carrito</h2>
              <button
                onClick={closeCart}
                className="rounded-full p-2 text-lumiere-charcoal hover:bg-lumiere-warm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-lumiere-warm">
                    <ShoppingBag className="h-12 w-12 text-lumiere-muted" />
                  </div>
                  <h3 className="mb-2 font-heading text-xl">Tu carrito está vacío</h3>
                  <p className="mb-8 text-lumiere-muted">
                    Explora nuestra colección y encuentra tu próximo favorito.
                  </p>
                  <Button onClick={closeCart} variant="primary">
                    <Link href="/products">Explorar colección</Link>
                  </Button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => {
                    const motivation = getItemMotivation(item);
                    return (
                      <motion.div
                        key={`${item.product.id || (item.product as any)._id}-${item.selectedSize}-${item.selectedColor}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-3 rounded-2xl bg-lumiere-warm p-4"
                      >
                        <div className="flex gap-4">
                          <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                            <Image
                              src={(() => {
                                const img = item.product.images?.[0];
                                const src = typeof img === 'object' ? (img as any).url : img;
                                return src?.startsWith('/') || src?.startsWith('http') || src?.startsWith('data:') ? src : '/placeholder.jpg';
                              })()}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lumiere-charcoal line-clamp-1">
                                  {item.product.name}
                                </h3>
                                <p className="text-sm text-lumiere-muted mt-0.5">
                                  Color: {item.selectedColor}
                                </p>
                                {item.selectedSize && item.selectedSize !== 'U' && (
                                  <p className="text-xs text-lumiere-muted/70">
                                    Talla: {item.selectedSize}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  removeItem(
                                    item.product.id || (item.product as any)._id,
                                    item.selectedSize,
                                    item.selectedColor
                                  )
                                }
                                className="text-lumiere-muted hover:text-lumiere-rose transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id || (item.product as any)._id,
                                      item.selectedSize,
                                      item.selectedColor,
                                      item.quantity - 1
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-lumiere-light text-lumiere-charcoal hover:bg-white shadow-sm"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.product.id || (item.product as any)._id,
                                      item.selectedSize,
                                      item.selectedColor,
                                      item.quantity + 1
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-lumiere-light text-lumiere-charcoal hover:bg-white shadow-sm"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                                <div className="flex flex-col items-end">
                                  <p className="font-semibold text-lumiere-charcoal text-sm">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                  {item.price < item.product.price && (
                                    <p className="text-[10px] text-lumiere-muted line-through">
                                      {formatPrice(item.product.price * item.quantity)}
                                    </p>
                                  )}
                                </div>
                            </div>
                          </div>
                        </div>
                        
                        {motivation && (
                          <div className={`mt-1 self-start rounded-full bg-white px-3 py-1 text-[11px] font-medium border border-[#F2C4D8] ${motivation.color}`}>
                            {motivation.text}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            <div className="border-t border-lumiere-warm bg-lumiere-light p-6 space-y-4 flex-shrink-0">
              {/* Quantity Discounts Breakdown */}
              {(applied.length > 0 || pending.length > 0) && (
                <div>
                   <button 
                    onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#F2C4D8] bg-white p-3 text-sm transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏷️</span>
                      <span className="font-medium text-lumiere-charcoal">Descuentos por cantidad</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {qtyDiscount > 0 && (
                        <span className="font-bold text-green-600">-{formatPrice(qtyDiscount)}</span>
                      )}
                      <span className="text-[10px] font-bold uppercase text-[#D4537E] flex items-center gap-1">
                        {isBreakdownOpen ? 'ocultar ▲' : 'ver detalle ▼'}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isBreakdownOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-3 rounded-xl border border-[#F2C4D8] bg-white p-3">
                          {applied.map((disc, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] leading-tight">
                              <span className="text-green-600 font-bold">✓ {disc.name} → {disc.benefit}</span>
                              <span className="text-green-600 font-bold whitespace-nowrap">-{formatPrice(disc.amount)}</span>
                            </div>
                          ))}
                          
                          {pending.length > 0 && (
                            <div className="space-y-3 pt-1 border-t border-[#F2C4D8]/30 mt-1">
                              <p className="text-[10px] font-bold uppercase text-[#9C6B85]">Próximos descuentos:</p>
                              {pending.map((disc, idx) => (
                                <div key={idx} className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px] text-[#9C6B85] leading-tight font-medium">
                                    <span>○ Llevá {disc.needed - disc.current} más de {disc.name} → {disc.benefit}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 flex-1 rounded-full bg-lumiere-warm overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${disc.progress}%` }}
                                        className="h-full bg-[#D4537E]/40" 
                                      />
                                    </div>
                                    <span className="text-[9px] font-bold text-[#9C6B85]">
                                      {disc.current}/{disc.needed}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Multi-Coupon Section */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-lumiere-muted" />
                    <input
                      type="text"
                      placeholder="Tenés un cupón?"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      className="w-full rounded-xl border border-lumiere-warm bg-white pl-9 pr-3 py-2 text-sm focus:border-[#D4537E] focus:outline-none placeholder:text-lumiere-muted/50"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="rounded-xl bg-lumiere-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 transition-colors"
                  >
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>

                {appliedCoupons.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {appliedCoupons.map((coupon) => {
                      const baseSubtotal = Math.max(0, subtotal - qtyDiscount);
                      const discountAmount = coupon.type === 'percentage' 
                        ? (baseSubtotal * coupon.value) / 100 
                        : coupon.value;
                      const isValid = !coupon.minCartTotal || subtotal >= coupon.minCartTotal;

                      return (
                        <div 
                          key={coupon.code} 
                          className={`flex items-center gap-2 rounded-full px-3 py-1.5 border text-xs font-bold transition-all ${isValid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                        >
                          <span>{coupon.code}</span>
                          {isValid && <span>-{formatPrice(discountAmount)}</span>}
                          <button 
                            onClick={() => removeCoupon(coupon.code)}
                            className="ml-1 hover:opacity-70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {couponError && (
                  <p className="text-xs text-red-500 font-medium px-1">{couponError}</p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-sm text-lumiere-muted">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                {qtyDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600 font-medium">
                    <span>Descuentos por cantidad</span>
                    <span>−{formatPrice(qtyDiscount)}</span>
                  </div>
                )}
                
                {appliedCoupons.map(coupon => {
                  const baseSubtotal = Math.max(0, subtotal - qtyDiscount);
                  const amount = coupon.type === 'percentage' ? (baseSubtotal * coupon.value) / 100 : coupon.value;
                  const isValid = !coupon.minCartTotal || subtotal >= coupon.minCartTotal;
                  if (!isValid) return null;

                  return (
                    <div key={coupon.code} className="flex items-center justify-between text-sm text-green-600 font-medium">
                      <span>Cupón {coupon.code}</span>
                      <span>−{formatPrice(amount)}</span>
                    </div>
                  );
                })}
                
                <div className="flex items-center justify-between border-t border-lumiere-warm pt-3 mt-2">
                  <span className="font-bold text-lumiere-charcoal">Total</span>
                  <span className="font-heading text-2xl font-bold text-lumiere-rose">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Link href="/checkout" onClick={closeCart}>
                  <Button variant="primary" className="w-full py-6 text-base shadow-glow shadow-[#D4537E]/20">
                    Ir al checkout
                  </Button>
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm font-medium text-lumiere-charcoal/60 hover:text-lumiere-charcoal transition-colors"
                >
                  Continuar comprando
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}