# CLAUDE.md — Lumière Frontend

> **Proyecto:** Lumière — E-commerce de ropa y accesorios  
> **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion  
> **Hosting:** Vercel  
> **Backend API:** `http://localhost:4000/api` (dev) / `NEXT_PUBLIC_API_URL` en producción

---

## 🎯 Filosofía de diseño

Lumière es una tienda **maximalista pero armoniosa**. La experiencia de navegación debe sentirse como hojear una revista de moda de lujo accesible: rica en contenido visual, fluida en animaciones, nunca rígida ni aburrida.

**Principios inamovibles:**
- Bordes redondeados en absolutamente todo (`rounded-2xl` mínimo, `rounded-3xl` preferido)
- Microinteracciones en cada elemento interactivo (hover, tap, focus)
- Transiciones suaves: `duration-300` a `duration-500`, easing `ease-out`
- Nunca usar bordes rectos en cards de producto
- Sombras suaves y difusas, nunca duras (`shadow-soft` customizada)
- El scroll debe sentirse vivo: animaciones al entrar al viewport (Framer Motion `whileInView`)

---

## 🎨 Design System

### Paleta de colores

```js
// tailwind.config.ts
colors: {
  lumiere: {
    cream:    '#FAF7F4',   // fondo principal
    warm:     '#F5EDE3',   // fondo secundario / cards
    blush:    '#E8C4B0',   // acento cálido
    rose:     '#C97B63',   // CTA principal
    roseDark: '#A05C47',   // hover del CTA
    charcoal: '#2C2C2C',   // texto principal
    muted:    '#8A8078',   // texto secundario
    light:    '#FFFFFF',   // blanco puro
    gold:     '#D4A853',   // detalles premium / badges
  }
}
```

### Tipografía

```js
// Importar en layout.tsx desde Google Fonts
fonts: {
  heading: 'Playfair Display',  // títulos, hero, nombres de producto
  body:    'DM Sans',           // cuerpo, precios, navegación
  accent:  'Cormorant Garamond' // citas, taglines, subtítulos elegantes
}
```

### Shadows personalizadas

```js
boxShadow: {
  'soft':    '0 4px 24px rgba(0,0,0,0.06)',
  'soft-lg': '0 8px 40px rgba(0,0,0,0.10)',
  'glow':    '0 0 30px rgba(201,123,99,0.25)',
}
```

### Border radius estándar

- Botones: `rounded-full`
- Cards producto: `rounded-3xl`
- Inputs: `rounded-2xl`
- Modales: `rounded-3xl`
- Badges: `rounded-full`
- Imágenes: `rounded-2xl`

---

## 📁 Estructura del proyecto

```
lumiere-frontend/
├── app/
│   ├── layout.tsx                  # Layout raíz con fonts, navbar, footer
│   ├── page.tsx                    # Homepage
│   ├── (shop)/
│   │   ├── products/
│   │   │   ├── page.tsx            # Catálogo con filtros
│   │   │   └── [slug]/page.tsx     # Detalle de producto
│   │   ├── categories/
│   │   │   └── [slug]/page.tsx     # Productos por categoría
│   │   ├── cart/page.tsx           # Carrito
│   │   └── checkout/page.tsx       # Checkout
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── account/
│   │   ├── page.tsx                # Dashboard del usuario
│   │   ├── orders/page.tsx
│   │   └── wishlist/page.tsx
│   └── globals.css
├── components/
│   ├── ui/                         # Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── Toast.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileMenu.tsx
│   ├── home/
│   │   ├── HeroSection.tsx         # Hero principal animado
│   │   ├── FeaturedCarousel.tsx    # Carrusel productos destacados
│   │   ├── CategoryGrid.tsx        # Grid animado de categorías
│   │   ├── PromosBanner.tsx        # Banner de promociones
│   │   ├── NewArrivalsSection.tsx  # Nuevas llegadas
│   │   ├── TestimonialsCarousel.tsx
│   │   └── NewsletterSection.tsx
│   ├── product/
│   │   ├── ProductCard.tsx         # Card con animaciones hover
│   │   ├── ProductGrid.tsx
│   │   ├── ProductCarousel.tsx
│   │   ├── ProductGallery.tsx      # Galería con zoom
│   │   ├── ProductReviews.tsx
│   │   ├── SizeSelector.tsx
│   │   ├── ColorSelector.tsx
│   │   └── WishlistButton.tsx
│   ├── cart/
│   │   ├── CartDrawer.tsx          # Sidebar carrito deslizante
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   └── checkout/
│       ├── CheckoutForm.tsx
│       ├── PaymentSection.tsx      # Integración MercadoPago
│       └── OrderSummary.tsx
├── hooks/
│   ├── useCart.ts
│   ├── useWishlist.ts
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useInfiniteScroll.ts
├── stores/
│   ├── cartStore.ts                # Zustand
│   ├── wishlistStore.ts
│   └── authStore.ts
├── lib/
│   ├── api.ts                      # Fetcher base con interceptors
│   ├── utils.ts
│   └── validations.ts              # Zod schemas
├── types/
│   └── index.ts                    # Tipos globales TypeScript
└── public/
    └── images/
```

---

## 🏠 Homepage — Secciones obligatorias

Construir en este orden exacto:

### 1. `HeroSection.tsx`
- **Full viewport** (`min-h-screen`)
- Imagen de fondo con overlay suave o split layout (50% texto / 50% imagen)
- Título grande en Playfair Display con **text reveal animation** (Framer Motion, letra por letra o línea por línea)
- Subtítulo en Cormorant Garamond, animado con delay
- Dos CTAs: "Explorar colección" (primario, `bg-lumiere-rose`) y "Ver novedades" (ghost/outline)
- Badge animado flotante: "Nueva colección SS25" con efecto pulse suave
- Scroll indicator animado abajo del todo
- En mobile: layout vertical, imagen arriba

```tsx
// Ejemplo de animación del título
const titleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
}
```

### 2. `PromosBanner.tsx`
- Banner horizontal scrolleable con 3–4 promos
- Ejemplo: "🚚 Envío gratis desde $30.000" · "✨ 10% OFF primera compra" · "💳 3 cuotas sin interés"
- Fondo `lumiere-charcoal`, texto blanco, animación de scroll infinito (marquee)

### 3. `CategoryGrid.tsx`
- Grid 2x2 en mobile, 4 columnas en desktop
- Cada categoría: imagen full + nombre encima con overlay al hover
- Hover: zoom suave en imagen + texto se desliza hacia arriba
- Categorías: Remeras, Pantalones, Vestidos, Accesorios (placeholders)
- Animación de entrada al scroll: `whileInView` con stagger entre cards

### 4. `FeaturedCarousel.tsx`
- Título: "Destacados" en Playfair Display
- Carrusel horizontal con **Embla Carousel** (instalar: `embla-carousel-react`)
- Visible: 1.2 cards en mobile, 3.2 en desktop (el 0.2 indica que hay más)
- Controles: flechas custom redondeadas + dots
- Auto-play cada 4 segundos con pausa en hover

### 5. `NewArrivalsSection.tsx`
- Grid de productos "Nuevas llegadas"
- Tab switcher animado: "Esta semana" / "Este mes"
- Botón "Ver todo" al final

### 6. `TestimonialsCarousel.tsx`
- Cards de reviews con foto (avatar), nombre, estrellas, texto
- Carrusel con Embla, autoplay suave
- Fondo `lumiere-warm` para contraste

### 7. `NewsletterSection.tsx`
- Fondo degradado suave `lumiere-cream` a `lumiere-warm`
- Título llamativo + input email + botón
- Animación al hacer focus en el input

---

## 🛍️ ProductCard — Comportamiento exacto

```tsx
// Comportamiento en hover (Framer Motion + CSS):
// 1. Card sube 4px (translateY -4px)
// 2. Sombra se intensifica (shadow-soft → shadow-soft-lg)
// 3. Imagen hace zoom suave (scale 1 → 1.05)
// 4. Aparece botón "Agregar al carrito" deslizándose desde abajo
// 5. Aparece WishlistButton (corazón) en esquina superior derecha

// Estructura de la card:
// - Imagen con aspect-ratio 3/4 (portrait, ideal para ropa)
// - Badge de descuento si aplica (esquina superior izquierda)
// - Badge "Nuevo" si es reciente
// - Nombre del producto (DM Sans, font-medium)
// - Precio con tachado si tiene descuento
// - Rating con estrellas (solo si tiene reviews)
```

---

## 🛒 CartDrawer — Sidebar deslizante

- Se abre desde la derecha con `AnimatePresence` + slide
- Overlay oscuro detrás con blur suave
- Lista de productos con imagen, nombre, talla, cantidad, precio
- Controles de cantidad con animación
- Subtotal sticky al fondo
- Botón "Ir al checkout" prominente
- Botón "Seguir comprando" secundario
- Vacío: ilustración SVG simpática + CTA

---

## 💳 Checkout — MercadoPago

```tsx
// En CheckoutForm.tsx usar el SDK de MercadoPago:
// npm install @mercadopago/sdk-react

import { initMercadoPago, Payment } from '@mercadopago/sdk-react'

// initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!)

// El backend genera el preference_id
// El frontend renderiza el Brick de pago de MP
// Manejar callbacks: onSubmit, onError, onReady
```

