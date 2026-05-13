import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ServiciosPage from './pages/ServiciosPage'
import ClientsPage from './pages/ClientsPage'
import QuotesPage from './pages/QuotesPage'

function ProtectedRoutes() {
  const { token } = useAuth()

  if (!token) return <Navigate to="/login" />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/servicios" element={<ServiciosPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
