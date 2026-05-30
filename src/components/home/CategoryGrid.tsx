"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import api from "@/lib/api";
import type { Category } from "@/types";

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { cachedGet } = await import("@/lib/api");
        const data = await cachedGet('/categories', 600); // 10 minutes
        // Solo mostramos las categorías activas y ordenadas si el backend lo soporta
        setCategories(Array.isArray(data?.data || data) ? (data?.data || data) : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <section className="bg-lumiere-warm/30 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
           <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="aspect-[3/4] bg-white rounded-[2.5rem] animate-pulse" />
             ))}
           </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-lumiere-cream py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-bold text-[#D4537E] uppercase tracking-[0.3em] mb-4 block">Descubrí tu estilo</span>
          <h2 className="font-heading text-5xl md:text-6xl font-bold text-lumiere-charcoal">
            Categorías
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {categories.map((category) => (
            <motion.div
              key={category.slug}
              variants={fadeUp}
              whileHover="hover"
              className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-[2.5rem] shadow-soft hover:shadow-xl transition-all duration-500"
            >
              <Link href={`/categories/${category.slug}`}>
                <motion.div
                  variants={{
                    hover: { scale: 1.1, rotate: 1 },
                  }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={category.image || "/placeholder.jpg"}
                    alt={category.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {/* Subtle overlay to improve readability */}
                  <div className="absolute inset-0 bg-lumiere-charcoal/10 group-hover:bg-transparent transition-colors duration-500" />
                </motion.div>

                {/* Aesthetic Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#D4537E]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-lumiere-charcoal/90 via-lumiere-charcoal/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />


                <motion.div
                  variants={{
                    hover: { y: -8 },
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 right-0 p-8"
                >
                  <h3 className="font-heading text-3xl font-bold text-white mb-2 transform group-hover:scale-105 transition-transform duration-500">
                    {category.name}
                  </h3>
                  
                  <motion.div
                    initial={{ opacity: 0.8, y: 0 }}
                    whileHover={{ opacity: 1, y: -2 }}
                    className="flex items-center gap-2 text-sm font-medium text-lumiere-rose bg-white/90 backdrop-blur-md w-fit px-4 py-2 rounded-full shadow-lg"
                  >
                    Explorar
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                </motion.div>

                {/* Decorative Frame */}
                <div className="absolute inset-4 border border-white/20 rounded-[1.8rem] pointer-events-none group-hover:inset-3 group-hover:border-white/40 transition-all duration-500" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}