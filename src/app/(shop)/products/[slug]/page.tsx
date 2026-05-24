'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Check } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import ProductGallery from '@/components/product/ProductGallery/ProductGallery'
import SizeSelector from '@/components/product/SizeSelector/SizeSelector'
import ColorSelector from '@/components/product/ColorSelector/ColorSelector'
import ProductReviews from '@/components/product/ProductReviews/ProductReviews'
import WishlistButton from '@/components/product/WishlistButton'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/Toast'
import { useDiscountStore } from '@/stores/useDiscountStore'
import { fadeUp, staggerContainer } from '@/lib/animations'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import type { Product, Size, Color } from '@/types'

function ProductDetailContent({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [reviewCount, setReviewCount] = useState(0)

  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const { calculateDiscountedPrice, activeDiscounts } = useDiscountStore();

  const fetchProduct = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get(`/products/${slug}`)
      const data = response.data.data || response.data

      if (data) {
        if (data.images && data.images.length > 0 && typeof data.images[0] === 'object') {
          data.images = data.images.map((img: any) => img.url);
        }

        if (!data.sizes && data.variants) {
          const uniqueSizes = Array.from(new Set(data.variants.map((v: any) => v.size))) as string[];
          data.sizes = uniqueSizes.map(s => ({ id: s, name: s, available: true }));
        }

        if (!data.colors || data.colors.length === 0) {
          if (data.variants && data.variants.length > 0) {
            const uniqueColors = Array.from(new Set(data.variants.map((v: any) => v.color))) as string[];
            data.colors = uniqueColors.map(c => ({ name: c }));
          } else {
            data.colors = [{ name: 'Consultar' }];
          }
        }
      }

      setProduct(data)
      setReviewCount(data.reviewCount || 0)

      if (data?.sizes?.length > 0) {
        const availableSize = data.sizes.find((s: Size) => s.available)
        if (availableSize) setSelectedSize(availableSize.name)
      } else {
        setSelectedSize('U')
      }

      setSelectedColor('')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Error al cargar el producto')
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const availableStock = product ? (product.stock || 0) - (product.reservedStock || 0) : 0

  const handleAddToCart = () => {
    if (!product) return

    if (!user) {
      showToast("Iniciá sesión para agregar productos al carrito", "warning");
      router.push(`/login?next=${pathname}`);
      return;
    }

    const finalQuantity = Math.min(quantity, availableStock)
    if (finalQuantity <= 0) return
    const size = selectedSize || 'U'
    const color = selectedColor || 'Default'
    addItem(product, size, color, finalQuantity)
    openCart()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lumiere-cream">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-lumiere-warm rounded-3xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-lumiere-warm rounded-2xl w-3/4 animate-pulse" />
              <div className="h-6 bg-lumiere-warm rounded-2xl w-1/4 animate-pulse" />
              <div className="h-24 bg-lumiere-warm rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-lumiere-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Producto no encontrado'}</p>
          <Button onClick={fetchProduct} variant="primary">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-lumiere-cream">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          <motion.div variants={fadeUp}>
            <ProductGallery images={product.images} productName={product.name} />
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading text-lumiere-charcoal mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                {(() => {
                  const { price: discountedPrice, hasDiscount, originalPrice, hasGlobalDiscount, discountLabel } = calculateDiscountedPrice(product);
                  if (hasDiscount) {
                    return (
                      <>
                        <span className="text-3xl font-body font-bold text-[#D4537E]">
                          {formatPrice(discountedPrice)}
                        </span>
                        {hasGlobalDiscount && (
                           <span className="text-xl text-lumiere-muted line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                        <span className="bg-[#D4537E] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {discountLabel || "OFERTA"}
                        </span>
                      </>
                    );
                  }
                  return (
                    <span className="text-2xl font-body font-medium text-lumiere-rose">
                      {formatPrice(originalPrice)}
                    </span>
                  );
                })()}
              </div>

              {/* Discount Breakdown */}
              {(() => {
                const { appliedDiscounts } = calculateDiscountedPrice(product);
                if (appliedDiscounts.length === 0) return null;
                return (
                  <div className="mt-3 space-y-1.5">
                    {appliedDiscounts.map((d, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-[#3D2035]/70">
                        <Check className="h-3.5 w-3.5 text-[#D4537E]" />
                        <span className="font-medium">{d.label}</span>
                        <span className="font-bold text-[#D4537E]">-{formatPrice(d.amount)}</span>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-[#3D2035]/50 ml-auto md:ml-0">
                          {d.expiresAt 
                            ? `Hasta ${new Date(d.expiresAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                            : 'Activo'}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="mt-2">
                {availableStock <= 0 ? (
                  <span className="text-red-500 font-medium flex items-center gap-1.5">✗ Sin stock</span>
                ) : availableStock <= 5 ? (
                  <span className="text-orange-500 font-medium flex items-center gap-1.5">⚠️ Últimas {availableStock} unidades</span>
                ) : (
                  <span className="text-green-500 font-medium flex items-center gap-1.5">✓ En stock</span>
                )}
              </div>
            </div>

            <div className="border-t border-lumiere-warm pt-6 space-y-6">
              {product.sizes && product.sizes.length > 0 && product.sizes[0].name !== 'U' && (
                <SizeSelector
                  sizes={product.sizes.map(s => s.name)}
                  selectedSize={selectedSize}
                  onSelect={setSelectedSize}
                />
              )}

              {product.colors && product.colors.length > 0 && (
                <ColorSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onSelect={setSelectedColor}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-lumiere-charcoal mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-lumiere-warm hover:bg-lumiere-blush transition-colors flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => {
                      setQuantity(Math.min(availableStock, quantity + 1));
                    }}
                    className="w-10 h-10 rounded-full bg-lumiere-warm hover:bg-lumiere-blush transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={availableStock <= 0 || !selectedColor}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {availableStock <= 0
                  ? 'Sin stock'
                  : !selectedColor
                    ? 'Seleccionar color'
                    : 'Agregar al carrito'}
              </Button>
              <WishlistButton product={product} />
            </div>

            <div className="flex gap-4 pt-4 border-t border-lumiere-warm">
              <div className="flex items-center gap-2 text-sm text-[#D4537E] font-medium">
                <Check className="w-4 h-4" />
                Consultá disponibilidad por WhatsApp.
              </div>
            </div>

            <div className="border-t border-lumiere-warm pt-6">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-2 px-1 border-b-2 transition-colors ${activeTab === 'description'
                      ? 'border-lumiere-rose text-lumiere-charcoal'
                      : 'border-transparent text-lumiere-muted hover:text-lumiere-charcoal'
                    }`}
                >
                  Descripción
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'reviews'
                      ? 'border-lumiere-rose text-lumiere-charcoal'
                      : 'border-transparent text-lumiere-muted hover:text-lumiere-charcoal'
                    }`}
                >
                  {reviewCount === 1 ? '1 Reseña' : `${reviewCount} Reseñas`}
                  <Star className={`w-3.5 h-3.5 ${reviewCount > 0 ? 'fill-[#D4537E] text-[#D4537E]' : 'text-pink-100'}`} />
                </button>
              </div>

              <div className={activeTab === 'description' ? 'block' : 'hidden'}>
                <div className="prose prose-sm max-w-none">
                  <p className="text-lumiere-muted leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className={activeTab === 'reviews' ? 'block' : 'hidden'}>
                <ProductReviews
                  productId={product?._id || product?.id || ''}
                  onStatsUpdate={(count) => setReviewCount(count)}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailContent slug={params.slug} />
}
