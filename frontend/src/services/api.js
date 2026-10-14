import axios from 'axios'

/*
 * Cliente HTTP central para consumir la API de Paz y Salvo (backend_paz_y_salvo).
 * - Adjunta automáticamente el token JWT en cada petición.
 * - Expulsa al usuario (limpia sesión) cuando el token expira (HTTP 401).
 */

const obtenerApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://api-paz-y-salvo.onrender.com/api'
  }
  return envUrl || 'http://localhost:3000/api'
}

const API_URL = obtenerApiUrl()

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.url && config.url.startsWith('/api/')) {
    config.url = config.url.substring(4)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    const mensaje = error.response?.data?.mensaje || 'Error de conexión con el servidor.'

    // Sesión expirada en rutas protegidas (no en el login, que devuelve 401 por credenciales).
    if (status === 401 && !url.includes('auth/login')) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('gccon_user')
      if (!window.location.hash.includes('login')) {
        window.location.hash = '#/login'
      }
    }

    error.mensaje = mensaje
    return Promise.reject(error)
  },
)

export default api
