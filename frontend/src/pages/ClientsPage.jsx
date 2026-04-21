import { useState, useEffect } from 'react'
import { getClients, createClient, deleteClient } from '../services/api'
import DetailPanel from '../components/DetailPanel'

function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  useEffect(() => { fetchClients() }, [])

  async function fetchClients() {
    try {
      const response = await getClients()
      setClients(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await createClient(form)
      setForm({ name: '', phone: '', email: '' })
      setShowForm(false)
      fetchClients()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this client?')) return
    try {
      await deleteClient(id)
      setSelected(null)
      fetchClients()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">{clients.length} clientes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Agregar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Nuevo cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Telefono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Guardar Cliente
          </button>
        </form>
      )}

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Teléfono</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Desde</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr
                key={client.id}
                onClick={() => setSelected(client)}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800">{client.name}</td>
                <td className="px-6 py-4 text-gray-500">{client.phone || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{client.email || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay clientes todavía.</div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {clients.map(client => (
          <div
            key={client.id}
            onClick={() => setSelected(client)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-800">{client.name}</h3>
              <p className="text-gray-400 text-xs">{new Date(client.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="text-gray-500 text-sm">{client.phone || '—'}</p>
            <p className="text-gray-500 text-sm">{client.email || '—'}</p>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay clientes todavía.</div>
        )}
      </div>

      <DetailPanel
        item={selected}
        title="Detalles de cliente"
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'createdAt', label: 'Cliente desde', format: (v) => new Date(v).toLocaleDateString() },
        ]}
      />
    </div>
  )
}

export default ClientsPage