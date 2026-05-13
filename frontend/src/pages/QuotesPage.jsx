import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { getQuotes, getClients, getProducts, createQuote, deleteQuote } from '../services/api'
import { useToast } from '../context/ToastContext'

const SECTIONS = [
  { key: 'servicio', label: 'Servicios' },
  { key: 'parte', label: 'Partes/Repuestos' },
  { key: 'otro', label: 'Otros' },
]

let _rid = 0
function makeRow() {
  return { id: ++_rid, productId: null, productName: '', search: '', quantity: 1, unitPrice: '' }
}

function emptyRows() {
  return { servicio: [makeRow()], parte: [makeRow()], otro: [makeRow()] }
}

function QuotesPage() {
  const [quotes, setQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [clientId, setClientId] = useState('')
  const [sectionRows, setSectionRows] = useState(emptyRows)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const { addToast } = useToast()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
      const [quotesRes, clientsRes, productsRes] = await Promise.all([
        getQuotes(), getClients(), getProducts()
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

  function updateRow(cat, id, fields) {
    setSectionRows(prev => ({
      ...prev,
      [cat]: prev[cat].map(r => r.id === id ? { ...r, ...fields } : r)
    }))
  }

  function handleSearchChange(cat, id, value) {
    updateRow(cat, id, { search: value, productId: null, productName: '' })
  }

  function selectProduct(cat, id, product) {
    updateRow(cat, id, { productId: product.id, productName: product.name, search: product.name })
    setActiveDropdown(null)
  }

  function addRow(cat) {
    setSectionRows(prev => ({ ...prev, [cat]: [...prev[cat], makeRow()] }))
  }

  function removeRow(cat, id) {
    setSectionRows(prev => ({
      ...prev,
      [cat]: prev[cat].length > 1 ? prev[cat].filter(r => r.id !== id) : [makeRow()]
    }))
  }

  const total = Object.values(sectionRows).flat().reduce(
    (sum, r) => sum + (Number(r.unitPrice) || 0) * (Number(r.quantity) || 0), 0
  )

  async function handleSubmit(e) {
    e.preventDefault()
    const items = Object.values(sectionRows).flat()
      .filter(r => r.productId && Number(r.unitPrice) > 0)
      .map(r => ({ productId: r.productId, quantity: Number(r.quantity), unitPrice: Number(r.unitPrice) }))
    if (!items.length) return
    try {
      await createQuote({ clientId: Number(clientId), items })
      setClientId('')
      setSectionRows(emptyRows())
      setShowForm(false)
      fetchAll()
      addToast('Presupuesto creado correctamente')
    } catch (error) {
      console.error(error)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Borrar este presupuesto?')) return
    try {
      await deleteQuote(id)
      setSelected(null)
      fetchAll()
    } catch (error) {
      console.error(error)
    }
  }

  function handleDownloadPDF(quote) {
    const doc = new jsPDF()
    const ml = 20
    let y = 20

    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(30)
    doc.text('Taller Loremipsum', ml, y)
    y += 8
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(120)
    doc.text(`Presupuesto #${quote.id}  ·  ${new Date(quote.createdAt).toLocaleDateString()}`, ml, y)
    y += 12

    doc.setTextColor(30)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('Cliente', ml, y)
    y += 6
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(quote.client.name, ml, y)
    if (quote.client.phone) { y += 5; doc.text(quote.client.phone, ml, y) }
    if (quote.client.email) { y += 5; doc.text(quote.client.email, ml, y) }
    y += 12

    const grouped = SECTIONS.map(s => ({
      ...s,
      items: quote.items.filter(i => i.product.category === s.key)
    })).filter(s => s.items.length > 0)

    for (const section of grouped) {
      doc.setFontSize(9)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(100)
      doc.text(section.label.toUpperCase(), ml, y)
      y += 4
      doc.setDrawColor(200)
      doc.line(ml, y, 190, y)
      y += 6

      doc.setFont(undefined, 'normal')
      doc.setTextColor(30)
      for (const item of section.items) {
        const name = item.product.name.length > 44 ? item.product.name.slice(0, 44) + '…' : item.product.name
        doc.text(name, ml, y)
        doc.text(`x${item.quantity}`, 128, y)
        doc.text(`Gs. ${Number(item.unitPrice).toLocaleString()}`, 143, y)
        doc.text(`Gs. ${(item.unitPrice * item.quantity).toLocaleString()}`, 170, y)
        y += 7
      }
      y += 4
    }

    doc.setDrawColor(180)
    doc.line(ml, y, 190, y)
    y += 8
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Total:', 143, y)
    doc.text(`Gs. ${Number(quote.total).toLocaleString()}`, 170, y)

    doc.save(`presupuesto-${quote.id}.pdf`)
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Presupuestos</h1>
          <p className="text-gray-500 text-sm mt-1">{quotes.length} presupuestos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-700 mb-5">Nuevo presupuesto</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cliente</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {SECTIONS.map(section => {
              const catProducts = products.filter(p => p.category === section.key)
              const rows = sectionRows[section.key]
              return (
                <div key={section.key} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                    {section.label}
                  </h3>
                  <div className="space-y-2">
                    {rows.map(row => {
                      const dropKey = `${section.key}-${row.id}`
                      const filtered = catProducts.filter(p =>
                        !row.search || p.name.toLowerCase().includes(row.search.toLowerCase())
                      ).slice(0, 8)
                      return (
                        <div key={row.id} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
                          <div className="relative w-full md:flex-1">
                            <input
                              value={row.search}
                              onChange={e => handleSearchChange(section.key, row.id, e.target.value)}
                              onFocus={() => setActiveDropdown(dropKey)}
                              onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                              placeholder={`Buscar en ${section.label}…`}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {activeDropdown === dropKey && filtered.length > 0 && (
                              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-44 overflow-auto">
                                {filtered.map(p => (
                                  <div
                                    key={p.id}
                                    onMouseDown={() => selectProduct(section.key, row.id, p)}
                                    className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                                  >
                                    {p.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={e => updateRow(section.key, row.id, { quantity: e.target.value })}
                            className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Qty"
                          />
                          <input
                            type="number"
                            min="0"
                            value={row.unitPrice}
                            onChange={e => updateRow(section.key, row.id, { unitPrice: e.target.value })}
                            className="w-28 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Precio"
                          />
                          <span className="text-sm text-gray-500 w-24 text-right tabular-nums shrink-0">
                            Gs. {((Number(row.unitPrice) || 0) * (Number(row.quantity) || 0)).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRow(section.key, row.id)}
                            className="text-red-400 hover:text-red-600 font-bold shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => addRow(section.key)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Agregar fila
                  </button>
                </div>
              )
            })}

            <div className="flex justify-end mb-5">
              <div className="bg-gray-50 rounded-lg px-6 py-3 text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-gray-800">Gs. {total.toLocaleString()}</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Guardar presupuesto
            </button>
          </form>
        </div>
      )}

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
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
                <td className="px-6 py-4 font-semibold text-gray-800">Gs. {Number(quote.total).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quote.status === 'pendiente' ? 'bg-yellow-100 text-yellow-600' :
                    quote.status === 'finiquitado' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(quote.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay presupuestos todavía.</div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {quotes.map(quote => (
          <div
            key={quote.id}
            onClick={() => setSelected(quote)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-mono text-sm">#{quote.id}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                quote.status === 'pendiente' ? 'bg-yellow-100 text-yellow-600' :
                quote.status === 'finiquitado' ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {quote.status}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{quote.client.name}</h3>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">{quote.items.length} items · {new Date(quote.createdAt).toLocaleDateString()}</p>
              <p className="font-bold text-gray-800">Gs. {Number(quote.total).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {quotes.length === 0 && (
          <div className="text-center py-12 text-gray-400">No hay presupuestos todavía.</div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setSelected(null)} />
          <div className="relative w-full md:w-[480px] bg-white h-full shadow-xl flex flex-col z-10">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Presupuesto #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            <div className="flex-1 p-6 overflow-auto space-y-5">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Cliente</p>
                <p className="text-gray-800 font-semibold">{selected.client.name}</p>
                {selected.client.phone && <p className="text-gray-500 text-sm mt-0.5">{selected.client.phone}</p>}
                {selected.client.email && <p className="text-gray-500 text-sm">{selected.client.email}</p>}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Estado</p>
                <p className="text-gray-800 font-medium mt-1">{selected.status}</p>
              </div>

              {SECTIONS.map(section => {
                const sItems = selected.items.filter(i => i.product.category === section.key)
                if (!sItems.length) return null
                return (
                  <div key={section.key}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{section.label}</p>
                    <div className="space-y-1.5">
                      {sItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-700 flex-1 mr-2">{item.product.name}</span>
                          <span className="text-gray-400 text-xs mr-3 shrink-0">
                            x{item.quantity} · Gs. {Number(item.unitPrice).toLocaleString()}
                          </span>
                          <span className="font-medium text-gray-800 shrink-0">
                            Gs. {(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-700">Total</p>
                  <p className="font-bold text-gray-800 text-lg">Gs. {Number(selected.total).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t space-y-2">
              <button
                onClick={() => handleDownloadPDF(selected)}
                className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
              >
                Descargar PDF
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors"
              >
                Borrar presupuesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuotesPage
