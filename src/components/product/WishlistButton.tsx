'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/stores/wishlistStore'
import type { Product } from '@/types'

interface WishlistButtonProps {
  product: Product
}

export default function WishlistButton({ product }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId)

  return (
    <motion.button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
      }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 1.3 }}
      className={`p-3 rounded-full transition-all duration-300 shadow-sm border ${
        isWishlisted
          ? 'bg-[#FFF0F5] border-pink-200 text-[#D4537E]'
          : 'bg-white border-pink-50 text-pink-200 hover:text-[#D4537E]'
      }`}
      aria-label={isWishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
    >
      <Heart
        className={`w-6 h-6 transition-all ${isWishlisted ? 'fill-[#D4537E]' : ''}`}
      />
    </motion.button>
  )
}
