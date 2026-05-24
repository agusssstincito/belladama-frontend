'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const validImages = images && images.length > 0 
    ? images.map(img => img?.startsWith('/') || img?.startsWith('http') || img?.startsWith('data:') ? img : '/placeholder.jpg')
    : ['/placeholder.jpg']

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] bg-lumiere-warm rounded-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={validImages[selectedIndex]}
              alt={`${productName} - Imagen ${selectedIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        {validImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative w-20 h-24 rounded-2xl overflow-hidden transition-all duration-300 ${
              selectedIndex === index
                ? 'ring-2 ring-lumiere-rose'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}