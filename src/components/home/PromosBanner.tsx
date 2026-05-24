"use client";

import { motion } from "framer-motion";

const promos = [
  { icon: "✨", text: "10% OFF primera compra" },
  { icon: "💳", text: "3 cuotas sin interés" },
  { icon: "🌸", text: "Asesoramiento personalizado" },
  { icon: "✨", text: "10% OFF primera compra" },
  { icon: "💳", text: "3 cuotas sin interés" },
  { icon: "🌸", text: "Asesoramiento personalizado" },
];

export function PromosBanner() {
  return (
    <section className="overflow-hidden bg-lumiere-charcoal py-4">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: [0, -50 * (promos.length / 2)],
        }}
        transition={{
          x: {
            repeat: Infinity,
            duration: 25,
            ease: "linear",
          },
        }}
      >
        {[...promos, ...promos].map((promo, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-8"
          >
            <span className="text-lg">{promo.icon}</span>
            <span className="text-sm font-medium text-lumiere-light">
              {promo.text}
            </span>
            <span className="h-1 w-1 rounded-full bg-lumiere-rose" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}