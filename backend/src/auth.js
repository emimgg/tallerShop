const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('./prisma')

const JWT_SECRET = process.env.JWT_SECRET

router.post('/register', async (req, res) => {
  try {
    const REGISTER_SECRET = process.env.REGISTER_SECRET
if (!REGISTER_SECRET || req.headers['x-register-secret'] !== REGISTER_SECRET) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'username and password required' })
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) return res.status(409).json({ error: 'Username already taken' })
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { username, password: hashed } })
    res.status(201).json({ id: user.id, username: user.username })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, username: user.username } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
