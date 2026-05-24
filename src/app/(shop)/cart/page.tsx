import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carrito | Bella Dama',
  description: 'Tu carrito de compras',
}

export default function CartPage() {
  return (
    <main className="min-h-screen bg-lumiere-cream">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-heading text-lumiere-charcoal mb-8">
          Carrito
        </h1>
        <div className="bg-lumiere-light rounded-3xl p-8">
          <p className="text-lumiere-muted text-center py-12">
            Próximamente: Carrito de compras con resumen de orden
          </p>
        </div>
      </div>
    </main>
  )
}
