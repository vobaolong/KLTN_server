const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const sharp = require('sharp')
require('dotenv').config()
const fs = require('fs')
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
const variantValueRoutes = require('./routes/variantValue')
const productRoutes = require('./routes/product')
const cartRoutes = require('./routes/cart')
const deliveryRoutes = require('./routes/delivery')
const orderRoutes = require('./routes/order')
const transactionRoutes = require('./routes/transaction')
const reviewRoutes = require('./routes/review')
const app = express()

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connected!')
  })
  .catch((error) => {
    console.error('Error connecting to database:', error)
  })

app.use(morgan('dev'))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
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

// // Hàm chuyển đổi ảnh sang định dạng webp
// const convertToWebP = async (imagePath) => {
//   try {
//     const imageBuffer = await sharp(imagePath).webp().toBuffer()
//     fs.writeFileSync(
//       imagePath.replace(/\.(png|jpg|jpeg)$/, '.webp'),
//       imageBuffer
//     )
//     console.log('Converted', imagePath, 'to webp')
//     fs.unlinkSync(imagePath)
//     console.log('Deleted original image:', imagePath)
//   } catch (err) {
//     console.error('Error converting image:', err)
//   }
// }

// // Đường dẫn tới thư mục chứa các ảnh
// const directory = 'public/uploads/'

// // Lấy danh sách tất cả các tệp trong thư mục
// fs.readdir(directory, (err, files) => {
//   if (err) {
//     console.error('Error reading directory:', err)
//     return
//   }

//   // Lọc ra các tệp có định dạng là png hoặc jpg
//   const jpgWebpFiles = files.filter((file) => file.endsWith('.jpg.webp'))

//   jpgWebpFiles.forEach((jpgWebpFile) => {
//     const oldPath = path.join(directory, jpgWebpFile)
//     const newPath = oldPath.replace('.jpg.webp', '.webp')

//     // Đổi tên tệp
//     fs.renameSync(oldPath, newPath)
//     console.log('Renamed', jpgWebpFile, 'to', path.basename(newPath))
//   })
// })

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
app.use('/api', variantValueRoutes)
app.use('/api', productRoutes)
app.use('/api', cartRoutes)
app.use('/api', deliveryRoutes)
app.use('/api', orderRoutes)
app.use('/api', transactionRoutes)
app.use('/api', reviewRoutes)

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
