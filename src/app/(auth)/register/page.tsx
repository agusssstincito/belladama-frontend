'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterInput } from '@/lib/validations'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fadeUp } from '@/lib/animations'

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setError('')
    try {
      await registerUser(data.name, data.email, data.password)
      router.push('/login?success=true')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Error al registrar usuario')
    }
  }

  return (
    <main className="min-h-screen bg-lumiere-cream flex items-center justify-center px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="w-full max-w-md"
      >
        <div className="bg-lumiere-light rounded-3xl p-8 shadow-soft">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-heading text-lumiere-charcoal mb-2">
              Crear cuenta
            </h1>
            <p className="text-lumiere-muted">
              Unite a Bella Dama
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-2xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-body text-lumiere-charcoal">Nombre completo</label>
              <Input
                placeholder="Tu nombre"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-body text-lumiere-charcoal">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-body text-lumiere-charcoal">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-body text-lumiere-charcoal">Confirmar contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrando...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>

          <p className="text-center mt-6 text-lumiere-muted">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-lumiere-rose hover:underline font-medium">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
