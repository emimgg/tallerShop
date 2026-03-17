import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import InventoryPage from './pages/InventoryPage'
import ClientsPage from './pages/ClientsPage'
import QuotesPage from './pages/QuotesPage'

function ProtectedRoutes() {
  const { token } = useAuth()

  if (!token) return <Navigate to="/login" />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/inventory" />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App