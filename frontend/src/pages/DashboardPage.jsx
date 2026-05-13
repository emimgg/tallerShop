import { useState, useEffect } from 'react'
import { getClients, getQuotes } from '../services/api'

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
  const [pendingQuotes, setPendingQuotes] = useState([])
  const [approvedQuotes, setApprovedQuotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [clientsRes, quotesRes] = await Promise.all([
          getClients(), getQuotes()
        ])
        const clients = clientsRes.data
        const quotes = quotesRes.data
        const pending = quotes.filter(q => q.status === 'pendiente')
        const approved = quotes.filter(q => q.status === 'aprobado')

        setStats({
          totalClients: clients.length,
          totalQuotes: quotes.length,
          pendingCount: pending.length,
          approvedCount: approved.length,
        })
        setPendingQuotes(pending)
        setApprovedQuotes(approved)
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
        <StatCard title="Clientes" value={stats.totalClients} colorClass="text-blue-600" />
        <StatCard title="Presupuestos" value={stats.totalQuotes} colorClass="text-gray-700" />
        <StatCard title="Pendientes" value={stats.pendingCount} colorClass="text-yellow-600" />
        <StatCard title="Aprobados" value={stats.approvedCount} colorClass="text-orange-600" />
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Pendientes</h2>
          {pendingQuotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-8 text-center text-gray-400 text-sm">
              No hay presupuestos pendientes.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {pendingQuotes.map(q => (
                <div key={q.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{q.client.name}</p>
                    {q.vehicle && (
                      <p className="text-gray-400 text-xs">{q.vehicle.brand} {q.vehicle.model}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 text-sm">Gs. {Number(q.total).toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">{new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Aprobados</h2>
          {approvedQuotes.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-8 text-center text-gray-400 text-sm">
              No hay presupuestos aprobados.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {approvedQuotes.map(q => (
                <div key={q.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{q.client.name}</p>
                    {q.vehicle && (
                      <p className="text-gray-400 text-xs">{q.vehicle.brand} {q.vehicle.model}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 text-sm">Gs. {Number(q.total).toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">{new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default DashboardPage
