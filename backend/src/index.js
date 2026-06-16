const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const cors = require('cors')
const routes = require('./routes')
const authRoutes = require('./auth')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})