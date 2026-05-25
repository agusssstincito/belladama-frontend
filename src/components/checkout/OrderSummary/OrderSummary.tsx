'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import type { CartItem } from '@/types'

interface OrderSummaryProps {
  items?: CartItem[]
  subtotal: number
  couponDiscount?: number
  couponCode?: string
}

export default function OrderSummary({ items: propItems, subtotal, couponDiscount = 0, couponCode }: OrderSummaryProps) {
  const { items: cartItems, getTotalPrice, getQuantityDiscount } = useCartStore()
  const items = propItems || cartItems
  const effectiveSubtotal = propItems ? subtotal : getTotalPrice()
  const qtyDiscount = propItems ? 0 : getQuantityDiscount() // We assume propItems means we're in a state where we pass subtotal explicitly
  const total = Math.max(0, effectiveSubtotal - qtyDiscount - couponDiscount)

  return (
    <div className="bg-lumiere-warm rounded-3xl p-6 space-y-6">
      <h2 className="font-heading text-xl text-lumiere-charcoal">Resumen del pedido</h2>

      <div className="space-y-4 max-h-64 overflow-y-auto">
        {items.map((item, idx) => (
          <div key={`${item.product.id || (item.product as any)._id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="flex gap-3">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-lumiere-light flex-shrink-0">
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
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm text-lumiere-charcoal line-clamp-1">
                {item.product.name}
              </p>
              <p className="text-xs text-lumiere-muted mt-0.5">
                Color: {item.selectedColor}
              </p>
              {item.selectedSize && item.selectedSize !== 'U' && (
                <p className="text-[10px] text-lumiere-muted/70">
                  Talla: {item.selectedSize}
                </p>
              )}
              <p className="text-sm font-body text-lumiere-rose mt-1">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
            <div className="text-sm text-lumiere-muted">x{item.quantity}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-lumiere-muted/20">
        <div className="flex justify-between text-lumiere-muted">
          <span>Subtotal</span>
          <span>{formatPrice(effectiveSubtotal)}</span>
        </div>
        {qtyDiscount > 0 && (
          <div className="flex justify-between text-green-600 text-sm">
            <span>Descuento por cantidad</span>
            <span>−{formatPrice(qtyDiscount)}</span>
          </div>
        )}
        {couponDiscount > 0 && couponCode && (
          <div className="flex justify-between text-green-600 text-sm">
            <span>Cupón ({couponCode})</span>
            <span>−{formatPrice(couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between font-heading text-lg text-lumiere-charcoal pt-3 border-t border-lumiere-muted/20">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
