'use client'

import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'

export default function CartSummary() {
  const { items, getTotalPrice } = useCartStore()
  const subtotal = getTotalPrice()
  const totalAmount = subtotal

  return (
    <div className="bg-lumiere-warm rounded-3xl p-6 space-y-4">
      <h3 className="font-heading text-xl text-lumiere-charcoal">Resumen</h3>

      <div className="space-y-2">
        <div className="flex justify-between text-lumiere-muted">
          <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="border-t border-lumiere-muted/20 pt-2">
          <div className="flex justify-between font-heading text-lg text-lumiere-charcoal">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
