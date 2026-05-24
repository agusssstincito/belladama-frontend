'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/stores/wishlistStore'
import type { Product } from '@/types'

interface WishlistButtonProps {
  product: Product
}

export default function WishlistButton({ product }: WishlistButtonProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore()
  const isWishlisted = isInWishlist(product.id)

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWishlisted) {
      removeItem(product.id)
    } else {
      addItem(product)
    }
  }

  return (
    <motion.button
      onClick={toggleWishlist}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`p-2 rounded-full transition-colors duration-300 ${
        isWishlisted
          ? 'bg-lumiere-rose text-white'
          : 'bg-lumiere-light text-lumiere-charcoal'
      }`}
    >
      <Heart
        className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`}
      />
    </motion.button>
  )
}