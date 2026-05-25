'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  User as UserIcon, 
  Package, 
  LogOut, 
  ShoppingBag, 
  ChevronRight, 
  Calendar, 
  Heart,
  X,
  ArrowRight,
  Star,
  MessageSquare,
  Trash2,
  Camera
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/product/ProductCard'
import { fadeUp, staggerContainer } from '@/lib/animations'
import api from '@/lib/api'
import type { Order, Product, Review } from '@/types'

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, checkAuth, setUser } = useAuthStore()
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isWishlistLoading, setIsWishlistLoading] = useState(true)
  const [isReviewsLoading, setIsReviewsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('lumiere_token') : null;
      
      if (!token) {
        router.push('/login?next=/account');
        return;
      }

      await checkAuth();
      fetchOrders();
      fetchWishlist();
      fetchReviews();
    }
    init()
  }, [router, checkAuth])

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders')
      setOrders(response.data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWishlist = async () => {
    setIsWishlistLoading(true)
    try {
      const response = await api.get('/wishlist')
      setWishlistProducts(response.data.data || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setIsWishlistLoading(false)
    }
  }

  const fetchReviews = async () => {
    setIsReviewsLoading(true)
    try {
      const response = await api.get('/reviews/me')
      setReviews(response.data.data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsReviewsLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    setWishlistProducts(prev => prev.filter(p => (p._id || p.id) !== productId))
    try {
      await api.delete(`/users/wishlist/${productId}`)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const handleRemoveReview = async (reviewId: string) => {
    // Instant UI update
    setReviews(prev => prev.filter(r => r.id !== reviewId && (r as any)._id !== reviewId))
    try {
      await api.delete(`/reviews/${reviewId}`)
    } catch (error) {
      console.error('Error removing review:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview immediately
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      
      // Optimistic update
      if (user) {
        setUser({ ...user, avatar: base64String } as any)
      }

      setIsAvatarUploading(true)
      try {
        const response = await api.put('/users/avatar', { avatar: base64String })
        if (response.data.success) {
          setUser(response.data.data)
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        // Revert on error if needed, but for now just log
      } finally {
        setIsAvatarUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmado': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'listo para retirar': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'entregado': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelado': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  const getProductsSummary = (items: any[]) => {
    return items.map(i => `${i.quantity}x ${i.name}`).join(', ');
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} 
          />
        ))}
      </div>
    );
  }

  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('lumiere_token') : false;

  if (!isAuthenticated && !hasToken && !isLoading) return null

  return (
    <main className="min-h-screen bg-[#FFF0F5] pt-24 pb-12 px-4 font-body">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-heading text-lumiere-charcoal mb-4">
            Hola, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-lumiere-charcoal/60 font-body text-xl italic max-w-2xl mx-auto">
            Bienvenido a tu rincón personal de belleza en Bella Dama. Aquí podés gestionar tus pedidos y tus favoritos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* Wishlist Section */}
            <section className="space-y-6">
               <div className="flex items-center justify-between px-2">
                 <h2 className="text-3xl font-heading text-[#D4537E] flex items-center gap-3">
                   <Heart className="w-8 h-8 fill-[#D4537E]/20" />
                   Mi Wishlist
                 </h2>
                 {wishlistProducts.length > 0 && (
                   <Link href="/products" className="text-sm font-medium text-[#D4537E] hover:underline flex items-center gap-1">
                     Ver más <ArrowRight className="w-4 h-4" />
                   </Link>
                 )}

               </div>

               <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/60 shadow-sm">
                 {isWishlistLoading ? (
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     {[...Array(3)].map((_, i) => (
                       <div key={i} className="aspect-[4/5] bg-white rounded-3xl animate-pulse" />
                     ))}
                   </div>
                 ) : wishlistProducts.length > 0 ? (
                   <motion.div 
                     variants={staggerContainer}
                     initial="hidden"
                     animate="visible"
                     className="grid grid-cols-2 md:grid-cols-3 gap-6"
                   >
                     {wishlistProducts.map((product) => (
                       <motion.div key={product._id || product.id} variants={fadeUp} className="relative group">
                         <ProductCard product={product} />
                         <button
                           onClick={() => handleRemoveFromWishlist(product._id || product.id)}
                           className="absolute top-4 left-4 z-20 bg-white/90 hover:bg-white text-lumiere-charcoal p-2 rounded-full shadow-md transition-all scale-0 group-hover:scale-100"
                           title="Quitar de la wishlist"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </motion.div>
                     ))}
                   </motion.div>
                 ) : (
                   <div className="py-12 text-center">
                     <div className="w-20 h-20 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-6">
                       <Heart className="w-10 h-10 text-lumiere-charcoal/20" />
                     </div>
                     <p className="text-xl font-heading text-lumiere-charcoal mb-2">Tu wishlist está vacía</p>
                     <p className="text-lumiere-charcoal/60 mb-8 font-body italic">¡Agregá productos desde el catálogo!</p>
                     <Link href="/products">
                       <Button className="bg-[#D4537E] hover:bg-[#c0466e] text-white px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-lg tracking-wide">
                         Explorar catálogo
                       </Button>
                     </Link>

                   </div>
                 )}
               </div>
            </section>

            {/* Reviews Section */}
            <section className="space-y-6">
               <div className="flex items-center justify-between px-2">
                 <h2 className="text-3xl font-heading text-[#D4537E] flex items-center gap-3">
                   <MessageSquare className="w-8 h-8" />
                   Mis Reseñas
                 </h2>
               </div>

               <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/60 shadow-sm">
                  {isReviewsLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-32 bg-white/60 rounded-3xl animate-pulse" />
                      ))}
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {reviews.map((review: any) => (
                          <motion.div
                            key={review.id || review._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-pink-50 relative group"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  {renderStars(review.rating)}
                                  <span className="text-[10px] font-bold text-lumiere-charcoal/30 uppercase tracking-widest">
                                    {formatDate(review.createdAt)}
                                  </span>
                                </div>
                                <Link 
                                  href={`/products/${review.productId?.slug}`}
                                  className="text-lg font-heading text-lumiere-charcoal hover:text-[#D4537E] transition-colors inline-block"
                                >
                                  {review.productId?.name || "Producto de Bella Dama"}
                                </Link>
                                <p className="text-sm text-lumiere-charcoal/70 bg-[#FFF0F5]/50 p-3 rounded-2xl italic italic">
                                  "{review.comment}"
                                </p>
                              </div>

                              <button
                                onClick={() => handleRemoveReview(review.id || review._id)}
                                className="self-end md:self-center p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                title="Eliminar reseña"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-lumiere-charcoal/60">
                      <p className="font-heading text-xl">Todavía no publicaste ninguna reseña.</p>
                      <p className="mt-2 font-body italic">¡Contanos qué te parecieron tus compras!</p>
                    </div>
                  )}
               </div>
            </section>

            {/* Orders Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-3xl font-heading text-[#D4537E] flex items-center gap-3">
                  <Package className="w-8 h-8" />
                  Mis pedidos
                </h2>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-white rounded-3xl animate-pulse shadow-sm border border-pink-50" />
                  ))
                ) : orders.length > 0 ? (
                  <AnimatePresence>
                    {orders.map((order, index) => (
                      <motion.div
                        key={(order as any)._id || order.id}

                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-pink-50 hover:shadow-md transition-shadow group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4537E]/10 group-hover:bg-[#D4537E] transition-colors" />
                        
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <p className="text-xs font-bold text-[#D4537E] uppercase tracking-[0.2em]">
                                #{order.orderNumber}
                              </p>
                              <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-lumiere-charcoal/60 flex items-center gap-2 font-medium">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.createdAt)}
                            </p>
                            <p className="text-lumiere-charcoal font-medium mt-4 text-lg">
                               {getProductsSummary(order.items)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-3xl font-heading text-lumiere-charcoal">
                              $ {order.pricing.total.toLocaleString('es-AR')}
                            </p>
                          </div>


                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-pink-50">
                    <div className="w-16 h-16 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8 text-[#D4537E]" />
                    </div>
                    <h3 className="text-xl font-heading text-lumiere-charcoal mb-4">No tenés pedidos registrados</h3>
                    <Link href="/products">
                      <Button variant="outline" className="border-[#D4537E] text-[#D4537E] hover:bg-[#D4537E] hover:text-white px-8 rounded-full transition-all">
                        Ir a la tienda
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="space-y-6">
              <h2 className="text-2xl font-heading text-[#D4537E] flex items-center gap-2 px-2">
                <UserIcon className="w-6 h-6" />
                Mi Perfil
              </h2>
              
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-pink-50 relative overflow-hidden">
                 <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFF0F5] rounded-full opacity-50" />
                 
                 <div className="relative space-y-6">
                    <div className="relative inline-block mb-6 group">
                      <div className="w-24 h-24 bg-[#D4537E]/10 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden relative">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className={`w-full h-full object-cover transition-opacity ${isAvatarUploading ? 'opacity-50' : 'opacity-100'}`}
                          />
                        ) : (
                          <span className="text-4xl font-heading text-[#D4537E]">{user?.name.charAt(0)}</span>
                        )}
                        
                        {isAvatarUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/20">
                            <div className="w-5 h-5 border-2 border-[#D4537E] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      
                      <label className="absolute bottom-0 right-0 p-2 bg-[#D4537E] text-white rounded-full shadow-lg cursor-pointer hover:bg-[#c0466e] transition-all transform hover:scale-110">
                        <Camera className="w-4 h-4" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleAvatarChange}
                          disabled={isAvatarUploading}
                        />
                      </label>
                    </div>

                   <div>
                     <label className="text-[10px] font-bold text-lumiere-charcoal/30 uppercase tracking-[0.2em] block mb-1">
                       Nombre completo
                     </label>
                     <p className="text-xl font-heading text-lumiere-charcoal">{user?.name} {user?.lastName}</p>
                   </div>

                   <div>
                     <label className="text-[10px] font-bold text-lumiere-charcoal/30 uppercase tracking-[0.2em] block mb-1">
                       Email
                     </label>
                     <p className="font-body text-lumiere-charcoal/70 break-all">{user?.email}</p>
                   </div>

                   <div className="pt-6 border-t border-pink-50">
                     <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-[#D4537E] font-medium hover:text-[#c0466e] transition-all group"
                     >
                       <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                       Cerrar sesión
                     </button>
                   </div>
                 </div>
              </div>
            </section>

            {/* Help Links */}
            <div className="bg-white/60 backdrop-blur-md rounded-[1.5rem] p-6 border border-white">
              <p className="text-[10px] font-bold text-lumiere-charcoal/40 uppercase tracking-widest mb-4">¿Dudas sobre tu belleza?</p>
              <ul className="space-y-4">
                <li>
                  <Link href="/contacto" className="text-sm font-medium text-lumiere-charcoal/80 hover:text-[#D4537E] flex items-center justify-between group">
                    Centro de ayuda
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
                <li>
                  <Link href="/faqs" className="text-sm font-medium text-lumiere-charcoal/80 hover:text-[#D4537E] flex items-center justify-between group">
                    Preguntas frecuentes
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
