"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/products?search=${query}&limit=5`);
        const data = response.data.data || response.data;
        setResults(data.products || []);
        setHasSearched(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-lumiere-charcoal/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed left-0 right-0 top-0 z-50 border-b border-[#F2C4D8] bg-white shadow-xl"
          >
            <div className="mx-auto max-w-4xl px-4 py-8">
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-6 w-6 text-[#D4537E]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full rounded-2xl bg-lumiere-warm/30 py-4 pl-14 pr-12 text-lg text-lumiere-charcoal outline-none ring-2 ring-transparent transition-all focus:bg-white focus:ring-[#F2C4D8]"
                />
                <button
                  onClick={onClose}
                  className="absolute right-4 rounded-full p-1 text-lumiere-muted hover:bg-lumiere-warm transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Results Area */}
              <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-2xl">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-[#D4537E]" />
                  </div>
                ) : hasSearched && results.length > 0 ? (
                  <div className="divide-y divide-lumiere-warm/50 overflow-hidden rounded-2xl border border-lumiere-warm bg-white">
                    {results.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleResultClick(product.slug)}
                        className="flex w-full items-center gap-4 p-4 transition-colors hover:bg-[#FFF0F5]"
                      >
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-lumiere-warm">
                          <Image
                            src={
                              typeof product.images?.[0] === "string"
                                ? product.images[0]
                                : (product.images?.[0] as any)?.url || "/placeholder.jpg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col items-start">
                          <span className="font-heading font-medium text-lumiere-charcoal">
                            {product.name}
                          </span>
                          <span className="text-sm font-medium text-[#D4537E]">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : hasSearched && query.trim() !== "" ? (
                  <div className="py-10 text-center">
                    <p className="text-lumiere-muted">
                      No encontramos productos para tu búsqueda "<strong>{query}</strong>".
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
