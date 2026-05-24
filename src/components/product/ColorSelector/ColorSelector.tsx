'use client'

import { motion } from 'framer-motion'

interface Color {
  name: string
  _id?: string
}

interface ColorSelectorProps {
  colors: Color[]
  selectedColor: string | null
  onSelect: (color: string) => void
}

export default function ColorSelector({ colors, selectedColor, onSelect }: ColorSelectorProps) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-[#3D2035] block">
        Color: <span className="font-normal text-[#9C6B85]">{selectedColor || "Seleccionar..."}</span>
      </span>
      <div className="flex flex-wrap gap-2.5">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name;
          return (
            <motion.button
              key={color.name}
              type="button"
              onClick={() => onSelect(color.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-[#D4537E] border-[#D4537E] text-white shadow-sm font-semibold'
                  : 'bg-white border-[#F2C4D8] text-[#3D2035] hover:border-[#D4537E]/50 hover:bg-[#FFF0F5]/30'
              }`}
            >
              {color.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  )
}