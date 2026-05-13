import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api'
import DetailPanel from '../components/DetailPanel'
import { useToast } from '../context/ToastContext'

const TABS = [
  { key: 'servicio', label: 'Servicios' },
  { key: 'parte', label: 'Partes/Repuestos' },
  { key: 'otro', label: 'Otros' },
]

function ServiciosPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('servicio')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'servicio' })
  const { addToast } = useToast()

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    try {
      const res = await getProducts()
      setProducts(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab)
    setShowForm(false)
    setSelected(null)
    setForm({ name: '', description: '', price: '', category: tab })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: 0,
        category: form.category,
      })
      setForm({ name: '', description: '', price: '', category: activeTab })
      setShowForm(false)
      fetchProducts()
      addToast('Item creado correctamente')
    } catch (error) {
      console.error(error)
    }
  }

  async function handleEdit(id, data) {
    try {
      await updateProduct(id, {
        name: data.name,
        description: data.description,
        price: Number(data.price),
      })
      const res = await getProducts()
      setProducts(res.data)
      const updated = res.data.find(p => p.id === id)
      if (updated) setSelected(updated)
      addToast('Item actualizado correctamente')
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Borrar este item?')) return
    try {
      await deleteProduct(id)
      setSelected(null)
      fetchProducts()
    } catch (error) {
      console.error(error)
    }
  }

  const filtered = products.filter(p => p.category === activeTab)
  const activeLabel = TABS.find(t => t.key === activeTab)?.label

  if (loading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Servicios</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} items en {activeLabel}</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setForm({ name: '', description: '', price: '', category: activeTab })
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Nuevo item — {activeLabel}</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Nombre"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Descripcion"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Precio"
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Guardar
          </button>
        </form>
      )}

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripcion</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr
                key={product.id}
                onClick={() => setSelected(product)}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                <td className="px-6 py-4 text-gray-500">{product.description || '—'}</td>
                <td className="px-6 py-4 text-gray-800">Gs. {product.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay items en {activeLabel}</div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(product => (
          <div
            key={product.id}
            onClick={() => setSelected(product)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
            <p className="text-gray-500 text-sm">{product.description || '—'}</p>
            <p className="text-gray-800 font-medium mt-1">Gs. {product.price.toLocaleString()}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay items en {activeLabel}</div>
        )}
      </div>

      <DetailPanel
        item={selected}
        title={`Detalle — ${TABS.find(t => t.key === selected?.category)?.label || ''}`}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
        onSave={handleEdit}
        fields={[
          { key: 'name', label: 'Nombre' },
          { key: 'description', label: 'Descripcion' },
          { key: 'price', label: 'Precio', format: v => `Gs. ${Number(v).toLocaleString()}` },
          { key: 'createdAt', label: 'Creado', format: v => new Date(v).toLocaleDateString() },
        ]}
        editableFields={[
          { key: 'name', label: 'Nombre', type: 'text', required: true },
          { key: 'description', label: 'Descripcion', type: 'text' },
          { key: 'price', label: 'Precio', type: 'number', required: true },
        ]}
      />
    </div>
  )
}

export default ServiciosPage
