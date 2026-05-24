'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cartStore'
import CheckoutForm from '@/components/checkout/CheckoutForm/CheckoutForm'
import OrderSummary from '@/components/checkout/OrderSummary/OrderSummary'
import { fadeUp } from '@/lib/animations'
import api from '@/lib/api'
import type { CheckoutInput } from '@/lib/validations'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, getCouponDiscount, clearCart, appliedCoupon } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/products')
    }
  }, [items.length, router])

  const handleCheckout = async (formData: CheckoutInput) => {
    setIsProcessing(true)
    try {
      const subtotal = getTotalPrice()
      const couponDiscount = getCouponDiscount()
      const total = Math.max(0, subtotal - couponDiscount)

      // 1. Save order to database
      await api.post('/orders', {
        customer: { name: formData.name, email: formData.email, phone: formData.phone },
        items: items.map(item => ({
          product: item.product.id || (item.product as any)._id,
          name: item.product.name,
          image: typeof item.product.images?.[0] === 'object' ? (item.product.images[0] as any).url : item.product.images?.[0],
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity
        })),
        pricing: { subtotal, shipping: 0, discount: couponDiscount, total },
        couponCode: appliedCoupon?.code || null,
      })

      // 2. Build WhatsApp message
      const productLines = items
        .map(
          (item) => {
            const hasDiscount = item.price < item.product.price;
            const priceStr = `$${(item.price * item.quantity).toLocaleString('es-AR')}`;
            const discountInfo = hasDiscount ? ` (antes $${(item.product.price * item.quantity).toLocaleString('es-AR')})` : '';
            return `- ${item.quantity}x ${item.product.name} (Color: ${item.selectedColor}) ${priceStr}${discountInfo}`;
          }
        )
        .join('\n')

      const couponLine = appliedCoupon 
        ? `\n*Cupón:* ${appliedCoupon.code} → −$${couponDiscount.toLocaleString('es-AR')}` 
        : ''

      const message = `🛍️ *Nuevo pedido - Bella Dama*

*Productos:*
${productLines}

*Subtotal:* $${subtotal.toLocaleString('es-AR')}${couponLine}
*Total: $${total.toLocaleString('es-AR')}*

*Cliente:* ${formData.name}
*Teléfono:* ${formData.phone}

_El local se comunicará para coordinar la entrega._`

      const whatsappUrl = `https://wa.me/5492613633020?text=${encodeURIComponent(message)}`

      // 3. Open WhatsApp
      window.open(whatsappUrl, '_blank')

      // 4. Clear cart
      clearCart()

      // 5. Redirect to confirmation
      router.push('/checkout/confirmacion')
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error al procesar el pedido. Intentá nuevamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null
  }

  const subtotal = getTotalPrice()
  const couponDiscount = getCouponDiscount()
  const total = Math.max(0, subtotal - couponDiscount)

  return (
    <main className="min-h-screen bg-lumiere-cream">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-4xl md:text-5xl font-heading text-lumiere-charcoal mb-8"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-8"
          >
            <div className="bg-lumiere-light rounded-3xl p-6 md:p-8">
              <CheckoutForm onSubmit={handleCheckout} isProcessing={isProcessing} />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-4"
          >
            <div className="sticky top-24">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                couponDiscount={couponDiscount}
                couponCode={appliedCoupon?.code}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
