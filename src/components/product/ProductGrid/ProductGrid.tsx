'use client'

interface ProductGridProps {
  children: React.ReactNode
  isLoading?: boolean
}

export default function ProductGrid({ children, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 min-[1200px]:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-lumiere-warm rounded-3xl h-80 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 min-[1200px]:grid-cols-4 gap-6">
      {children}
    </div>
  )
}