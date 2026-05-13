const express = require('express')
const router = express.Router()
const prisma = require('./prisma')
const { authenticate } = require('./middleware')


router.get('/servicios', authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/servicios/:id', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) }
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/servicios', authenticate, async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body
    const product = await prisma.product.create({
      data: { name, description, price: Number(price), stock: Number(stock) || 0, category: category || 'servicio' }
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/servicios/:id', authenticate, async (req, res) => {
  try {
    const { name, description, price, category } = req.body
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { name, description, price: Number(price), ...(category && { category }) }
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/servicios/:id', authenticate, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


router.get('/clients', authenticate, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.userId },
      include: { vehicles: true }
    })
    res.json(clients)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/clients/:id', authenticate, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
      include: { vehicles: true }
    })
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/clients', authenticate, async (req, res) => {
  try {
    const { name, phone, email } = req.body
    const client = await prisma.client.create({
      data: { name, phone, email, userId: req.userId },
      include: { vehicles: true }
    })
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/clients/:id', authenticate, async (req, res) => {
  try {
    const { name, phone, email } = req.body
    const client = await prisma.client.updateMany({
      where: { id: Number(req.params.id), userId: req.userId },
      data: { name, phone, email }
    })
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/clients/:id', authenticate, async (req, res) => {
  try {
    await prisma.client.deleteMany({
      where: { id: Number(req.params.id), userId: req.userId }
    })
    res.json({ message: 'Client deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/clients/:id/vehicles', authenticate, async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: Number(req.params.id), userId: req.userId }
    })
    if (!client) return res.status(404).json({ error: 'Client not found' })
    const { brand, model, year, plate } = req.body
    const vehicle = await prisma.vehicle.create({
      data: { clientId: client.id, brand, model, year: year ? Number(year) : null, plate: plate || null }
    })
    res.json(vehicle)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


router.get('/quotes', authenticate, async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      where: { userId: req.userId },
      include: {
        client: true,
        vehicle: true,
        items: { include: { product: true } }
      }
    })
    res.json(quotes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/quotes/:id', authenticate, async (req, res) => {
  try {
    const quote = await prisma.quote.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
      include: {
        client: true,
        vehicle: true,
        items: { include: { product: true } }
      }
    })
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/quotes', authenticate, async (req, res) => {
  try {
    const { clientId, vehicleId, items } = req.body
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const quote = await prisma.quote.create({
      data: {
        clientId,
        vehicleId: vehicleId || null,
        userId: req.userId,
        total,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            description: item.description || null
          }))
        }
      },
      include: {
        client: true,
        vehicle: true,
        items: { include: { product: true } }
      }
    })
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/quotes/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body
    await prisma.quote.updateMany({
      where: { id: Number(req.params.id), userId: req.userId },
      data: { status }
    })
    const quote = await prisma.quote.findFirst({
      where: { id: Number(req.params.id), userId: req.userId }
    })
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/quotes/:id', authenticate, async (req, res) => {
  try {
    const quote = await prisma.quote.findFirst({
      where: { id: Number(req.params.id), userId: req.userId }
    })
    if (!quote) return res.status(404).json({ error: 'Not found' })
    await prisma.quoteItem.deleteMany({ where: { quoteId: quote.id } })
    await prisma.quote.delete({ where: { id: quote.id } })
    res.json({ message: 'Quote deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


module.exports = router
