# CLAUDE.md — Lumière Backend

> **Proyecto:** Lumière — E-commerce de ropa y accesorios  
> **Stack:** Node.js + Express + TypeScript + MongoDB (Mongoose)  
> **Puerto:** 4000  
> **Deploy:** Railway  
> **Frontend:** Next.js en Vercel (consumidor principal de esta API)

---

## 🎯 Objetivo de esta API

API RESTful completa y lista para producción para el e-commerce Lumière. Incluye: autenticación JWT, catálogo de productos, carrito persistente, órdenes, pagos con MercadoPago (con estructura para migrar a Stripe), reviews, wishlist y panel de administración.

---

## 📁 Estructura del proyecto

```
lumiere-backend/
├── src/
│   ├── server.ts                   # Entry point
│   ├── app.ts                      # Express app, middlewares globales
│   ├── config/
│   │   ├── db.ts                   # Conexión MongoDB
│   │   ├── env.ts                  # Variables de entorno validadas con Zod
│   │   └── mercadopago.ts          # Config MercadoPago SDK
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.middleware.ts
│   │   ├── users/
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.controller.ts
│   │   ├── products/
│   │   │   ├── product.model.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── product.controller.ts
│   │   │   └── product.service.ts
│   │   ├── categories/
│   │   │   ├── category.model.ts
│   │   │   ├── category.routes.ts
│   │   │   └── category.controller.ts
│   │   ├── cart/
│   │   │   ├── cart.model.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── cart.controller.ts
│   │   │   └── cart.service.ts
│   │   ├── orders/
│   │   │   ├── order.model.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── order.controller.ts
│   │   │   └── order.service.ts
│   │   ├── payments/
│   │   │   ├── payment.routes.ts
│   │   │   ├── payment.controller.ts
│   │   │   └── payment.service.ts      # Abstracción: MercadoPago hoy, Stripe mañana
│   │   ├── reviews/
│   │   │   ├── review.model.ts
│   │   │   ├── review.routes.ts
│   │   │   └── review.controller.ts
│   │   ├── wishlist/
│   │   │   ├── wishlist.model.ts
│   │   │   ├── wishlist.routes.ts
│   │   │   └── wishlist.controller.ts
│   │   └── admin/
│   │       ├── admin.routes.ts         # Todas las rutas de admin bajo /admin
│   │       ├── admin.middleware.ts     # Verificar rol admin
│   │       └── admin.controller.ts
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts
│   │   │   ├── notFound.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validate.ts             # Middleware de validación Zod
│   │   ├── utils/
│   │   │   ├── slugify.ts
│   │   │   ├── pagination.ts
│   │   │   ├── ApiError.ts
│   │   │   └── ApiResponse.ts
│   │   └── types/
│   │       └── express.d.ts            # Extender Request con req.user
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 🔧 Variables de entorno

```env
# .env
NODE_ENV=development
PORT=4000

# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/lumiere

# JWT
JWT_SECRET=super_secret_key_cambiar_en_produccion
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=otro_secret_para_refresh
JWT_REFRESH_EXPIRES_IN=30d

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx
MP_PUBLIC_KEY=APP_USR-xxxx
MP_WEBHOOK_SECRET=tu_webhook_secret

# Frontend URL (para CORS y redirects de MP)
FRONTEND_URL=http://localhost:3000

# Cloudinary (para imágenes de productos)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (opcional: notificaciones de órdenes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Admin seed
ADMIN_EMAIL=admin@lumiere.com
ADMIN_PASSWORD=Admin123!
```

---

## 🗄️ Modelos de datos (Mongoose)

### User

```ts
// user.model.ts
{
  name:          String (required),
  email:         String (required, unique, lowercase),
  password:      String (required, select: false),  // bcrypt, min 6
  role:          String (enum: ['customer', 'admin'], default: 'customer'),
  avatar:        String,
  phone:         String,
  addresses: [{
    label:       String,  // 'Casa', 'Trabajo'
    street:      String,
    city:        String,
    province:    String,
    postalCode:  String,
    isDefault:   Boolean
  }],
  isActive:      Boolean (default: true),
  refreshToken:  String (select: false),
  createdAt:     Date,
  updatedAt:     Date
}
```

### Product

```ts
// product.model.ts
{
  name:          String (required),
  slug:          String (required, unique),  // auto-generado del nombre
  description:   String (required),
  shortDesc:     String,                    // Para cards
  price:         Number (required, min: 0),
  comparePrice:  Number,                    // Precio tachado (precio original)
  category:      ObjectId (ref: 'Category', required),
  images: [{
    url:         String,
    alt:         String,
    isPrimary:   Boolean
  }],
  variants: [{
    size:        String,   // 'XS', 'S', 'M', 'L', 'XL', 'XXL'
    color:       String,
    colorHex:    String,   // '#FF0000'
    stock:       Number (default: 0)
  }],
  tags:          [String],
  isActive:      Boolean (default: true),
  isFeatured:    Boolean (default: false),
  isNew:         Boolean (default: true),   // true los primeros 30 días
  totalSold:     Number (default: 0),
  averageRating: Number (default: 0),
  reviewCount:   Number (default: 0),
  createdAt:     Date,
  updatedAt:     Date
}
// Indexes: { slug: 1 }, { category: 1 }, { isFeatured: 1 }, { isNew: 1 }
// Text index: { name: 'text', description: 'text', tags: 'text' }
```

### Category

```ts
// category.model.ts
{
  name:     String (required),
  slug:     String (required, unique),
  image:    String,
  parentId: ObjectId (ref: 'Category', null),  // Para subcategorías futuras
  isActive: Boolean (default: true),
  order:    Number (default: 0)
}
```

### Cart

```ts
// cart.model.ts
{
  user:     ObjectId (ref: 'User', required, unique),  // Un carrito por usuario
  items: [{
    product:   ObjectId (ref: 'Product'),
    variantId: String,   // ID del variant (size+color)
    size:      String,
    color:     String,
    quantity:  Number (min: 1),
    price:     Number    // Precio al momento de agregar (snapshot)
  }],
  updatedAt: Date
}
// TTL para carritos guest: expiresAt con TTL index (30 días)
```

### Order

```ts
// order.model.ts
{
  orderNumber:  String (unique),    // 'LUM-2025-0001'
  user:         ObjectId (ref: 'User'),
  items: [{
    product:    ObjectId (ref: 'Product'),
    name:       String,             // Snapshot del nombre
    image:      String,             // Snapshot de imagen
    size:       String,
    color:      String,
    quantity:   Number,
    unitPrice:  Number,
    subtotal:   Number
  }],
  shippingAddress: {
    name:       String,
    street:     String,
    city:       String,
    province:   String,
    postalCode: String,
    phone:      String
  },
  pricing: {
    subtotal:   Number,
    shipping:   Number,
    discount:   Number,
    total:      Number
  },
  couponCode:   String,
  payment: {
    method:     String (enum: ['mercadopago', 'stripe', 'cash']),
    status:     String (enum: ['pending', 'approved', 'rejected', 'refunded']),
    externalId: String,   // ID de MP o Stripe
    paidAt:     Date
  },
  status:       String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingCode: String,
  notes:        String,
  createdAt:    Date,
  updatedAt:    Date
}
```

### Review

```ts
// review.model.ts
{
  product:   ObjectId (ref: 'Product', required),
  user:      ObjectId (ref: 'User', required),
  rating:    Number (required, min: 1, max: 5),
  title:     String,
  body:      String,
  images:    [String],
  isVerified: Boolean (default: false),  // Compra verificada
  isApproved: Boolean (default: true),
  createdAt: Date
}
// Compound unique index: { product: 1, user: 1 } — una review por producto/usuario
```

### Wishlist

```ts
// wishlist.model.ts
{
  user:     ObjectId (ref: 'User', required, unique),
  products: [ObjectId (ref: 'Product')],
  updatedAt: Date
}
```

---

## 🛣️ Rutas de la API

### Auth — `/api/auth`
```
POST   /register          → Crear cuenta
POST   /login             → Login, devuelve accessToken + refreshToken (httpOnly cookie)
POST   /logout            → Invalidar refresh token
POST   /refresh           → Renovar access token
GET    /me                → Datos del usuario autenticado
POST   /forgot-password   → Enviar email de reset
POST   /reset-password    → Cambiar contraseña con token
```

### Products — `/api/products`
```
GET    /                  → Listar productos (paginado, filtros, búsqueda)
GET    /:slug             → Detalle de producto por slug
GET    /featured          → Productos destacados (isFeatured: true)
GET    /new-arrivals      → Últimos 12 productos (isNew: true)
GET    /:id/reviews       → Reviews de un producto
POST   /:id/reviews       → Crear review (auth requerida)
DELETE /:id/reviews/:reviewId → Eliminar propia review (auth)
```

**Query params de listado:**
```
?page=1&limit=12
?category=remeras
?minPrice=1000&maxPrice=50000
?size=M&color=negro
?sort=price_asc|price_desc|newest|popular
?search=vestido floral
?isFeatured=true
```

### Categories — `/api/categories`
```
GET    /        → Todas las categorías activas
GET    /:slug   → Categoría + sus productos
```

### Cart — `/api/cart` *(auth requerida)*
```
GET    /              → Obtener carrito del usuario (populate productos)
POST   /items         → Agregar item { productId, variantId, quantity }
PUT    /items/:itemId → Actualizar cantidad
DELETE /items/:itemId → Eliminar item
DELETE /              → Vaciar carrito completo
```

### Wishlist — `/api/wishlist` *(auth requerida)*
```
GET    /           → Obtener wishlist con productos populados
POST   /           → Agregar producto { productId }
DELETE /:productId → Quitar producto
```

### Orders — `/api/orders` *(auth requerida)*
```
GET    /      → Mis órdenes (paginadas)
GET    /:id   → Detalle de una orden (solo propia)
POST   /      → Crear orden desde el carrito activo
```

### Payments — `/api/payments`
```
POST   /create-preference   → Crear preference de MercadoPago, devuelve { preferenceId, initPoint }
POST   /webhook             → Webhook de MercadoPago (actualiza estado de pago/orden)
GET    /success             → Redirect de MP tras pago exitoso
GET    /failure             → Redirect de MP tras fallo
GET    /pending             → Redirect de MP en pendiente
```

### Admin — `/api/admin` *(auth + rol admin)*

```
# Productos
GET    /products              → Listar todos (con inactivos)
POST   /products              → Crear producto
PUT    /products/:id          → Editar producto
DELETE /products/:id          → Soft delete (isActive: false)
PATCH  /products/:id/toggle   → Activar/desactivar
POST   /products/upload-image → Subir imagen a Cloudinary

