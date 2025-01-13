const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const http = require('http')
const rateLimit = require('express-rate-limit')
require('dotenv').config()
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const storeRoutes = require('./routes/store')
const userLevelRoutes = require('./routes/userLevel')
const storeLevelRoutes = require('./routes/storeLevel')
const commissionRoutes = require('./routes/commission')
const userFollowStoreRoutes = require('./routes/userFollowStore')
const userFollowProductRoutes = require('./routes/userFollowProduct')
const categoryRoutes = require('./routes/category')
const variantRoutes = require('./routes/variant')
const brandRoutes = require('./routes/brand')
const variantValueRoutes = require('./routes/variantValue')
const productRoutes = require('./routes/product')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/order')
const transactionRoutes = require('./routes/transaction')
const reviewRoutes = require('./routes/review')
const addressCacheRoutes = require('./routes/addressCache')
const reportRoutes = require('./routes/report')
const notificationRoutes = require('./routes/notification')
const { initSocketServer } = require('./socketServer')
const app = express()

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ DB connected')
  })
  .catch((error) => {
    console.error('⚠️ Error connecting to database:', error)
  })

// app.use(morgan('dev'))
app.use('/static', express.static(path.join(__dirname, 'public')))
// app.use(express.urlencoded({ extended: true }))
// const apiLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minutes
//   max: 2,
//   message: 'Too many connection'
// })
// app.use(apiLimiter)

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// app.use(
//   express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 })
// )
// app.use(express.json({ limit: '50mb' }))

app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', storeRoutes)
app.use('/api', userLevelRoutes)
app.use('/api', storeLevelRoutes)
app.use('/api', commissionRoutes)
app.use('/api', userFollowStoreRoutes)
app.use('/api', userFollowProductRoutes)
app.use('/api', categoryRoutes)
app.use('/api', variantRoutes)
app.use('/api', brandRoutes)
app.use('/api', variantValueRoutes)
app.use('/api', productRoutes)
app.use('/api', cartRoutes)
app.use('/api', orderRoutes)
app.use('/api', transactionRoutes)
app.use('/api', reviewRoutes)
app.use('/api', addressCacheRoutes)
app.use('/api', reportRoutes)
app.use('/api', notificationRoutes)

const server = http.createServer(app)
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})
initSocketServer(server)
