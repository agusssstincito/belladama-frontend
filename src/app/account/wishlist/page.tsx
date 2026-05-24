'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer } from '@/lib/animations'

export default function WishlistPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { items, isLoading, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchWishlist()
  }, [isAuthenticated, router, fetchWishlist])

  if (!isAuthenticated) return null

  return (
    <main className="min-h-screen bg-lumiere-cream pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-lumiere-muted hover:text-lumiere-charcoal mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a mi cuenta
          </Link>
          <h1 className="text-4xl font-heading text-lumiere-charcoal">
            Mi wishlist
          </h1>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-lumiere-warm rounded-3xl h-[400px] animate-pulse shadow-soft" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {items.map((product) => (
              <motion.div key={product._id || product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center py-24 bg-white/50 rounded-[2.5rem] border border-pink-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-[#D4537E]" />
            </div>
            <p className="text-lumiere-charcoal text-2xl font-heading mb-4">
              Tu wishlist está vacía
            </p>
            <p className="text-lumiere-muted mb-8 max-w-sm mx-auto">
              Guardá tus productos favoritos para tenerlos siempre a mano y no perderte de nada.
            </p>
            <Link href="/products">
              <Button className="bg-[#D4537E] hover:bg-[#c0466e] text-white rounded-full px-8 py-6 text-lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Explorar productos
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  )
}
