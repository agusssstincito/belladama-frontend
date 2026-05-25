"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuthStore } from "@/stores/authStore";
import { useDiscountStore } from "@/stores/useDiscountStore";
import { useToast } from "@/components/ui/Toast";
import { useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { calculateDiscountedPrice, activeDiscounts } = useDiscountStore();
  const { price: discountedPrice, hasDiscount, originalPrice, discountLabel } = calculateDiscountedPrice(product);

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);
  const openCart = useCartStore((state) => state.openCart);

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const images = (product.images || []).map(img => typeof img === 'object' ? (img as any).url : img);
  const hasMultipleImages = images.length > 1;

  const nextImage = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // Auto-slide logic
  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      timerRef.current = setInterval(nextImage, 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentIndex(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, hasMultipleImages, nextImage]);

  // Swipe logic
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
    setTouchStart(null);
    setTouchEnd(null);
  };

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Iniciá sesión para agregar productos al carrito", "warning");
      router.push(`/login?next=${pathname}`);
      return;
    }

    // Extraer talle de product.sizes o product.variants
    let firstSize = 'U';
    if (product.sizes && product.sizes.length > 0) {
      firstSize = typeof product.sizes[0] === 'string' ? product.sizes[0] : product.sizes[0].name;
    } else if ((product as any).variants && (product as any).variants.length > 0) {
      firstSize = (product as any).variants[0].size;
    }

    // Extraer color de product.colors o product.variants
    let firstColor = 'Default';
    if (product.colors && product.colors.length > 0) {
      firstColor = typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name;
    } else if ((product as any).variants && (product as any).variants.length > 0) {
      firstColor = (product as any).variants[0].color;
    }

    addItem(product, firstSize, firstColor);
    openCart();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const availableStock = (product.stock || 0) - (product.reservedStock || 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative hover:-translate-y-1 hover:shadow-xl transition-all duration-200 ease-out rounded-3xl ${availableStock <= 0 ? 'cursor-not-allowed' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      <Link href={`/products/${product.slug}`} className={availableStock <= 0 ? 'pointer-events-none' : ''}>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-lumiere-warm shadow-soft group-hover:shadow-soft-lg transition-shadow duration-500"
          style={{
            transform: "translateZ(20px)",
            transformStyle: "preserve-3d",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Image Carousel Container */}
          <div
            className={`flex h-full w-full transition-transform duration-[450ms] ease-in-out ${availableStock <= 0 ? 'grayscale opacity-60' : ''}`}
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => {
              const validSrc = img?.startsWith('/') || img?.startsWith('http') || img?.startsWith('data:')
                ? img
                : '/placeholder.jpg';

              return (
                <div key={index} className="relative h-full w-full flex-shrink-0">
                  <Image
                    src={validSrc}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index === 0}
                  />
                </div>
              )
            })}
          </div>

          {/* Out of Stock Overlay */}
          {availableStock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px] z-20">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-heading text-sm shadow-glow font-medium">
                Sin stock
              </span>
            </div>
          )}

          {/* Navigation Controls (Only if multiple images and in stock) */}
          {hasMultipleImages && availableStock > 0 && (
            <>
              {/* Arrows */}
              <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <button
                  onClick={prevImage}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-lumiere-charcoal shadow-soft hover:bg-white transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-lumiere-charcoal shadow-soft hover:bg-white transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToImage(e, index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === index
                        ? "w-4 bg-lumiere-rose"
                        : "w-1.5 bg-white/70 border border-white"
                      }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2 z-10" style={{ transform: "translateZ(40px)" }}>
            {hasDiscount && availableStock > 0 && (
              <Badge variant="sale">{discountLabel || "OFERTA"}</Badge>
            )}
            {product.isNew && availableStock > 0 && (
              <Badge variant="new">Nuevo</Badge>
            )}
          </div>

          {/* Low Stock Badge */}
          {availableStock > 0 && availableStock <= 5 && (
            <div className="absolute left-3 bottom-16 z-30" style={{ transform: "translateZ(40px)" }}>
              <span className="bg-orange-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md">
                Últimas {availableStock}
              </span>
            </div>
          )}

          {availableStock > 0 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-lumiere-light/80 backdrop-blur-md shadow-soft opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ transform: "translateZ(40px)" }}
            >
              <motion.div animate={{ scale: inWishlist ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                <Heart
                  className={`h-5 w-5 ${inWishlist ? "fill-[#D4537E] text-[#D4537E]" : "text-lumiere-charcoal"}`}
                />
              </motion.div>
            </motion.button>
          )}

          {/* Add to Cart Overlay */}
          {availableStock > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10"
              style={{ transform: "translateZ(50px)" }}
            >
              <Button
                onClick={handleAddToCart}
                variant="primary"
                className="w-full shadow-glow bg-[#D4537E]"
                size="sm"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Agregar al carrito
              </Button>
            </motion.div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#D4537E]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-lumiere-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        </div>

        <div className="mt-4 space-y-1" style={{ transform: "translateZ(30px)" }}>
          <h3 className={`font-heading text-lg font-medium line-clamp-1 ${availableStock <= 0 ? 'text-lumiere-muted' : 'text-lumiere-charcoal'}`}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className={`font-body font-bold ${availableStock <= 0 ? 'text-lumiere-muted' : 'text-[#D4537E]'}`}>
                  {formatPrice(discountedPrice)}
                </span>
                {/* Rule: only show crossed price if global discounts apply on top of product sale price or base price */}
                {/* Actually, user said: "If only salePrice (no category/store discount): Show salePrice ONLY. If any discount applied on top (category or store): Show pre-discount price crossed out." */}
                {calculateDiscountedPrice(product).hasGlobalDiscount && (
                   <span className="text-sm text-lumiere-muted line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </>
            ) : (
              <span className={`font-body font-semibold ${availableStock <= 0 ? 'text-lumiere-muted' : 'text-lumiere-rose'}`}>
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}