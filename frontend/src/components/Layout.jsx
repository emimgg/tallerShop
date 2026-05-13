import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

function Layout({ children }) {
  const location = useLocation()
  const { logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/servicios', label: 'Servicios', icon: '🔧' },
    { to: '/clients', label: 'Clientes', icon: '👥' },
    { to: '/quotes', label: 'Presupuestos', icon: '📋' },
  ]

  function isActive(to) {
    if (to === '/') return location.pathname === '/'
    return location.pathname === to
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col">
        <header className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-wide">Taller Loremipsum</h1>
          <p className="text-gray-400 text-sm mt-1">Sistema de manejo</p>
        </header>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <footer className="p-4 border-t border-gray-700">
          <p className="text-gray-400 text-xs mb-2">TallerShop beta</p>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white text-xs transition-colors"
          >
            Cerrar sesión
          </button>
        </footer>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">Taller Loremipsum</h1>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </header>
        {menuOpen && (
          <nav className="md:hidden bg-gray-800 text-white px-4 py-2 space-y-1 z-50">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="w-full text-left px-4 py-3 text-gray-400 hover:text-white text-sm"
            >
              Cerrar sesión
            </button>
          </nav>
        )}
        <main className="flex-1 overflow-auto">
          <section className="p-4 md:p-8">
            {children}
          </section>
        </main>
      </div>
    </div>
  )
}

export default Layout
