'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, MessageCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ConfirmacionPage() {
  return (
    <main className="min-h-screen bg-lumiere-cream flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-lg w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle className="h-14 w-14 text-green-500" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-heading text-3xl md:text-4xl font-bold text-lumiere-charcoal mb-4"
        >
          ¡Pedido recibido! 🎀
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lumiere-muted text-lg mb-8 leading-relaxed"
        >
          En breve nos comunicamos con vos para confirmar tu pedido y coordinar la entrega.
        </motion.p>

        {/* WhatsApp Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-lumiere-warm rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-lumiere-charcoal mb-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">WhatsApp</span>
          </div>
          <p className="text-sm text-lumiere-muted">
            Se abrió una ventana de WhatsApp con el resumen de tu pedido. 
            Si no se abrió, podés contactarnos directamente al{' '}
            <a
              href="https://wa.me/5492613633020"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lumiere-rose font-medium hover:underline"
            >
              +54 9 261 363-3020
            </a>
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/products">
            <Button variant="primary" size="lg">
              Seguir comprando
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
