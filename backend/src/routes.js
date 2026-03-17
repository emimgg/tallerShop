const express = require('express')
const router = express.Router()
const prisma = require('./prisma')
const { authenticate } = require('./middleware')


router.get('/inventory', authenticate, async (req, res) => {
  try {
    const products = await prisma.product.findMany()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


router.get('/inventory/:id', authenticate, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) }
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


router.post('/inventory', authenticate, async (req, res) => {
  try {
    const { name, description, price, stock } = req.body
    const product = await prisma.product.create({
      data: { name, description, price, stock }
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


router.put('/inventory/:id', authenticate, async (req, res) => {
  try {
    const { name, description, price, stock } = req.body
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { name, description, price, stock }
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


router.delete('/inventory/:id', authenticate, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})



// GET all clients
router.get('/clients', authenticate, async (req, res) => {
  try {
    const clients = await prisma.client.findMany()
    res.json(clients)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single client
router.get('/clients/:id', authenticate, async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: Number(req.params.id) }
    })
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create client
router.post('/clients', authenticate, async (req, res) => {
  try {
    const { name, phone, email } = req.body
    const client = await prisma.client.create({
      data: { name, phone, email }
    })
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update client
router.put('/clients/:id', authenticate, async (req, res) => {
  try {
    const { name, phone, email } = req.body
    const client = await prisma.client.update({
      where: { id: Number(req.params.id) },
      data: { name, phone, email }
    })
    res.json(client)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE client
router.delete('/clients/:id', authenticate, async (req, res) => {
  try {
    await prisma.client.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ message: 'Client deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

//QUOTES ROUTES

// GET all quotes
router.get('/quotes', authenticate, async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: {
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    res.json(quotes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single quote
router.get('/quotes/:id', authenticate, async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create quote
router.post('/quotes', authenticate, async (req, res) => {
  try {
    const { clientId, items } = req.body

    // calculate total from items
    const total = items.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity
    }, 0)

    const quote = await prisma.quote.create({
      data: {
        clientId,
        total,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: {
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT update quote status
router.put('/quotes/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body
    const quote = await prisma.quote.update({
      where: { id: Number(req.params.id) },
      data: { status }
    })
    res.json(quote)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE quote
router.delete('/quotes/:id', authenticate, async (req, res) => {
  try {
    await prisma.quoteItem.deleteMany({
      where: { quoteId: Number(req.params.id) }
    })
    await prisma.quote.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ message: 'Quote deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})


module.exports = router