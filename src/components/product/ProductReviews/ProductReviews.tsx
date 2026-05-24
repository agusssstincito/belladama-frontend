'use client'

import { useState, useEffect } from 'react'
import { Star, MessageCircle, Send, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Review {
  _id: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  userId: string
}

interface ReviewStats {
  averageRating: number
  totalCount: number
}

interface ProductReviewsProps {
  productId: string
  onStatsUpdate?: (count: number, rating: number) => void
}

export default function ProductReviews({ productId, onStatsUpdate }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ averageRating: 0, totalCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)
  
  // Form state
  const [formRating, setFormRating] = useState(0)
  const [formHoverRating, setFormHoverRating] = useState(0)
  const [formComment, setFormComment] = useState('')
  const [formError, setFormError] = useState('')

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${productId}`)
      const { reviews, averageRating, totalCount } = response.data.data
      setReviews(reviews)
      setStats({ averageRating, totalCount })
      if (onStatsUpdate) {
        onStatsUpdate(totalCount, averageRating)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (productId) fetchReviews()
  }, [productId])

  const userHasReviewed = reviews.some(r => r.userId === user?.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formRating === 0) return setFormError('Por favor selecciona una puntuación')
    if (formComment.length < 10) return setFormError('El comentario debe tener al menos 10 caracteres')
    
    setIsSubmitting(true)
    setFormError('')

    try {
      await api.post(`/reviews/${productId}`, {
        rating: formRating,
        comment: formComment
      })
      
      setSuccessMsg(true)
      await fetchReviews()
      // Reset form
      setFormRating(0)
      setFormComment('')
      setShowForm(false)
      setTimeout(() => setSuccessMsg(false), 5000)
    } catch (error: any) {
      setFormError(error.response?.data?.message || 'Error al enviar la reseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatUserName = (name: string) => {
    const parts = name.split(' ')
    if (parts.length === 1) return name
    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1][0]
    return `${firstName} ${lastInitial}.`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Stats Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 p-6 rounded-3xl border border-pink-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-5xl font-heading text-lumiere-charcoal leading-none">
              {stats.averageRating.toFixed(1)}
            </span>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.averageRating)
                      ? 'fill-[#D4537E] text-[#D4537E]'
                      : 'text-pink-100'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="h-12 w-px bg-pink-100 hidden md:block" />
          <div className="text-lumiere-muted">
            <p className="font-heading text-xl text-lumiere-charcoal">
              {stats.totalCount === 1 ? '1 Reseña' : `${stats.totalCount} Reseñas`}
            </p>
            <p className="text-sm italic">Basado en la experiencia de nuestras clientas</p>
          </div>
        </div>

        {isAuthenticated ? (
          userHasReviewed ? (
             <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-full border border-green-100">
               <CheckCircle2 className="w-5 h-5" />
               Ya dejaste tu reseña ✓
             </div>
          ) : (
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-[#D4537E] hover:bg-[#c0466e] text-white rounded-full px-6"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Escribir reseña
            </Button>
          )
        ) : (
          <div className="text-sm font-medium text-lumiere-charcoal/60">
            <Link href="/login" className="text-[#D4537E] hover:underline font-bold">Iniciá sesión</Link> para dejar una reseña
          </div>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && !userHasReviewed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-pink-100 shadow-soft space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-lumiere-charcoal/60 uppercase tracking-widest text-center">
                  ¿Qué puntaje le das?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setFormHoverRating(star)}
                      onMouseLeave={() => setFormHoverRating(0)}
                      className="p-1 transition-transform transform hover:scale-125"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (formHoverRating || formRating)
                            ? 'fill-[#D4537E] text-[#D4537E]'
                            : 'text-pink-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-lumiere-charcoal/60 uppercase tracking-widest">
                  Tu comentario
                </label>
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Contanos tu experiencia con este producto..."
                  className="w-full h-32 rounded-2xl border-pink-50 bg-pink-50/30 p-4 focus:ring-[#D4537E] focus:border-[#D4537E] transition-all resize-none"
                />
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-lumiere-charcoal/30">
                  <span>Mínimo 10 caracteres</span>
                  <span>{formComment.length}/500</span>
                </div>
              </div>

              {formError && (
                <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-xl border border-red-100">
                  {formError}
                </p>
              )}

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#D4537E] hover:bg-[#c0466e] text-white rounded-full px-12 shadow-md hover:shadow-lg transition-all"
                >
                  {isSubmitting ? 'Publicando...' : 'Publicar reseña'}
                  {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-[#D4537E] font-medium bg-pink-50 p-4 rounded-2xl border border-pink-100"
          >
            <CheckCircle2 className="w-5 h-5" />
            ¡Gracias por tu reseña! Nos ayuda mucho.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-3xl animate-pulse shadow-sm border border-pink-50" />
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#F2C4D8] hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFF0F5] flex items-center justify-center text-[#D4537E] font-bold">
                    {review.userName[0]}
                  </div>
                  <div>
                    <p className="font-heading text-lg text-lumiere-charcoal leading-tight">
                      {formatUserName(review.userName)}
                    </p>
                    <p className="text-xs text-lumiere-charcoal/40 font-medium">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= review.rating
                          ? 'fill-[#D4537E] text-[#D4537E]'
                          : 'text-pink-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-lumiere-charcoal/80 leading-relaxed italic pr-4">
                &quot;{review.comment}&quot;
              </p>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-white/30 rounded-3xl border border-dashed border-pink-200">
            <MessageCircle className="w-12 h-12 text-pink-200 mx-auto mb-4" />
            <p className="text-lumiere-charcoal/40 italic">Sé la primera en compartir su experiencia</p>
          </div>
        )}
      </div>
    </div>
  )
}