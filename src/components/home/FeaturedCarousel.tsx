"use client";

import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import api from "@/lib/api";
import type { Product } from "@/types";

export function FeaturedCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    ]
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get("/products?featured=true&limit=6");
        // Try to extract array from real API { data: { products: [] } } or mock { products: [] }
        const productsData = response.data?.data?.products || response.data?.products || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  return (
    <section className="bg-lumiere-warm py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex items-center justify-between"
        >
          <h2 className="font-heading text-4xl font-bold text-lumiere-charcoal lg:text-5xl">
            Destacados
          </h2>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollPrev}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-lumiere-light shadow-soft hover:shadow-soft-lg transition-shadow duration-300"
            >
              <ChevronLeft className="h-6 w-6 text-lumiere-charcoal" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollNext}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-lumiere-light shadow-soft hover:shadow-soft-lg transition-shadow duration-300"
            >
              <ChevronRight className="h-6 w-6 text-lumiere-charcoal" />
            </motion.button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="min-w-0 flex-[0_0_85%] pl-4 sm:flex-[0_0_45%] lg:flex-[0_0_30%]">
                <div className="bg-lumiere-light rounded-3xl h-96 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product, index) => (
                  <motion.div
                    key={product.id || product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="min-w-0 flex-[0_0_85%] pl-4 sm:flex-[0_0_45%] lg:flex-[0_0_30%]"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="w-full py-10 text-center text-lumiere-muted">
                  No hay productos destacados disponibles en este momento.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
