import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Layout({ children }) {
  const location = useLocation()
  const { logout } = useAuth()

  const links = [
    { to: '/inventory', label: 'Inventory' },
    { to: '/clients', label: 'Clients' },
    { to: '/quotes', label: 'Quotes' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-wide">Taller Pablito</h1>
          <p className="text-gray-400 text-sm mt-1">Management System</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <p className="text-gray-400 text-xs mb-2">TallerShop v1.0</p>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-white text-xs transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout