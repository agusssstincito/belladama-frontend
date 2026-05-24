import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | Bella Dama',
  description: 'Preguntas Frecuentes',
}

export default function FaqsPage() {
  const faqs = [
    { q: "¿Cuáles son los métodos de pago?", a: "[Placeholder: Aceptamos transferencias, tarjetas de crédito y débito.]" },
    { q: "¿Cuentan con envíos?", a: "Actualmente no realizamos envíos. Los pedidos se retiran en nuestro local coordinando previamente por WhatsApp." },
    { q: "¿Cómo coordino el retiro?", a: "Una vez realizado el pedido por la web, el sistema te redirigirá a WhatsApp donde confirmaremos disponibilidad y coordinaremos el retiro." },
  ]

  return (
    <main className="min-h-screen bg-lumiere-cream py-24 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-heading text-lumiere-charcoal mb-8 text-center">Preguntas Frecuentes</h1>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-lumiere-light p-6 rounded-3xl shadow-soft border border-lumiere-warm">
              <h3 className="font-heading text-xl text-lumiere-charcoal mb-2">{faq.q}</h3>
              <p className="text-lumiere-muted font-body">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
