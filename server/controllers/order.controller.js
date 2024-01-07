const Order = require('../models/order.model')
const User = require('../models/user.model')
const Coupon = require('../models/coupon.model')
const asyncHandler = require('express-async-handler')

const createOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { coupon } = req.body
  const userCart = await User.findById(_id)
    .select('cart')
    .populate('cart.product', 'title price')
  const products = userCart?.cart?.map((e) => ({
    product: e.product._id,
    count: e.quantity,
    color: e.color
  }))

  let total = userCart?.cart?.reduce(
    (sum, e) => e.product.price + e.quantity + sum,
    0
  )
  const createData = { products, total, orderBy: _id }

  if (coupon) {
    const selectedCoupon = await Coupon.findById(coupon)
    total =
      Math.round((total * (1 - +selectedCoupon.discount / 100)) / 1000) *
        1000 || total
    createData.total = total
    createData.coupon = coupon
  }

  const rs = await Order.create({ products, total, orderBy: _id })
  return res.json({
    success: rs ? true : false,
    rs: rs ? rs : 'Cant create new order'
  })
})

const updateStatusOrder = asyncHandler(async (req, res) => {
  const { oid } = req.params
  const { status } = req.body
  if (!status) throw new Error('Missing value!')
  const response = await Order.findByIdAndUpdate(oid, { status }, { new: true })
  return res.json({
    success: response ? true : false,
    response: response ? response : 'Some thing went wrong'
  })
})

const getUserOrder = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const response = await Order.find({ orderBy: _id })
  return res.json({
    success: response ? true : false,
    response: response ? response : 'Some thing went wrong'
  })
})

const getAdminOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const response = await Order.find()
  return res.json({
    success: response ? true : false,
    response: response ? response : 'Some thing went wrong'
  })
})

module.exports = {
  createOrder,
  updateStatusOrder,
  getUserOrder,
  getAdminOrders
}
