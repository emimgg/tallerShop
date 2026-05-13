import { useState, useEffect } from 'react'
import { getProducts, getClients, getQuotes } from '../services/api'

function StatCard({ title, value, colorClass }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</p>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}

function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [productsRes, clientsRes, quotesRes] = await Promise.all([
          getProducts(), getClients(), getQuotes()
        ])
        const products = productsRes.data
        const clients = clientsRes.data
        const quotes = quotesRes.data
        const low = products.filter(p => p.stock < 5)

        setStats({
          totalProducts: products.length,
          totalClients: clients.length,
          totalQuotes: quotes.length,
          lowStockCount: low.length
        })
        setLowStock(low)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <p className="text-gray-500">Cargando...</p>
  if (!stats) return <p className="text-gray-500">No se pudieron cargar los datos.</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen del sistema</p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Productos" value={stats.totalProducts} colorClass="text-blue-600" />
        <StatCard title="Clientes" value={stats.totalClients} colorClass="text-green-600" />
        <StatCard title="Presupuestos" value={stats.totalQuotes} colorClass="text-purple-600" />
        <StatCard title="Stock bajo" value={stats.lowStockCount} colorClass="text-red-600" />
      </section>

      {lowStock.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Productos con stock bajo</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(product => (
                  <tr key={product.id} className="border-b border-gray-100">
                    <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                        {product.stock} unidades
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {lowStock.length === 0 && (
        <section>
          <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-4 text-green-700 text-sm font-medium">
            Todos los productos tienen stock suficiente.
          </div>
        </section>
      )}
    </div>
  )
}

export default DashboardPage