# Categorías
GET    /categories            → Todas las categorías
POST   /categories            → Crear categoría
PUT    /categories/:id        → Editar categoría
DELETE /categories/:id        → Eliminar categoría

# Órdenes
GET    /orders                → Todas las órdenes (filtros por status, fecha)
GET    /orders/:id            → Detalle de orden
PATCH  /orders/:id/status     → Cambiar status { status, trackingCode? }

# Usuarios
GET    /users                 → Listar usuarios
PATCH  /users/:id/role        → Cambiar rol
PATCH  /users/:id/active      → Activar/desactivar usuario

# Reviews
GET    /reviews               → Todas las reviews
PATCH  /reviews/:id/approve   → Aprobar/rechazar review

# Dashboard
GET    /dashboard/stats       → { totalSales, totalOrders, totalUsers, revenueToday }
GET    /dashboard/recent-orders → Últimas 10 órdenes
```

---

## 💳 Integración MercadoPago

```ts
// payment.service.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

// 1. Crear preferencia
export const createMPPreference = async (order: IOrder, user: IUser) => {
  const preference = new Preference(mpClient)

  const items = order.items.map(item => ({
    id: item.product.toString(),
    title: item.name,
    picture_url: item.image,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    currency_id: 'ARS',
  }))

  const response = await preference.create({
    body: {
      items,
      payer: {
        email: user.email,
        name: user.name,
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/checkout/success`,
        failure: `${process.env.FRONTEND_URL}/checkout/failure`,
        pending: `${process.env.FRONTEND_URL}/checkout/pending`,
      },
      auto_return: 'approved',
      external_reference: order._id.toString(),
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    },
  })

  return {
    preferenceId: response.id,
    initPoint: response.init_point,     // Producción
    sandboxInitPoint: response.sandbox_init_point, // Desarrollo
  }
}

// 2. Procesar webhook
export const processMPWebhook = async (body: any) => {
  if (body.type !== 'payment') return

  const payment = new Payment(mpClient)
  const paymentData = await payment.get({ id: body.data.id })

  const orderId = paymentData.external_reference
  const status = paymentData.status // 'approved' | 'rejected' | 'pending'

  await updateOrderPayment(orderId, {
    status,
    externalId: paymentData.id!.toString(),
    paidAt: status === 'approved' ? new Date() : undefined,
  })
}
```

### Preparado para Stripe (futura migración)

```ts
// payment.service.ts — interfaz abstracta
interface PaymentProvider {
  createCheckoutSession(order: IOrder, user: IUser): Promise<{ url: string; sessionId: string }>
  handleWebhook(payload: any, signature: string): Promise<void>
}

// Implementar MercadoPagoProvider y StripeProvider
// Seleccionar via env: PAYMENT_PROVIDER='mercadopago' | 'stripe'
```

---

## 🔐 Autenticación JWT

```ts
// auth.service.ts
// Access token: 7 días (en Authorization header)
// Refresh token: 30 días (en httpOnly cookie)

// Al login:
// 1. Validar credenciales
// 2. Generar accessToken (jwt.sign con JWT_SECRET, expires 7d)
// 3. Generar refreshToken (jwt.sign con JWT_REFRESH_SECRET, expires 30d)
// 4. Guardar refreshToken hasheado en user.refreshToken
// 5. Enviar refreshToken como cookie httpOnly, Secure, SameSite=Strict
// 6. Devolver accessToken en body

// Middleware de auth:
// 1. Leer token del header: Authorization: Bearer <token>
// 2. Verificar con JWT_SECRET
// 3. Buscar usuario en DB (verificar isActive)
// 4. Adjuntar req.user = { id, email, role }
```

---

## 📤 Subida de imágenes (Cloudinary)

```ts
// Instalar: npm install cloudinary multer multer-storage-cloudinary

// Flujo:
// 1. Multer recibe el archivo en memoria
// 2. multer-storage-cloudinary lo sube directo a Cloudinary
// 3. Se guarda la URL segura de Cloudinary en el modelo

// Configuración:
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Carpeta de productos: 'lumiere/products'
// Transformación al subir: { width: 800, height: 1067, crop: 'fill', gravity: 'center' }
// Formato: webp (mejor performance)
```

---

## 🛡️ Middlewares globales

```ts
// app.ts — orden importa
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))  // solo en development

// Rate limiting
app.use('/api/auth', authRateLimiter)      // 10 req / 15 min por IP
app.use('/api', generalRateLimiter)        // 100 req / min por IP
app.use('/api/payments/webhook', express.raw({ type: 'application/json' })) // antes del json() para MP

// Rutas
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
// ... etc

// Al final
app.use(notFoundHandler)
app.use(errorHandler)
```

---

## 📊 Respuestas estándar de la API

```ts
// ApiResponse.ts — SIEMPRE usar este formato
{
  success: true,
  data: { ... },
  message: "Producto creado exitosamente",
  pagination: {             // Solo en listados
    page: 1,
    limit: 12,
    total: 48,
    totalPages: 4,
    hasNext: true,
    hasPrev: false
  }
}

// En errores (ApiError.ts):
{
  success: false,
  error: {
    code: "PRODUCT_NOT_FOUND",
    message: "El producto no existe",
    details: [...]           // Errores de validación Zod
  }
}
```

**Códigos de error custom:**
- `UNAUTHORIZED` — 401
- `FORBIDDEN` — 403
- `NOT_FOUND` — 404
- `VALIDATION_ERROR` — 422
- `DUPLICATE_EMAIL` — 409
- `INSUFFICIENT_STOCK` — 409
- `CART_EMPTY` — 400
- `PAYMENT_FAILED` — 402

---

## 📦 Dependencias a instalar

```bash
# Core
npm install express
npm install mongoose
npm install typescript ts-node tsx
npm install dotenv

# Auth
npm install jsonwebtoken bcryptjs
npm install cookie-parser
npm install @types/jsonwebtoken @types/bcryptjs @types/cookie-parser

# Validación
npm install zod

# MercadoPago
npm install mercadopago

# Imágenes
npm install cloudinary multer multer-storage-cloudinary
npm install @types/multer

# Seguridad
npm install helmet cors express-rate-limit
npm install @types/cors

# Dev tools
npm install morgan
npm install @types/morgan @types/express

# Dev
npm install -D nodemon ts-node @types/node
```

---

## ⚙️ Scripts en package.json

```json
{
  "scripts": {
    "dev":   "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed":  "tsx src/scripts/seed.ts"
  }
}
```

---

## 🌱 Script de seed

Crear `src/scripts/seed.ts` que:
1. Conecta a MongoDB
2. Limpia colecciones de desarrollo
3. Crea usuario admin (con `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env`)
4. Crea 4 categorías: Remeras, Pantalones, Vestidos, Accesorios
5. Crea 20 productos de ejemplo con variantes de talla y color
6. Crea 5 reviews de ejemplo

```bash
npm run seed
```

---

## ✅ Checklist de implementación

### Fase 1 — Base
- [ ] Setup TypeScript + Express + MongoDB connection
- [ ] Variables de entorno con validación Zod
- [ ] Middlewares globales (cors, helmet, rate limit)
- [ ] ApiResponse y ApiError utilities
- [ ] Error handler global
- [ ] Middleware de validación Zod

### Fase 2 — Auth
- [ ] User model
- [ ] Register con hash de password
- [ ] Login con JWT (access + refresh)
- [ ] Middleware authenticate
- [ ] Middleware requireAdmin
- [ ] Ruta /me
- [ ] Refresh token

### Fase 3 — Catálogo
- [ ] Category model + CRUD admin
- [ ] Product model + slugify automático
- [ ] Listado con filtros, búsqueda y paginación
- [ ] Detalle por slug
- [ ] Featured y new arrivals
- [ ] Subida de imágenes a Cloudinary

### Fase 4 — Carrito
- [ ] Cart model
- [ ] Agregar item (verificar stock)
- [ ] Actualizar cantidad
- [ ] Eliminar item
- [ ] Vaciar carrito
- [ ] GET carrito con productos populados

### Fase 5 — Órdenes y pagos
- [ ] Order model con número auto-incremental
- [ ] Crear orden desde carrito (snapshot de precios)
- [ ] Integración MercadoPago (preference + webhook)
- [ ] Actualizar estado de orden por webhook
- [ ] Decrementar stock al confirmar pago

### Fase 6 — Reviews y wishlist
- [ ] Review model + validación (solo si compró)
- [ ] Actualizar averageRating y reviewCount en product (post-save hook)
- [ ] Wishlist model + toggle (agregar/quitar)

### Fase 7 — Admin
- [ ] Todas las rutas de admin
- [ ] Dashboard stats con aggregation pipeline
- [ ] Gestión de órdenes con cambio de status

### Fase 8 — Polish
- [ ] Script de seed completo
- [ ] Logging con Morgan
- [ ] Health check endpoint: GET /api/health
- [ ] Documentación de endpoints (README o Postman collection)

---

## 🚀 Deploy en Railway

```bash
# Variables de entorno a configurar en Railway:
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
MP_ACCESS_TOKEN=...
MP_WEBHOOK_SECRET=...
FRONTEND_URL=https://lumiere.vercel.app
BACKEND_URL=https://lumiere-api.railway.app
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

- Build command: `npm run build`
- Start command: `npm start`
- Health check: `GET /api/health`

---

## 🗒️ Notas de Claude Code

- **Siempre** usar `async/await` con `try/catch` o un wrapper `asyncHandler` para evitar try/catch repetitivo en controllers
- **Nunca** devolver contraseñas ni refreshTokens en las respuestas (usar `select: false` en Mongoose o excluir manualmente)
- El **webhook de MercadoPago** debe recibir el body RAW (no parsear como JSON) para poder verificar la firma — configurar antes del `express.json()` middleware
- Al **crear una orden**: primero verificar stock de todos los items, luego descontar stock, luego crear la orden — todo en una transacción MongoDB si es posible
- Los **precios** siempre se guardan como snapshot al momento de la compra, nunca referenciar el precio actual del producto desde una orden
- El **carrito** es por usuario autenticado. Para guests, el frontend maneja el carrito en Zustand (localStorage) y lo sincroniza al hacer login
- El campo `isNew` del producto se puede calcular automáticamente con un virtual de Mongoose comparando `createdAt` con `Date.now() - 30 días`
