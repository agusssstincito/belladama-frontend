'use client'

import { useState, useEffect } from 'react'
import { Package, ChevronDown, RefreshCw, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  name: string
  color?: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface Order {
  _id: string
  orderNumber: string
  customer: { name: string; email: string; phone: string }
  items: OrderItem[]
  pricing: { subtotal: number; shipping: number; total: number }
  shippingAddress: { street: string; city: string; province: string; postalCode: string }
  status: string
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  confirmado: { label: 'Confirmado', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'listo para retirar': { label: 'Listo para retirar', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  entregado: { label: 'Entregado', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
}

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Modal states
  const [modalType, setModalType] = useState<'status' | 'delete' | null>(null)
  const [targetOrder, setTargetOrder] = useState<Order | null>(null)
  const [nextStatus, setNextStatus] = useState<string>('')

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/admin/pedidos')
      setOrders(response.data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      await api.put(`/admin/pedidos/${orderId}/status`, { status: newStatus })
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await api.delete(`/admin/pedidos/${orderId}`)
      setOrders((prev) => prev.filter((o) => o._id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Error al eliminar el pedido')
    }
  }

  const promptStatusChange = (order: Order, status: string) => {
    setTargetOrder(order)
    setNextStatus(status)
    setModalType('status')
  }

  const promptDeleteOrder = (order: Order) => {
    setTargetOrder(order)
    setModalType('delete')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pendiente':
        return (
          <>
            <option value="pendiente">⏳ Pendiente</option>
            <option value="confirmado">✅ Confirmado</option>
            <option value="cancelado">❌ Cancelado</option>
          </>
        )
      case 'confirmado':
        return (
          <>
            <option value="confirmado">✅ Confirmado</option>
            <option value="listo para retirar">📦 Listo para retirar</option>
            <option value="cancelado">❌ Cancelado</option>
          </>
        )
      case 'listo para retirar':
        return (
          <>
            <option value="listo para retirar">📦 Listo para retirar</option>
            <option value="entregado">🎉 Entregado</option>
          </>
        )
      case 'entregado':
        return <option value="entregado">🎉 Entregado</option>
      case 'cancelado':
        return <option value="cancelado">❌ Cancelado</option>
      default:
        return null
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#3D2035]">Pedidos</h1>
          <p className="mt-1 text-sm text-[#9C6B85]">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#3D2035] shadow-sm border border-[#F2C4D8] hover:bg-[#FFF0F5] transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Loading */}
      {isLoading && orders.length === 0 ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/60 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20">
          <Package className="h-16 w-16 text-[#F2C4D8] mb-4" />
          <p className="text-lg font-medium text-[#3D2035]">No hay pedidos aún</p>
          <p className="text-sm text-[#9C6B85] mt-1">Los pedidos aparecerán aquí cuando los clientes compren.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const sc = statusConfig[order.status] || statusConfig.pendiente
            const isCompletedOrCancelled = order.status === 'entregado' || order.status === 'cancelado'

            return (
              <div
                key={order._id}
                className="rounded-2xl bg-white border border-[#F2C4D8]/30 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-heading font-bold text-[#3D2035]">
                        {order.orderNumber}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.color} ${sc.bg}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#9C6B85]">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="lg:w-48">
                    <p className="text-sm font-medium text-[#3D2035] truncate">{order.customer.name}</p>
                    <p className="text-xs text-[#9C6B85] truncate">{order.customer.email}</p>
                    <p className="text-xs text-[#9C6B85]">{order.customer.phone}</p>
                  </div>

                  {/* Products Summary */}
                  <div className="lg:w-56">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-[#3D2035] truncate">
                        {item.quantity}x {item.name}
                        {item.color ? ` - Color: ${item.color}` : ''}
                      </p>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="lg:w-28 text-right">
                    <p className="font-heading font-bold text-[#D4537E] text-lg">
                      {formatPrice(order.pricing.total)}
                    </p>
                  </div>

                  {/* Status Selector & Actions */}
                  <div className="lg:w-60 flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={order.status}
                        onChange={(e) => promptStatusChange(order, e.target.value)}
                        disabled={updatingId === order._id || isCompletedOrCancelled}
                        className="w-full appearance-none rounded-xl border border-[#F2C4D8] bg-white px-4 py-2.5 pr-10 text-sm font-medium text-[#3D2035] focus:border-[#D4537E] focus:outline-none focus:ring-1 focus:ring-[#D4537E] disabled:opacity-60 disabled:bg-[#FFF0F5]/20 cursor-pointer"
                      >
                        {renderStatusOptions(order.status)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9C6B85]" />
                    </div>

                    {isCompletedOrCancelled && (
                      <span className="text-[#9C6B85] text-sm shrink-0" title="Estado bloqueado">🔒</span>
                    )}

                    {order.status === 'entregado' && (
                      <button
                        onClick={() => promptDeleteOrder(order)}
                        className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-500 hover:bg-red-100 transition-colors shrink-0"
                        title="Eliminar pedido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Nota de retiro */}
                <div className="mt-3 pt-3 border-t border-[#F2C4D8]/30">
                  <p className="text-xs text-[#9C6B85]">
                    🛍️ Compra para retiro en local
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Coquette Confirmation Modal */}
      {modalType && targetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border-2 border-[#F2C4D8] animate-in fade-in zoom-in-95 duration-200">
            {modalType === 'status' ? (
              <>
                <h3 className="font-heading text-lg font-bold text-[#3D2035] mb-2">
                  ⚠️ ¿Confirmar cambio de estado?
                </h3>
                <p className="text-sm text-[#9C6B85] mb-6 leading-relaxed">
                  Esta acción no se puede revertir.<br />
                  Vas a cambiar el pedido <strong className="text-[#3D2035]">{targetOrder.orderNumber}</strong> de <strong>{statusConfig[targetOrder.status]?.label || targetOrder.status}</strong> a <strong>{statusConfig[nextStatus]?.label || nextStatus}</strong>.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setModalType(null)
                      setTargetOrder(null)
                    }}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(targetOrder._id, nextStatus)
                      setModalType(null)
                      setTargetOrder(null)
                    }}
                    className="rounded-xl bg-[#D4537E] px-4 py-2 text-sm font-medium text-white hover:bg-[#B83A6A] transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-heading text-lg font-bold text-[#3D2035] mb-2">
                  🗑️ ¿Eliminar este pedido?
                </h3>
                <p className="text-sm text-[#9C6B85] mb-6 leading-relaxed">
                  Esta acción no se puede deshacer.<br />
                  ¿Estás seguro de que querés eliminar el pedido <strong className="text-[#3D2035]">{targetOrder.orderNumber}</strong>?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setModalType(null)
                      setTargetOrder(null)
                    }}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteOrder(targetOrder._id)
                      setModalType(null)
                      setTargetOrder(null)
                    }}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
