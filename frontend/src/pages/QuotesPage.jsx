import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { getQuotes, getClients, getProducts, createQuote, createProduct, createClient, updateQuote, deleteQuote, addVehicle } from '../services/api'
import { useToast } from '../context/ToastContext'

const SECTIONS = [
  { key: 'servicio', label: 'Servicios' },
  { key: 'parte', label: 'Partes/Repuestos' },
  { key: 'otro', label: 'Otros' },
]

function statusBadge(status) {
  if (status === 'pendiente') return 'bg-yellow-100 text-yellow-700'
  if (status === 'aprobado') return 'bg-orange-100 text-orange-700'
  if (status === 'finiquitado') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-600'
}

let _rid = 0
function makeRow() {
  return { id: ++_rid, productId: null, productName: '', search: '', description: '', quantity: 1, unitPrice: '' }
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
  const [sectionRows, setSectionRows] = useState(emptyRows)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const { addToast } = useToast()

  const [clientSearch, setClientSearch] = useState('')
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [isNewClient, setIsNewClient] = useState(false)
  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '' })

  const [selectedVehicleId, setSelectedVehicleId] = useState(null)
  const [isNewVehicle, setIsNewVehicle] = useState(false)
  const [newVehicleForm, setNewVehicleForm] = useState({ brand: '', model: '', year: '', plate: '' })

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

  function resetForm() {
    setClientSearch('')
    setSelectedClient(null)
    setIsNewClient(false)
    setNewClientForm({ name: '', phone: '', email: '' })
    setSelectedVehicleId(null)
    setIsNewVehicle(false)
    setNewVehicleForm({ brand: '', model: '', year: '', plate: '' })
    setSectionRows(emptyRows())
  }

  function selectClient(client) {
    setSelectedClient(client)
    setClientSearch(client.name)
    setClientDropdownOpen(false)
    setSelectedVehicleId(null)
    setIsNewVehicle(false)
    setNewVehicleForm({ brand: '', model: '', year: '', plate: '' })
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
    updateRow(cat, id, {
      productId: product.id,
      productName: product.name,
      search: product.name,
      unitPrice: product.price || ''
    })
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

    let resolvedClientId = selectedClient?.id

    if (isNewClient) {
      if (!newClientForm.name) return
      const res = await createClient(newClientForm)
      resolvedClientId = res.data.id
    }

    if (!resolvedClientId) return

    let resolvedVehicleId = isNewVehicle ? null : (selectedVehicleId || null)

    if (isNewVehicle && newVehicleForm.brand && newVehicleForm.model) {
      const res = await addVehicle(resolvedClientId, {
        brand: newVehicleForm.brand,
        model: newVehicleForm.model,
        year: newVehicleForm.year ? Number(newVehicleForm.year) : null,
        plate: newVehicleForm.plate || null,
      })
      resolvedVehicleId = res.data.id
    }

    const allRows = SECTIONS.flatMap(section =>
      sectionRows[section.key]
        .filter(r => (r.productId || r.search.trim()) && Number(r.unitPrice) > 0)
        .map(r => ({ ...r, category: section.key }))
    )

    if (!allRows.length) return

    await Promise.all(
      allRows
        .filter(r => !r.productId && r.search.trim())
        .map(async r => {
          const res = await createProduct({ name: r.search.trim(), category: r.category, price: 0, stock: 0 })
          r.productId = res.data.id
        })
    )

    const items = allRows.map(r => ({
      productId: r.productId,
      quantity: Number(r.quantity),
      unitPrice: Number(r.unitPrice),
      description: r.description || null,
    }))

    try {
      await createQuote({ clientId: resolvedClientId, vehicleId: resolvedVehicleId, items })
      resetForm()
      setShowForm(false)
      fetchAll()
      addToast('Presupuesto creado correctamente')
    } catch (error) {
      console.error(error)
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await updateQuote(id, { status })
      setSelected(prev => ({ ...prev, status }))
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q))
      addToast(`Estado actualizado: ${status}`)
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
    const pageW = 210
    const ml = 20
    const mr = 190
    const cx = pageW / 2
    let y = 18

    doc.setFont('times', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(20)
    doc.text('Taller Mecánico "RAMÍREZ"', cx, y, { align: 'center' })
    y += 7

    doc.setFont('helvetica', 'normal')
    const headerLines = [
      { text: 'de Rubén Darío Ramírez Ovelar', size: 9 },
      { text: 'TÉCNICO ESPECIALIZADO EN JAPÓN', size: 8 },
      { text: 'MANTENIMIENTO Y REPARACIÓN MECÁNICA DE VEHÍCULOS', size: 8 },
      { text: 'Servicio Especializado en Nissan Diesel · Toyota · Mitsubishi · Mazda', size: 8 },
      { text: 'Isuzu · Hino · Mercedes Benz · Motores en gral.', size: 8 },
      { text: 'Dr. Sosa 118 c/ Av. Def. del Chaco - Zona Sur', size: 8 },
      { text: 'Fernando de la Mora - Paraguay', size: 8 },
      { text: 'Tel: (0981) 988 382', size: 9 },
    ]
    for (const line of headerLines) {
      doc.setFontSize(line.size)
      doc.setTextColor(50)
      doc.text(line.text, cx, y, { align: 'center' })
      y += 5
    }

    y += 2
    doc.setDrawColor(150)
    doc.setLineWidth(0.5)
    doc.line(ml, y, mr, y)
    y += 8

    const presTitle = quote.vehicle
      ? `Presupuesto - ${quote.vehicle.brand} ${quote.vehicle.model}${quote.vehicle.year ? ' ' + quote.vehicle.year : ''}`
      : `Presupuesto #${quote.id}`
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(20)
    doc.text(presTitle, ml, y)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80)
    const d = new Date(quote.createdAt)
    const dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
    doc.text(dateStr, ml, y)
    y += 10

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(20)
    doc.text('Cliente', ml, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(quote.client.name, ml, y)
    y += 5
    if (quote.client.phone) { doc.text(quote.client.phone, ml, y); y += 5 }
    if (quote.client.email) { doc.text(quote.client.email, ml, y); y += 5 }
    y += 6

    const PDF_LABELS = { servicio: 'SERVICIOS', parte: 'PARTES / REPUESTOS', otro: 'OTROS' }
    const grouped = SECTIONS.map(s => ({
      ...s,
      pdfLabel: PDF_LABELS[s.key],
      items: quote.items.filter(i => i.product.category === s.key)
    })).filter(s => s.items.length > 0)

    for (const section of grouped) {
      if (y > 260) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(60)
      doc.text(section.pdfLabel, ml, y)
      y += 4
      doc.setDrawColor(180)
      doc.setLineWidth(0.3)
      doc.line(ml, y, mr, y)
      y += 5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(20)
      for (const item of section.items) {
        if (y > 270) { doc.addPage(); y = 20 }
        const nameText = item.product.name.length > 30 ? item.product.name.slice(0, 30) + '…' : item.product.name
        doc.setTextColor(20)
        doc.text(nameText, ml, y)
        if (item.description) {
          const nameW = doc.getTextWidth(nameText)
          const descX = ml + nameW + 1.5
          const maxDescW = 112 - descX
          if (maxDescW > 4) {
            let desc = item.description
            while (doc.getTextWidth(desc) > maxDescW && desc.length > 1) desc = desc.slice(0, -1)
            if (desc.length < item.description.length) desc = desc.slice(0, -1) + '…'
            doc.setTextColor(140)
            doc.text(desc, descX, y)
            doc.setTextColor(20)
          }
        }
        doc.text(`${item.quantity} x Gs. ${Number(item.unitPrice).toLocaleString()}`, 120, y)
        doc.text(`Gs. ${(item.unitPrice * item.quantity).toLocaleString()}`, mr, y, { align: 'right' })
        y += 6
      }
      y += 5
    }

    if (y > 265) { doc.addPage(); y = 20 }
    doc.setDrawColor(150)
    doc.setLineWidth(0.5)
    doc.line(ml, y, mr, y)
    y += 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(20)
    doc.text('TOTAL', ml, y)
    doc.text(`Gs. ${Number(quote.total).toLocaleString()}`, mr, y, { align: 'right' })

    doc.save(`presupuesto-${quote.id}.pdf`)
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>

  const filteredClients = clients.filter(c =>
    !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase())
  ).slice(0, 8)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Presupuestos</h1>
          <p className="text-gray-500 text-sm mt-1">{quotes.length} presupuestos</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-700 mb-5">Nuevo presupuesto</h2>
          <form onSubmit={handleSubmit}>

            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cliente</label>
              {isNewClient ? (
                <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Nuevo cliente</p>
                  <input
                    placeholder="Nombre *"
                    value={newClientForm.name}
                    onChange={e => setNewClientForm({ ...newClientForm, name: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <input
                    placeholder="Teléfono"
                    value={newClientForm.phone}
                    onChange={e => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={newClientForm.email}
                    onChange={e => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => { setIsNewClient(false); setNewClientForm({ name: '', phone: '', email: '' }) }}
                    className="text-gray-500 hover:text-gray-700 text-xs"
                  >
                    ← Buscar cliente existente
                  </button>
                </div>
              ) : (
                <div className="relative w-full md:w-80">
                  <input
                    value={selectedClient ? selectedClient.name : clientSearch}
                    onChange={e => {
                      setClientSearch(e.target.value)
                      setSelectedClient(null)
                      setClientDropdownOpen(true)
                      setSelectedVehicleId(null)
                      setIsNewVehicle(false)
                    }}
                    onFocus={() => setClientDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setClientDropdownOpen(false), 150)}
                    placeholder="Buscar cliente por nombre…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {clientDropdownOpen && !selectedClient && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-auto">
                      {filteredClients.map(c => (
                        <div
                          key={c.id}
                          onMouseDown={() => selectClient(c)}
                          className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                        >
                          {c.name}
                        </div>
                      ))}
                      <div
                        onMouseDown={() => { setIsNewClient(true); setClientDropdownOpen(false); setClientSearch('') }}
                        className="px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 cursor-pointer border-t border-gray-100"
                      >
                        + Agregar nuevo cliente
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedClient && !isNewClient && (
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Vehículo</label>
                {isNewVehicle ? (
                  <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200 w-full md:w-80">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Nuevo vehículo</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="Marca *"
                        value={newVehicleForm.brand}
                        onChange={e => setNewVehicleForm({ ...newVehicleForm, brand: e.target.value })}
                        required
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <input
                        placeholder="Modelo *"
                        value={newVehicleForm.model}
                        onChange={e => setNewVehicleForm({ ...newVehicleForm, model: e.target.value })}
                        required
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <input
                        placeholder="Año"
                        type="number"
                        value={newVehicleForm.year}
                        onChange={e => setNewVehicleForm({ ...newVehicleForm, year: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <input
                        placeholder="Chapa"
                        value={newVehicleForm.plate}
                        onChange={e => setNewVehicleForm({ ...newVehicleForm, plate: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsNewVehicle(false); setNewVehicleForm({ brand: '', model: '', year: '', plate: '' }) }}
                      className="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      ← Cancelar
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedVehicleId || ''}
                    onChange={e => {
                      const val = e.target.value
                      if (val === 'new') {
                        setIsNewVehicle(true)
                        setSelectedVehicleId(null)
                      } else {
                        setSelectedVehicleId(val ? Number(val) : null)
                      }
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin vehículo</option>
                    {selectedClient.vehicles?.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model}{v.year ? ` (${v.year})` : ''}{v.plate ? ` · ${v.plate}` : ''}
                      </option>
                    ))}
                    <option value="new">+ Agregar nuevo vehículo</option>
                  </select>
                )}
              </div>
            )}

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
                          <div className="relative w-full md:w-40 shrink-0">
                            <input
                              value={row.search}
                              onChange={e => handleSearchChange(section.key, row.id, e.target.value)}
                              onFocus={() => setActiveDropdown(dropKey)}
                              onBlur={() => setTimeout(() => setActiveDropdown(null), 150)}
                              placeholder="Buscar…"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {activeDropdown === dropKey && filtered.length > 0 && (
                              <div className="absolute top-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-44 overflow-auto">
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
                            value={row.description}
                            onChange={e => updateRow(section.key, row.id, { description: e.target.value })}
                            placeholder="Descripción"
                            className="w-full md:flex-1 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
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
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehículo</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
              <th className="px-3 py-3"></th>
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
                <td className="px-6 py-4 text-gray-500">
                  {quote.vehicle ? `${quote.vehicle.brand} ${quote.vehicle.model}` : '—'}
                </td>
                <td className="px-6 py-4 text-gray-500">{quote.items.length} items</td>
                <td className="px-6 py-4 font-semibold text-gray-800">Gs. {Number(quote.total).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(quote.status)}`}>
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(quote.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-4">
                  <button
                    onClick={e => { e.stopPropagation(); handleDownloadPDF(quote) }}
                    title="Descargar PDF"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                </td>
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
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-mono text-sm">#{quote.id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(quote.status)}`}>
                  {quote.status}
                </span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleDownloadPDF(quote) }}
                title="Descargar PDF"
                className="text-gray-400 hover:text-blue-600 transition-colors px-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
            </div>
            <h3 className="font-semibold text-gray-800 mb-0.5">{quote.client.name}</h3>
            {quote.vehicle && (
              <p className="text-gray-500 text-xs mb-1">{quote.vehicle.brand} {quote.vehicle.model}</p>
            )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col z-10 max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Presupuesto #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            <div className="flex-1 p-6 overflow-auto space-y-5">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Cliente</p>
                <p className="text-gray-800 font-semibold">{selected.client.name}</p>
                {selected.client.phone && <p className="text-gray-500 text-sm mt-0.5">{selected.client.phone}</p>}
                {selected.client.email && <p className="text-gray-500 text-sm">{selected.client.email}</p>}
              </div>

              {selected.vehicle && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Vehículo</p>
                  <p className="text-gray-800 font-semibold">
                    {selected.vehicle.brand} {selected.vehicle.model}{selected.vehicle.year ? ` (${selected.vehicle.year})` : ''}
                  </p>
                  {selected.vehicle.plate && (
                    <p className="text-gray-500 text-sm mt-0.5">Chapa: {selected.vehicle.plate}</p>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Estado</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusBadge(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              {SECTIONS.map(section => {
                const sItems = selected.items.filter(i => i.product.category === section.key)
                if (!sItems.length) return null
                return (
                  <div key={section.key}>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{section.label}</p>
                    <div className="space-y-1.5">
                      {sItems.map(item => (
                        <div key={item.id} className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-700 font-medium">{item.product.name}</p>
                              {item.description && (
                                <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-gray-400 text-xs">x{item.quantity} · Gs. {Number(item.unitPrice).toLocaleString()}</p>
                              <p className="font-medium text-gray-800">Gs. {(item.unitPrice * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
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
              {selected.status !== 'aprobado' && (
                <button
                  onClick={() => handleStatusChange(selected.id, 'aprobado')}
                  className="w-full py-2 px-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 font-medium text-sm transition-colors"
                >
                  Marcar como Aprobado
                </button>
              )}
              {selected.status !== 'finiquitado' && (
                <button
                  onClick={() => handleStatusChange(selected.id, 'finiquitado')}
                  className="w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm transition-colors"
                >
                  Marcar como Finiquitado
                </button>
              )}
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
