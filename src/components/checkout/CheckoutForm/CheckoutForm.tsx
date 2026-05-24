'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, CheckoutInput } from '@/lib/validations'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface CheckoutFormProps {
  onSubmit: (data: CheckoutInput) => void
  isProcessing: boolean
}

export default function CheckoutForm({ onSubmit, isProcessing }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="font-heading text-xl text-lumiere-charcoal mb-4">
          Datos de contacto
        </h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-body text-lumiere-charcoal">Nombre completo</label>
            <Input
              placeholder="Juan Pérez"
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
            <label className="block text-sm font-body text-lumiere-charcoal">Teléfono</label>
            <Input
              type="tel"
              placeholder="11 1234 5678"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </div>
      </div>

      {/* Removidos campos de envío a pedido del cliente */}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando...
          </span>
        ) : (
          'Confirmar pedido por WhatsApp 💬'
        )}
      </Button>
    </form>
  )
}
