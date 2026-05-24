'use client'

import { motion } from 'framer-motion'

interface SizeSelectorProps {
  sizes: string[]
  selectedSize: string | null
  onSelect: (size: string) => void
}

export default function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-body text-lumiere-charcoal">Talla</span>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <motion.button
            key={size}
            onClick={() => onSelect(size)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`min-w-[48px] h-12 px-4 rounded-full font-body text-sm transition-colors duration-300 ${
              selectedSize === size
                ? 'bg-lumiere-charcoal text-white'
                : 'bg-lumiere-warm text-lumiere-charcoal hover:bg-lumiere-blush'
            }`}
          >
            {size}
          </motion.button>
        ))}
      </div>
    </div>
  )
}