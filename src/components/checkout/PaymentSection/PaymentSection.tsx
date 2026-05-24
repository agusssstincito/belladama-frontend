interface PaymentSectionProps {
  total: number
}

export default function PaymentSection({ total }: PaymentSectionProps) {
  return (
    <div className="bg-lumiere-warm rounded-3xl p-6">
      <h2 className="font-heading text-xl text-lumiere-charcoal mb-4">
        Pago con MercadoPago
      </h2>
      <div className="text-center py-8 text-lumiere-muted">
        <p>Total a pagar: ${total.toLocaleString()}</p>
        <p className="mt-2 text-sm">El formulario de pago se cargará aquí con MercadoPago SDK</p>
      </div>
    </div>
  )
}