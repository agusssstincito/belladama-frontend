import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nosotros | Bella Dama',
  description: 'Conocé más sobre Bella Dama',
}

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-lumiere-cream py-24 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-heading text-lumiere-charcoal mb-8 text-center">Nosotros</h1>
        <div className="bg-lumiere-light p-8 rounded-3xl shadow-soft border border-lumiere-warm">
          <p className="text-lg text-lumiere-muted font-body mb-4">
            [Placeholder: Historia y filosofía de Bella Dama]
          </p>
          <p className="text-lg text-lumiere-muted font-body">
            En Bella Dama nos dedicamos a ofrecerte los mejores correctores y productos de maquillaje de alta cobertura, resaltando la belleza natural con un estilo coquette y delicado.
          </p>
        </div>
      </div>
    </main>
  )
}
