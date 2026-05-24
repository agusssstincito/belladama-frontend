"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { ProductCard } from "@/components/product/ProductCard";
import api from "@/lib/api";
import type { Product } from "@/types";

export function NewArrivalsSection() {
  const [activeTab, setActiveTab] = useState<"week" | "month">("week");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/products?sortBy=newest&limit=8`);
        // Try to extract array from real API { data: { products: [] } } or mock { products: [] }
        const productsData = response.data?.data?.products || response.data?.products || response.data;
        const data = Array.isArray(productsData) ? productsData : [];
        
        // Filter by creation date based on tab
        const now = new Date();
        const days = activeTab === "week" ? 7 : 30;
        const filtered = data.filter((p: Product) => {
          const created = new Date(p.createdAt);
          const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays <= days;
        });
        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNewArrivals();
  }, [activeTab]);

  return (
    <section className="bg-lumiere-cream py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 className="font-heading text-4xl font-bold text-lumiere-charcoal lg:text-5xl">
            Nuevas llegadas
          </h2>

          <div className="flex gap-2 rounded-full bg-lumiere-warm p-1">
            <motion.button
              onClick={() => setActiveTab("week")}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === "week"
                  ? "bg-lumiere-light text-lumiere-charcoal"
                  : "text-lumiere-muted"
              }`}
            >
              Esta semana
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("month")}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === "month"
                  ? "bg-lumiere-light text-lumiere-charcoal"
                  : "text-lumiere-muted"
              }`}
            >
              Este mes
            </motion.button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 min-[1200px]:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-lumiere-warm rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 min-[1200px]:grid-cols-4 gap-6"
          >
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <motion.div key={product.id || product._id} variants={fadeUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-lumiere-muted">
                No hay productos nuevos disponibles en este momento.
              </div>
            )}
          </motion.div>
        )}

        <div className="mt-12 text-center">
          <Link href="/products">
            <Button variant="outline" size="lg">
              Ver todo
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
