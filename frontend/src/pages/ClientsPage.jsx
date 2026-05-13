import { useState, useEffect } from 'react'
import { getClients, createClient, updateClient, deleteClient, addVehicle } from '../services/api'
import { useToast } from '../context/ToastContext'

function ClientsPage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' })
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({ brand: '', model: '', year: '', plate: '' })
  const { addToast } = useToast()

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
      addToast('Cliente creado correctamente')
    } catch (error) {
      console.error(error)
    }
  }

  function openPanel(client) {
    setSelected(client)
    setEditForm({ name: client.name, phone: client.phone || '', email: client.email || '' })
    setIsEditing(false)
    setShowVehicleForm(false)
    setVehicleForm({ brand: '', model: '', year: '', plate: '' })
  }

  async function handleSave(e) {
    e.preventDefault()
    try {
      await updateClient(selected.id, editForm)
      const response = await getClients()
      setClients(response.data)
      const updated = response.data.find(c => c.id === selected.id)
      if (updated) setSelected(updated)
      setIsEditing(false)
      addToast('Cliente actualizado correctamente')
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Borrar este cliente?')) return
    try {
      await deleteClient(id)
      setSelected(null)
      fetchClients()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleAddVehicle(e) {
    e.preventDefault()
    try {
      await addVehicle(selected.id, {
        brand: vehicleForm.brand,
        model: vehicleForm.model,
        year: vehicleForm.year ? Number(vehicleForm.year) : null,
        plate: vehicleForm.plate || null,
      })
      const response = await getClients()
      setClients(response.data)
      const updated = response.data.find(c => c.id === selected.id)
      if (updated) setSelected(updated)
      setVehicleForm({ brand: '', model: '', year: '', plate: '' })
      setShowVehicleForm(false)
      addToast('Vehículo agregado correctamente')
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
          {showForm ? 'Cancelar' : '+ Agregar'}
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
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehículos</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Desde</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr
                key={client.id}
                onClick={() => openPanel(client)}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800">{client.name}</td>
                <td className="px-6 py-4 text-gray-500">{client.phone || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{client.email || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{client.vehicles?.length || 0}</td>
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
            onClick={() => openPanel(client)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-800">{client.name}</h3>
              <p className="text-gray-400 text-xs">{new Date(client.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="text-gray-500 text-sm">{client.phone || '—'}</p>
            <p className="text-gray-500 text-sm">{client.email || '—'}</p>
            {(client.vehicles?.length > 0) && (
              <p className="text-gray-400 text-xs mt-1">{client.vehicles.length} vehículo{client.vehicles.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        ))}
        {clients.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay clientes todavía.</div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setSelected(null)} />
          <div className="relative w-full md:w-96 bg-white h-full shadow-xl flex flex-col z-10">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Detalles de cliente</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-auto">
              {isEditing ? (
                <form id="client-edit-form" onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Nombre</label>
                    <input
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Telefono</label>
                    <input
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Nombre</p>
                    <p className="text-gray-800 mt-1 font-medium">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Telefono</p>
                    <p className="text-gray-800 mt-1 font-medium">{selected.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</p>
                    <p className="text-gray-800 mt-1 font-medium">{selected.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Cliente desde</p>
                    <p className="text-gray-800 mt-1 font-medium">{new Date(selected.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehículos</p>
                  {!isEditing && (
                    <button
                      onClick={() => setShowVehicleForm(!showVehicleForm)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                    >
                      {showVehicleForm ? 'Cancelar' : '+ Agregar'}
                    </button>
                  )}
                </div>

                {showVehicleForm && (
                  <form onSubmit={handleAddVehicle} className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      placeholder="Marca *"
                      value={vehicleForm.brand}
                      onChange={e => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Modelo *"
                      value={vehicleForm.model}
                      onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Año"
                        type="number"
                        value={vehicleForm.year}
                        onChange={e => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        placeholder="Chapa"
                        value={vehicleForm.plate}
                        onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Guardar vehículo
                    </button>
                  </form>
                )}

                {selected.vehicles?.length > 0 ? (
                  <div className="space-y-2">
                    {selected.vehicles.map(v => (
                      <div key={v.id} className="bg-gray-50 rounded-lg px-3 py-2.5 text-sm">
                        <p className="font-medium text-gray-800">{v.brand} {v.model}{v.year ? ` (${v.year})` : ''}</p>
                        {v.plate && <p className="text-gray-500 text-xs mt-0.5">Chapa: {v.plate}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Sin vehículos registrados.</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t space-y-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    form="client-edit-form"
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
                >
                  Editar
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
                >
                  Borrar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientsPage
