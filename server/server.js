const express = require('express')
require('dotenv').config()
const dbConnect = require('./config/dbConnect')
const initRoutes = require('./routes')

const app = express()
const port = process.env.PORT || 8088

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
