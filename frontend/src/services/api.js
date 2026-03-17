import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
})

// automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Inventory
export const getProducts = () => api.get('/inventory')
export const createProduct = (data) => api.post('/inventory', data)
export const updateProduct = (id, data) => api.put(`/inventory/${id}`, data)
export const deleteProduct = (id) => api.delete(`/inventory/${id}`)

// Clients
export const getClients = () => api.get('/clients')
export const createClient = (data) => api.post('/clients', data)
export const updateClient = (id, data) => api.put(`/clients/${id}`, data)
export const deleteClient = (id) => api.delete(`/clients/${id}`)

// Quotes
export const getQuotes = () => api.get('/quotes')
export const createQuote = (data) => api.post('/quotes', data)
export const updateQuote = (id, data) => api.put(`/quotes/${id}`, data)
export const deleteQuote = (id) => api.delete(`/quotes/${id}`)