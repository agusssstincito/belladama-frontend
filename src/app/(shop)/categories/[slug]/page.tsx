'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Grid, List } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import ProductGrid from '@/components/product/ProductGrid/ProductGrid'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer } from '@/lib/animations'
import api from '@/lib/api'
import type { Product, Category } from '@/types'
import { useCallback } from 'react'

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchCategory = useCallback(async () => {
    try {
      const response = await api.get(`/categories/${params.slug}`)
      // El backend real devuelve { success: true, data: category }
      const data = response.data?.data || response.data
      setCategory(data)
    } catch (error) {
      console.error('Error fetching category:', error)
    }
  }, [params.slug])

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params_url = new URLSearchParams()
      params_url.append('category', params.slug)
      params_url.append('sort', sortBy)
      params_url.append('page', page.toString())
      params_url.append('limit', '12')

      const { cachedGet } = await import('@/lib/api')
      const productsDataResponse = await cachedGet(`/products?${params_url.toString()}`, 120)
      const productsData = productsDataResponse?.data?.products || productsDataResponse?.products || productsDataResponse;
      const newProducts = Array.isArray(productsData) ? productsData : [];

      if (page === 1) {
        setProducts(newProducts)
      } else {
        setProducts((prev) => [...prev, ...newProducts])
      }

      setHasMore(newProducts.length === 12)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [params.slug, sortBy, page])

  useEffect(() => {
    fetchCategory()
  }, [fetchCategory])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <main className="min-h-screen bg-lumiere-cream">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-lumiere-muted hover:text-lumiere-charcoal mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a tienda
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading text-lumiere-charcoal mb-4">
            {category?.name || params.slug}
          </h1>
          {category?.image && (
            <div className="relative h-64 rounded-3xl overflow-hidden mt-6">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-lumiere-charcoal/30" />
            </div>
          )}
        </motion.div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <p className="text-lumiere-muted">
            {Array.isArray(products) ? products.length : 0} producto{(Array.isArray(products) && products.length !== 1) ? 's' : ''} encontrado{(Array.isArray(products) && products.length !== 1) ? 's' : ''}
          </p>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
              className="rounded-2xl border-2 border-lumiere-warm bg-lumiere-cream px-4 py-2 font-body focus:border-lumiere-rose focus:outline-none"
            >
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>

            <div className="hidden md:flex items-center gap-1 bg-lumiere-warm rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'grid' ? 'bg-lumiere-light shadow-soft' : 'hover:bg-lumiere-light/50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'list' ? 'bg-lumiere-light shadow-soft' : 'hover:bg-lumiere-light/50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-lumiere-warm rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (Array.isArray(products) && products.length > 0) ? (
          <>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <ProductGrid isLoading={false}>
                {products.map((product) => (
                  <motion.div key={product.id || product._id} variants={fadeUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </ProductGrid>
            </motion.div>

            {hasMore && (
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
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lumiere-muted text-lg mb-4">
              No se encontraron productos en esta categoría
            </p>
            <Link href="/products">
              <Button variant="primary">Ver toda la tienda</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
