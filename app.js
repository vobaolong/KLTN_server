const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
require('dotenv').config()

//import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const storeRoutes = require('./routes/store')
const userLevelRoutes = require('./routes/userLevel')
const storeLevelRoutes = require('./routes/storeLevel')
const commissionRoutes = require('./routes/commission')
const userFollowStoreRoutes = require('./routes/userFollowStore')
const userFollowProductRoutes = require('./routes/userFollowProduct')
const categoryRoutes = require('./routes/category')
const styleRoutes = require('./routes/style')
const styleValueRoutes = require('./routes/styleValue')
const productRoutes = require('./routes/product')
const cartRoutes = require('./routes/cart')
const deliveryRoutes = require('./routes/delivery')
const orderRoutes = require('./routes/order')
const transactionRoutes = require('./routes/transaction')
const reviewRoutes = require('./routes/review')

//app
const app = express()

//db
mongoose.connect(process.env.DATABASE, (error) => {
  if (error) throw error
  console.log('DB connected!')
})

//middlewares
app.use(morgan('dev'))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
// app.use(express.json({limit: "50mb"}));
app.use(cookieParser())
app.use(
  cors({
    origin: [
      `http://localhost:${process.env.CLIENT_PORT_1}`,
      `http://localhost:${process.env.CLIENT_PORT_2}`,
      `http://localhost:${process.env.CLIENT_PORT_3}`
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  })
)

//routes middlewares
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', storeRoutes)
app.use('/api', userLevelRoutes)
app.use('/api', storeLevelRoutes)
app.use('/api', commissionRoutes)
app.use('/api', userFollowStoreRoutes)
app.use('/api', userFollowProductRoutes)
app.use('/api', categoryRoutes)
app.use('/api', styleRoutes)
app.use('/api', styleValueRoutes)
app.use('/api', productRoutes)
app.use('/api', cartRoutes)
app.use('/api', deliveryRoutes)
app.use('/api', orderRoutes)
app.use('/api', transactionRoutes)
app.use('/api', reviewRoutes)

//port
const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
