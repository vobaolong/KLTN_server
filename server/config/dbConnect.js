const { default: mongoose } = require('mongoose')
const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI)
    if (connect.connection.readyState === 1)
      console.log('DB connection established successfully ✅')
    else console.log('DB connecting...')
  } catch (err) {
    console.log('DB connection failed ❌')
    throw new Error(err)
  }
}

module.exports = dbConnect
