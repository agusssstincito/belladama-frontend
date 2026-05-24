'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, ArrowLeft, Truck, CheckCircle, Clock } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer } from '@/lib/animations'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/types'

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, checkAuth } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated, router, checkAuth])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) return null

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'entregado' as any:
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'listo para retirar' as any:
        return <Package className="w-5 h-5 text-purple-500" />
      case 'confirmado' as any:
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'pendiente' as any:
        return <Clock className="w-5 h-5 text-lumiere-rose" />
      default:
        return <Clock className="w-5 h-5 text-lumiere-muted" />
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pendiente' as any: return 'Pendiente'
      case 'confirmado' as any: return 'Confirmado'
      case 'listo para retirar' as any: return 'Listo para retirar'
      case 'entregado' as any: return 'Entregado'
      case 'cancelado' as any: return 'Cancelado'
      default: return status
    }
  }

  return (
    <main className="min-h-screen bg-lumiere-cream">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-lumiere-muted hover:text-lumiere-charcoal mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mi cuenta
          </Link>
          <h1 className="text-4xl font-heading text-lumiere-charcoal">
            Mis pedidos
          </h1>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-lumiere-warm rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {orders.map((order) => (
              <motion.div
                key={order.id}
                variants={fadeUp}
                className="bg-lumiere-light rounded-3xl p-6 shadow-soft"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-body font-medium text-lumiere-charcoal">
                        Pedido #{order.id.slice(-6)}
                      </p>
                      <p className="text-sm text-lumiere-muted">
                        {new Date(order.createdAt).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-body font-medium text-lumiere-charcoal">
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-sm text-lumiere-muted">
                      {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        order.status === 'entregado'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'confirmado'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'listo para retirar'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-lumiere-warm text-lumiere-muted'
                      }`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center py-12"
          >
            <Package className="w-16 h-16 text-lumiere-muted mx-auto mb-4" />
            <p className="text-lumiere-muted text-lg mb-6">
              Aún no tenés pedidos realizados
            </p>
            <Link href="/products">
              <Button variant="primary">Explorar productos</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  )
}
