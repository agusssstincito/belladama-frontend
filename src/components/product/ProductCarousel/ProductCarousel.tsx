'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductCarouselProps {
  children: React.ReactNode
}

export default function ProductCarousel({ children }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const scrollNext = () => {
    setCurrentIndex((prev) => prev + 1)
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `${-currentIndex * 25}%` }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-lumiere-light rounded-full p-2 shadow-soft hover:shadow-soft-lg transition-shadow"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="w-6 h-6 text-lumiere-charcoal" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-lumiere-light rounded-full p-2 shadow-soft hover:shadow-soft-lg transition-shadow"
      >
        <ChevronRight className="w-6 h-6 text-lumiere-charcoal" />
      </button>
    </div>
  )
}