const express = require('express')
require('dotenv').config()
const dbConnect = require('./config/dbConnect')
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['POST', 'PUT', 'DELETE', 'GET']
  })
)
const port = process.env.PORT || 8088

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

dbConnect()
initRoutes(app)

app.use('/', (req, res) => {
  res.send('Server Is Running 🚀')
})

app.listen(port, () => {
  console.log(`Server running: http://localhost:${port}`)
})
