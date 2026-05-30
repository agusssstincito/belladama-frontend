import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
})

// In-memory cache
const cache = new Map<string, { data: any, timestamp: number }>()
const inFlight = new Map<string, Promise<any>>()

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const cachedGet = async (url: string, ttlSeconds: number) => {
  const cached = cache.get(url)
  if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
    return cached.data
  }

  // Deduplicate in-flight requests
  if (inFlight.has(url)) {
    return inFlight.get(url)
  }

  const promise = (async () => {
    try {
      const response = await api.get(url)
      cache.set(url, { data: response.data, timestamp: Date.now() })
      return response.data
    } catch (error: any) {
      if (cached) {
        console.warn(`API Error for ${url}, returning stale cache.`, error)
        return cached.data
      }
      throw error
    } finally {
      inFlight.delete(url)
    }
  })()

  inFlight.set(url, promise)
  return promise
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lumiere_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Interceptor with retry logic for 429
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    
    // If 429 Too Many Requests, retry once after 1.5s
    if (response?.status === 429 && !config._retry) {
      config._retry = true
      console.warn('429 Too Many Requests. Retrying in 1500ms...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      return api(config)
    }
    
    return Promise.reject(error)
  }
)

export default api