import { useState, useEffect } from 'react'
import { getQuotes, getClients, getProducts, createQuote, deleteQuote } from '../services/api'

function QuotesPage() {
  const [quotes, setQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [clientId, setClientId] = useState('')
  const [items, setItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0 }
  ])

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const [quotesRes, clientsRes, productsRes] = await Promise.all([
        getQuotes(),
        getClients(),
        getProducts()
      ])
      setQuotes(quotesRes.data)
      setClients(clientsRes.data)
      setProducts(productsRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function handleItemChange(index, field, value) {
    const updated = [...items]
    updated[index][field] = value

    // auto fill price when product is selected
    if (field === 'productId') {
      const product = products.find(p => p.id === Number(value))
      if (product) updated[index].unitPrice = product.price
    }

    setItems(updated)
  }

  function addItem() {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }])
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((sum, item) => {
    return sum + item.unitPrice * Number(item.quantity)
  }, 0)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await createQuote({
        clientId: Number(clientId),
        items: items.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      })
      setClientId('')
      setItems([{ productId: '', quantity: 1, unitPrice: 0 }])
      setShowForm(false)
      fetchAll()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this quote?')) return
    try {
      await deleteQuote(id)
      setSelected(null)
      fetchAll()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quotes</h1>
          <p className="text-gray-500 text-sm mt-1">{quotes.length} quotes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Quote'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-700 mb-4">New Quote</h2>
          <form onSubmit={handleSubmit}>
            {/* Client selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Items */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Products
              </label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Price"
                    />
                    <span className="text-sm text-gray-500 w-20 text-right">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 text-lg font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add product
              </button>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-4">
              <div className="bg-gray-50 rounded-lg px-6 py-3 text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-gray-800">${total.toFixed(2)}</p>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Save Quote
            </button>
          </form>
        </div>
      )}

      {/* Quotes table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(quote => (
              <tr
                key={quote.id}
                onClick={() => setSelected(quote)}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-gray-400 font-mono">#{quote.id}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{quote.client.name}</td>
                <td className="px-6 py-4 text-gray-500">{quote.items.length} items</td>
                <td className="px-6 py-4 font-semibold text-gray-800">${quote.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quote.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-600'
                      : quote.status === 'done'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {quotes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No quotes yet. Create your first one!
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setSelected(null)} />
          <div className="relative w-96 bg-white h-full shadow-xl flex flex-col z-10">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Quote #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            <div className="flex-1 p-6 overflow-auto space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Client</p>
                <p className="text-gray-800 font-medium mt-1">{selected.client.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
                <p className="text-gray-800 font-medium mt-1">{selected.status}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Products</p>
                <div className="space-y-2">
                  {selected.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-700">{item.product.name} x{item.quantity}</span>
                      <span className="font-medium text-gray-800">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <p className="font-semibold text-gray-700">Total</p>
                  <p className="font-bold text-gray-800 text-lg">${selected.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t">
              <button
                onClick={() => handleDelete(selected.id)}
                className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
              >
                Delete Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuotesPage