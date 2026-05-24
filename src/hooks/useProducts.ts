'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  description: string
  images: string[]
  category: string
  sizes?: string[]
  colors?: { name: string; hex: string }[]
  stock?: number
  rating?: number
  reviewsCount?: number
}

interface UseProductsOptions {
  category?: string
  page?: number
  limit?: number
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (options.category) params.append('category', options.category)
        if (options.page) params.append('page', options.page.toString())
        if (options.limit) params.append('limit', options.limit.toString())

        const response = await api.get(`/products?${params.toString()}`)
        setProducts(response.data.products || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [options.category, options.page, options.limit])

  return { products, isLoading, error }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`/products/${slug}`)
        setProduct(response.data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [slug])

  return { product, isLoading, error }
}