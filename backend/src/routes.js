const express = require('express')
const router = express.Router()
const prisma = require('./prisma')

// GET all products
router.get('/inventory', async (req, res) => {
  try {
    const products = await prisma.product.findMany()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET single product
router.get('/inventory/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) }
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST create product
router.post('/inventory', async (req, res) => {
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

// PUT update product
router.put('/inventory/:id', async (req, res) => {
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

// DELETE product
router.delete('/inventory/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) }
    })
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router