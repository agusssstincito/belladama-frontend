'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Grid, List, SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import ProductGrid from '@/components/product/ProductGrid/ProductGrid'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer } from '@/lib/animations'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import type { Product, Category } from '@/types'

interface Filters {
  category: string
  minPrice: string
  maxPrice: string
  sortBy: string
}

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  })
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    const savedView = localStorage.getItem('viewMode') as 'grid' | 'list'
    if (savedView) setViewMode(savedView)
  }, [])

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  const fetchCategories = useCallback(async () => {
    try {
      const { cachedGet } = await import('@/lib/api')
      const categoriesData = await cachedGet('/categories', 600) // 10 minutes
      setCategories(Array.isArray(categoriesData?.data || categoriesData) ? (categoriesData?.data || categoriesData) : [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sort', filters.sortBy);
      params.append('page', page.toString());
      params.append('limit', '12');

      const { cachedGet } = await import('@/lib/api')
      const productsDataResponse = await cachedGet(`/products?${params.toString()}`, 120) // 2 minutes
      const productsData = productsDataResponse?.data?.products || productsDataResponse?.products || productsDataResponse;
      const newProducts = Array.isArray(productsData) ? productsData : [];

      if (page === 1) {
        setProducts(newProducts)
      } else {
        setProducts((prev) => [...prev, ...newProducts])
      }

      const total = productsDataResponse?.data?.total ?? productsDataResponse?.total ?? newProducts.length;
      setTotalProducts(total);

      setHasMore(newProducts.length === 12)
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setError(errObj.response?.data?.message || 'Error al cargar productos')
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    // Secondary data staggered by 300ms
    const timer = setTimeout(() => {
      fetchCategories()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    })
    setPage(1)
  }, [])

  return (
    <main className="min-h-screen bg-lumiere-cream">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading text-lumiere-charcoal mb-4">
            Tienda
          </h1>
          <p className="text-lumiere-muted font-body">
            Descubrí nuestra línea de correctores y maquillaje de alta cobertura
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-lumiere-light rounded-3xl p-6 space-y-6 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg">Filtros</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-lumiere-rose hover:underline"
                >
                  Limpiar
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-lumiere-charcoal mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full rounded-2xl border-2 border-lumiere-warm bg-lumiere-cream px-4 py-2 font-body focus:border-lumiere-rose focus:outline-none"
                  >
                    <option value="">Todas</option>
                    {categories && Array.isArray(categories) && categories.map((cat) => (
                      <option key={cat.id || cat._id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-lumiere-charcoal mb-2">
                    Precio
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full rounded-2xl border-2 border-lumiere-warm bg-lumiere-cream px-4 py-2 font-body focus:border-lumiere-rose focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full rounded-2xl border-2 border-lumiere-warm bg-lumiere-cream px-4 py-2 font-body focus:border-lumiere-rose focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-lumiere-charcoal mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full rounded-2xl border-2 border-lumiere-warm bg-lumiere-cream px-4 py-2 font-body focus:border-lumiere-rose focus:outline-none"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="price_asc">Precio: menor a mayor</option>
                    <option value="price_desc">Precio: mayor a menor</option>
                    <option value="name_asc">Nombre: A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-lumiere-muted">
                {totalProducts} producto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-lumiere-warm hover:border-lumiere-rose transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtros
                </button>
                <div className="hidden md:flex items-center gap-1 bg-lumiere-warm rounded-2xl p-1">
                  <button
                    onClick={() => handleViewChange('grid')}
                    className={`p-2 rounded-xl transition-all ${
                      viewMode === 'grid' ? 'bg-white text-[#D4537E] shadow-sm' : 'text-lumiere-charcoal/40 hover:text-lumiere-charcoal'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewChange('list')}
                    className={`p-2 rounded-xl transition-all ${
                      viewMode === 'list' ? 'bg-white text-[#D4537E] shadow-sm' : 'text-lumiere-charcoal/40 hover:text-lumiere-charcoal'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchProducts} variant="primary">
                  Reintentar
                </Button>
              </div>
            ) : (
              <>
                <motion.div
                  key={viewMode}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {viewMode === 'grid' ? (
                    <ProductGrid isLoading={isLoading && page === 1}>
                      {Array.isArray(products) && products.map((product) => (
                        <motion.div key={product.id || product._id} variants={fadeUp}>
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </ProductGrid>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {Array.isArray(products) && products.map((product) => (
                        <motion.div
                          key={product.id || product._id}
                          variants={fadeUp}
                          className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-lumiere-warm hover:border-lumiere-rose hover:shadow-soft transition-all group"
                        >
                          <div className="relative w-[120px] h-[120px] rounded-2xl overflow-hidden flex-shrink-0 bg-lumiere-warm">
                            {(() => {
                              const imageSrc = typeof product.images?.[0] === 'string' 
                                ? product.images[0] 
                                : (product.images?.[0] as any)?.url || '/placeholder.jpg';
                              
                              return (
                                <Image
                                  src={imageSrc}
                                  alt={product.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                  sizes="120px"
                                />
                              );
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-lumiere-rose uppercase tracking-widest mb-1">
                              {product.category?.name}
                            </p>
                            <h3 className="text-xl font-heading text-lumiere-charcoal mb-1 truncate">
                              {product.name}
                            </h3>
                            <p className="text-lg font-semibold text-[#D4537E]">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Link href={`/products/${product.slug}`}>
                              <Button variant="outline" size="sm" className="rounded-xl group-hover:bg-[#D4537E] group-hover:text-white group-hover:border-[#D4537E] transition-all duration-300">
                                Ver producto
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {isLoading && page === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-lumiere-warm rounded-3xl h-80 animate-pulse" />
                    ))}
                  </div>
                )}

                {!isLoading && products.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-lumiere-muted text-lg">
                      No se encontraron productos con los filtros seleccionados
                    </p>
                    <Button onClick={clearFilters} variant="outline" className="mt-4">
                      Limpiar filtros
                    </Button>
                  </div>
                )}

                {hasMore && !isLoading && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={() => setPage((prev) => prev + 1)}
                      variant="outline"
                      size="lg"
                    >
                      Cargar más productos
                    </Button>
                  </div>
                )}

                {isLoading && page > 1 && (
                  <div className="text-center mt-8">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-lumiere-rose border-t-transparent" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-lumiere-cream animate-pulse">
      <ProductsPageContent />
    </div>
  )
}
