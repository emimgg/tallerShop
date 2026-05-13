import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const loginUser = (data) => api.post('/auth/login', data)

export const getProducts = () => api.get('/servicios')
export const createProduct = (data) => api.post('/servicios', data)
export const updateProduct = (id, data) => api.put(`/servicios/${id}`, data)
export const deleteProduct = (id) => api.delete(`/servicios/${id}`)

export const getClients = () => api.get('/clients')
export const createClient = (data) => api.post('/clients', data)
export const updateClient = (id, data) => api.put(`/clients/${id}`, data)
export const deleteClient = (id) => api.delete(`/clients/${id}`)

export const getQuotes = () => api.get('/quotes')
export const createQuote = (data) => api.post('/quotes', data)
export const updateQuote = (id, data) => api.put(`/quotes/${id}`, data)
export const deleteQuote = (id) => api.delete(`/quotes/${id}`)