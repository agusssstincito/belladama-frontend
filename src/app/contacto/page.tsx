import { Metadata } from 'next'
import { Phone, Mail, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto | Bella Dama',
  description: 'Contactanos',
}

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-lumiere-cream py-24 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-heading text-lumiere-charcoal mb-8 text-center">Contacto</h1>
        <div className="bg-lumiere-light p-8 rounded-3xl shadow-soft border border-lumiere-warm space-y-6">
          <p className="text-lg text-lumiere-muted font-body text-center mb-8">
            ¿Tenés alguna consulta? ¡Escribinos por WhatsApp y te respondemos a la brevedad!
          </p>
          
          <div className="flex flex-col gap-6 items-center">
            <div className="flex items-center gap-4 text-lumiere-charcoal">
              <Phone className="text-lumiere-rose w-6 h-6" />
              <span className="font-medium">+54 9 261 363-3020</span>
            </div>
            <div className="flex items-center gap-4 text-lumiere-charcoal">
              <Mail className="text-lumiere-rose w-6 h-6" />
              <span className="font-medium">hola@belladama.com</span>
            </div>
            <div className="flex items-center gap-4 text-lumiere-charcoal">
              <MapPin className="text-lumiere-rose w-6 h-6" />
              <span className="font-medium">Córdoba, Argentina</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
