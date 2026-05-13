import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

function Layout({ children }) {
  const location = useLocation()
  const { logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

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
          <h1 className="text-xl font-bold tracking-wide">Taller Ramírez</h1>
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
        <footer className="p-4 border-t border-gray-700 space-y-2">
          <p className="text-gray-400 text-xs">Taller Ramírez</p>
          {installPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 text-gray-300 hover:text-white text-xs transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Instalar app
            </button>
          )}
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white text-xs transition-colors block"
          >
            Cerrar sesión
          </button>
        </footer>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">Taller Ramírez</h1>
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
            {installPrompt && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:text-white text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Instalar app
              </button>
            )}
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
