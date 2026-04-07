import { useState, useEffect } from 'react'
import { getProducts, createProduct, deleteProduct } from '../services/api'
import DetailPanel from '../components/DetailPanel'

function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: ''
  })

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    try {
      const response = await getProducts()
      setProducts(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock)
      })
      setForm({ name: '', description: '', price: '', stock: '' })
      setShowForm(false)
      fetchProducts()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Borrar este producto?')) return
    try {
      await deleteProduct(id)
      setSelected(null)
      fetchProducts()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} productos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </div>

      {/* form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Nuevo producto</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Descripcion"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Precio"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
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

      {/* tabla p desktop*/}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripcion</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr
                key={product.id}
                onClick={() => setSelected(product)}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-800">{product.name}</td>
                <td className="px-6 py-4 text-gray-500">{product.description || '—'}</td>
                <td className="px-6 py-4 text-gray-800">${product.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {product.stock} unidades
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay productos todavía</div>
        )}
      </div>

      {/* cards p mobile */}
      <div className="md:hidden space-y-3">
        {products.map(product => (
          <div
            key={product.id}
            onClick={() => setSelected(product)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}>
                {product.stock} unidades
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">{product.description || '—'}</p>
            <p className="text-gray-800 font-medium">${product.price}</p>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay productos todavía</div>
        )}
      </div>

      {/* detail panel*/}
      <DetailPanel
        item={selected}
        title="Product Details"
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
        fields={[
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
          { key: 'price', label: 'Price', format: (v) => `Gs. ${v}` },
          { key: 'stock', label: 'Stock', format: (v) => `${v} unidades` },
          { key: 'createdAt', label: 'Created', format: (v) => new Date(v).toLocaleDateString() },
        ]}
      />
    </div>
  )
}

export default InventoryPage