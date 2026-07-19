import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Nosotros | Bella Dama',
  description: 'Conocé más sobre Bella Dama',
}

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-lumiere-cream py-24 pt-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-heading text-lumiere-charcoal mb-8 text-center">Nosotros</h1>
        
        <div className="bg-lumiere-light p-8 md:p-12 rounded-3xl shadow-soft border border-lumiere-warm space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading text-lumiere-rose mb-4">Nuestra historia</h2>
            <p className="text-lg text-lumiere-muted font-body mb-6 leading-relaxed">
              Bella Dama nació del amor por el maquillaje y las ganas de ayudar a otras chicas a sentirse lindas y seguras. Soy Lucía, tengo 15 años y desde siempre me apasionó el mundo de la belleza. Lo que empezó como un hobby se convirtió en un pequeño negocio con mucho corazón, dedicación y muchas horas frente al espejo probando productos. En Bella Dama encontrás correctores y maquillaje de alta cobertura seleccionados con cuidado, a precios accesibles y con la honestidad de alguien que los usa y los ama. Cada producto que ofrezco es uno que yo misma elegiría. Gracias por apoyar este sueño 🎀
            </p>
            <p className="text-lg text-lumiere-muted font-body leading-relaxed">
              En Bella Dama nos dedicamos a ofrecerte los mejores correctores y productos de maquillaje de alta cobertura, resaltando la belleza natural con un estilo coquette y delicado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm border border-lumiere-warm bg-lumiere-warm">
              <Image
                src="/CONTORNO%20%2B%20CORRECTOR%204%20ANGELS%20%243400%20%281%29.jpeg"
                alt="Contorno y Corrector 4 Angels"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm border border-lumiere-warm bg-lumiere-warm">
              <Image
                src="/FLOWER%20CORRECTOR%20PINK%2021%20%243200%20%281%29.jpeg"
                alt="Flower Corrector Pink 21"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm border border-lumiere-warm bg-lumiere-warm">
              <Image
                src="/RUBOR%20CHEEK%20TO%20CHEEK%20RUBY%20ROSE%20%243400%201-2-3-4-5%20%281%29.jpeg"
                alt="Rubor Cheek to Cheek Ruby Rose"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                onError={(e) => {
                  // Fallback if encoding issues
                  (e.target as HTMLImageElement).src = "/CORRECTOR LAPIZ PINK 21 $2100 (1) 1-2-3-4-5-6-7-8.jpeg";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