**Variables de entorno requeridas:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxx
```

---

## 📦 Dependencias a instalar

```bash
# Core
npm install framer-motion
npm install embla-carousel-react embla-carousel-autoplay
npm install zustand
npm install zod
npm install axios

# UI helpers
npm install clsx tailwind-merge
npm install lucide-react
npm install @mercadopago/sdk-react

# Forms
npm install react-hook-form @hookform/resolvers

# Imágenes / optimización
# Next.js Image ya está incluido

# Dev
npm install -D @types/node
```

---

## 🔌 Integración con el Backend

### Estructura base del API client

```ts
// lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumiere_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
```

### Endpoints que consume el frontend

| Acción | Método | Endpoint |
|--------|--------|----------|
| Productos | GET | `/products?page=1&limit=12&category=` |
| Producto por slug | GET | `/products/:slug` |
| Categorías | GET | `/categories` |
| Carrito | GET/POST/PUT/DELETE | `/cart` |
| Wishlist | GET/POST/DELETE | `/wishlist` |
| Órdenes | GET/POST | `/orders` |
| Reviews | GET/POST | `/products/:id/reviews` |
| Auth login | POST | `/auth/login` |
| Auth register | POST | `/auth/register` |
| Auth me | GET | `/auth/me` |
| Checkout (crear preference) | POST | `/payments/create-preference` |

---

## 🎞️ Guía de animaciones (Framer Motion)

```ts
// Variantes reutilizables — importar desde lib/animations.ts

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
}

export const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}
```

**Reglas:**
- Siempre usar `viewport={{ once: true }}` en `whileInView` para no re-animar
- No animar más de 3 elementos simultáneamente
- Respetar `prefers-reduced-motion` del sistema

---

## 📱 Breakpoints y mobile-first

```
mobile:  < 640px  → 1 columna, carrusel, menú hamburguesa
tablet:  640–1024px → 2 columnas
desktop: > 1024px → 3–4 columnas, sidebar visible
```

- Navbar mobile: hamburguesa → panel deslizante desde izquierda con AnimatePresence
- CartDrawer siempre full-height en mobile
- Hero: stack vertical en mobile (imagen arriba, texto abajo)

---

## ✅ Checklist de implementación

### Fase 1 — Layout base
- [ ] Instalar dependencias
- [ ] Configurar tailwind.config.ts con paleta y fonts
- [ ] Implementar Navbar con cart icon + contador + link wishlist
- [ ] Implementar Footer con links, newsletter mini, redes
- [ ] Configurar AuthStore y CartStore en Zustand

### Fase 2 — Homepage
- [ ] HeroSection con animaciones
- [ ] PromosBanner marquee
- [ ] CategoryGrid con hover effects
- [ ] FeaturedCarousel con Embla
- [ ] NewArrivalsSection
- [ ] TestimonialsCarousel
- [ ] NewsletterSection

### Fase 3 — Catálogo y producto
- [ ] Página de catálogo con filtros (categoría, precio, talla)
- [ ] ProductCard con todos sus estados
- [ ] Página de detalle con galería, selector de talla/color
- [ ] Reviews section en detalle

### Fase 4 — Carrito y checkout
- [ ] CartDrawer funcional
- [ ] Página de checkout
- [ ] Integración MercadoPago Brick
- [ ] Página de confirmación de orden

### Fase 5 — Auth y cuenta
- [ ] Login / Register con validación Zod
- [ ] Dashboard de cuenta
- [ ] Página de órdenes
- [ ] Página de wishlist

### Fase 6 — Polish
- [ ] Skeletons en todos los estados de carga
- [ ] Toasts de feedback (add to cart, error, success)
- [ ] SEO: metadata por página con Next.js generateMetadata
- [ ] OG images
- [ ] 404 page animada

---

## 🚀 Deploy en Vercel

```bash
# Variables de entorno a configurar en Vercel Dashboard:
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
NEXT_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxx
```

- Framework preset: Next.js (auto-detectado)
- Build command: `npm run build`
- Output directory: `.next`
- Conectar repo de GitHub → auto-deploy en push a `main`

---

## 🗒️ Notas de Claude Code

- Al crear un componente nuevo, siempre agregar su variante de animación con Framer Motion
- Las cards de producto SIEMPRE usan aspect-ratio 3/4 para las imágenes
- Los colores NUNCA se escriben en hex directamente en className, siempre usar las clases de Tailwind definidas en la paleta (`text-lumiere-rose`, `bg-lumiere-cream`, etc.)
- Si un componente tiene estado de carga, SIEMPRE implementar el Skeleton correspondiente
- Todos los formularios usan react-hook-form + zod para validación
- El CartDrawer se controla desde el CartStore (Zustand), no con estado local
