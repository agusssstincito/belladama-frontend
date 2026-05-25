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
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    getCouponDiscount,
    getFinalTotal, 
    refreshPrices 
  } = useCartStore();
  const { fetchActiveDiscounts, calculateQuantityDiscount } = useDiscountStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);

  const subtotal = getTotalPrice();
  const qtyDiscount = getQuantityDiscount();
  const couponDiscount = getCouponDiscount();
  const finalTotal = getFinalTotal();
  const isCouponValid = !appliedCoupon || !appliedCoupon.minCartTotal || subtotal >= appliedCoupon.minCartTotal;

  const { appliedDiscounts, pendingDiscounts } = calculateQuantityDiscount(items);

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
      const res = await api.post("/coupons/validate", { code: couponInput.toUpperCase(), cartTotal: subtotal });
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
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white border-l-2 border-lumiere-warm shadow-soft-lg"
          >
            <div className="flex h-20 items-center justify-between border-b border-lumiere-warm px-6">
              <h2 className="font-heading text-xl font-bold">Tu carrito</h2>
              <button
                onClick={closeCart}
                className="rounded-full p-2 text-lumiere-charcoal hover:bg-lumiere-warm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex h-[calc(100%-5rem)] flex-col items-center justify-center px-6">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-lumiere-warm">
                  <ShoppingBag className="h-12 w-12 text-lumiere-muted" />
                </div>
                <h3 className="mb-2 font-heading text-xl">Tu carrito está vacío</h3>
                <p className="mb-8 text-center text-lumiere-muted">
                  Explora nuestra colección y encuentra tu próximo favorito.
                </p>
                <Button onClick={closeCart} variant="primary">
                  <Link href="/products">Explorar colección</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="h-[calc(100%-18rem)] space-y-4 overflow-y-auto p-6">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={`${item.product.id || (item.product as any)._id}-${item.selectedSize}-${item.selectedColor}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 rounded-2xl bg-lumiere-warm p-4"
                      >
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
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-lumiere-light text-lumiere-charcoal hover:bg-lumiere-cream"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center font-medium">
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
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-lumiere-light text-lumiere-charcoal hover:bg-lumiere-cream"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                              <div className="flex flex-col items-end">
                                <p className="font-medium text-lumiere-charcoal">
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

                        <button
                          onClick={() =>
                            removeItem(
                              item.product.id || (item.product as any)._id,
                              item.selectedSize,
                              item.selectedColor
                            )
                          }
                          className="self-start text-lumiere-muted hover:text-lumiere-rose"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Progressive Messages */}
                {(appliedDiscounts.length > 0 || pendingDiscounts.length > 0) && (
                  <div className="px-6 py-2 space-y-2">
                    {appliedDiscounts.map((disc) => (
                      <motion.div
                        key={disc.discountId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between rounded-xl bg-green-50 p-2.5 border border-green-100"
                      >
                        <div className="flex items-center gap-2 text-green-700 text-xs font-medium">
                          <Check className="h-3.5 w-3.5" />
                          <span>{disc.label}</span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {pendingDiscounts
                      .filter(disc => !dismissedMessages.includes(disc.discountId))
                      .map((disc) => (
                      <motion.div
                        key={disc.discountId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between rounded-xl bg-[#FFF0F5] p-2.5 border border-[#D4537E]/10"
                      >
                        <div className="flex items-center gap-2 text-[#D4537E] text-xs font-medium">
                          <span>{disc.label}</span>
                        </div>
                        <button 
                          onClick={() => setDismissedMessages([...dismissedMessages, disc.discountId])}
                          className="text-[#D4537E]/60 hover:text-[#D4537E]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 border-t border-lumiere-warm bg-lumiere-light p-6">
                  {/* Coupon Section */}
                  {!appliedCoupon ? (
                    <div className="mb-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-lumiere-muted" />
                          <input
                            type="text"
                            placeholder="Tenés un cupón?"
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            className="w-full rounded-xl border border-lumiere-warm bg-white pl-9 pr-3 py-2 text-sm focus:border-[#D4537E] focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponInput.trim()}
                          className="rounded-xl bg-[#D4537E] px-4 py-2 text-sm font-medium text-white hover:bg-[#c04570] disabled:opacity-50 transition-colors"
                        >
                          {couponLoading ? "..." : "Aplicar"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="mt-1.5 text-xs text-red-500">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className={`mb-3 rounded-xl border px-3 py-2 ${isCouponValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCouponValid ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Tag className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${isCouponValid ? 'text-green-700' : 'text-red-700'}`}>
                            {appliedCoupon.code}
                          </span>
                          {isCouponValid && (
                            <span className="text-xs text-green-600">
                              −{formatPrice(couponDiscount)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-medium text-red-500 hover:text-red-700"
                        >
                          Quitar
                        </button>
                      </div>
                      {!isCouponValid && appliedCoupon.minCartTotal && (
                        <p className="mt-1 text-[10px] text-red-600 font-medium">
                          El cupón requiere un mínimo de {formatPrice(appliedCoupon.minCartTotal ?? 0)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mb-1 flex items-center justify-between text-sm text-lumiere-muted">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {qtyDiscount > 0 && (
                    <div className="mb-1 flex items-center justify-between text-sm text-green-600">
                      <span>Descuento por cantidad</span>
                      <span>−{formatPrice(qtyDiscount)}</span>
                    </div>
                  )}
                  {appliedCoupon && isCouponValid && (
                    <div className="mb-1 flex items-center justify-between text-sm text-green-600">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>−{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium text-lumiere-charcoal">Total</span>
                    <span className="font-heading text-xl font-bold text-lumiere-rose">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>

                  <Link href="/checkout" onClick={closeCart}>
                    <Button variant="primary" className="w-full">
                      Ir al checkout
                    </Button>
                  </Link>

                  <button
                    onClick={closeCart}
                    className="mt-3 w-full rounded-2xl border-2 border-lumiere-warm py-3 text-center font-medium text-lumiere-charcoal hover:bg-lumiere-warm"
                  >
                    Continuar comprando
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}