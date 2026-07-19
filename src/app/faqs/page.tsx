import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | Bella Dama',
  description: 'Preguntas Frecuentes',
}

export default function FaqsPage() {
  const faqs = [
    { q: "¿Cuáles son los métodos de pago?", a: "Aceptamos efectivo y MercadoPago. El pago se coordina por WhatsApp al momento de confirmar el pedido." },
    { q: "¿Cuentan con envíos?", a: "Por el momento no realizamos envíos. Los pedidos se retiran personalmente coordinando por WhatsApp." },
    { q: "¿Cómo coordino el retiro?", a: "Una vez hecho el pedido en la web, te redirigimos a WhatsApp donde confirmamos disponibilidad y acordamos el retiro." },
    { q: "¿Los precios incluyen IVA?", a: "Sí, todos los precios publicados son finales." },
    { q: "¿Puedo cambiar o devolver un producto?", a: "Si el producto llegó en mal estado o hubo un error en el pedido, escribinos por WhatsApp y lo resolvemos." },
    { q: "¿Cómo sé si un producto está disponible?", a: "El stock se actualiza en tiempo real en la web. Si dice \"Sin stock\" podés escribirnos para consultar reposición." },
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
