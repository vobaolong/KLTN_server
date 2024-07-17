const Order = require('../models/order')
const OrderItem = require('../models/orderItem')
const Cart = require('../models/cart')
const CartItem = require('../models/cartItem')
const Product = require('../models/product')
const Store = require('../models/store')
const User = require('../models/user')
const Transaction = require('../models/transaction')
const { cleanUserLess } = require('../helpers/userHandler')
const { errorHandler } = require('../helpers/errorHandler')
const { ObjectId } = require('mongodb')
const { Decimal128 } = require('mongodb')
exports.orderById = (req, res, next, id) => {
  Order.findById(id, (error, order) => {
    if (error || !order) {
      return res.status(404).json({
        error: 'Order not found'
      })
    }

    req.order = order
    next()
  })
}

exports.orderItemById = (req, res, next, id) => {
  OrderItem.findById(id, (error, orderItem) => {
    if (error || !orderItem) {
      return res.status(404).json({
        error: 'OrderItem not found'
      })
    }

    req.orderItem = orderItem
    next()
  })
}

exports.listOrderItems = (req, res) => {
  OrderItem.find({ orderId: req.order._id })
    .populate({
      path: 'productId',
      populate: {
        path: 'categoryId',
        populate: {
          path: 'categoryId',
          populate: { path: 'categoryId' }
        }
      },
      populate: {
        path: 'storeId',
        select: {
          _id: 1,
          name: 1,
          address: 1,
          avatar: 1,
          isActive: 1,
          isOpen: 1
        }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .exec()
    .then((items) => {
      return res.json({
        success: 'Load list order items successfully',
        items
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list order items failed'
      })
    })
}

exports.listOrderByUser = (req, res) => {
  const userId = req.user._id

  const search = req.query.search ? req.query.search : ''
  const regex = '.*' + search + '.*'

  const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'desc'

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = limit * (page - 1)

  const filter = {
    search,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    userId,
    tempId: { $regex: regex, $options: 'i' }
  }

  if (req.query.status) {
    filter.status = req.query.status.split('|')
    filterArgs.status = {
      $in: req.query.status.split('|')
    }
  }

  Order.aggregate(
    [
      {
        $addFields: {
          tempId: { $toString: '$_id' }
        }
      },
      {
        $match: filterArgs
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 }
        }
      }
    ],
    (error, result) => {
      if (error) {
        return res.status(404).json({
          error: 'List orders by user not found'
        })
      }

      const size = result.reduce((p, c) => p + c.count, 0)
      const pageCount = Math.ceil(size / limit)
      filter.pageCount = pageCount

      if (page > pageCount) {
        skip = (pageCount - 1) * limit
      }

      if (size <= 0) {
        return res.json({
          success: 'Load list orders by user successfully',
          filter,
          size,
          orders: []
        })
      }

      Order.find({ _id: { $in: result.map((r) => r._id) } })
        .sort({ [sortBy]: order, _id: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', '_id firstName lastName avatar')
        .populate('storeId', '_id name address avatar isActive isOpen')
        .populate('commissionId')
        .exec()
        .then((orders) => {
          return res.json({
            success: 'Load list orders by user successfully',
            filter,
            size,
            orders
          })
        })
        .catch((error) => {
          return res.status(500).json({
            error: 'Load list orders by user failed'
          })
        })
    }
  )
}

exports.listOrderByStore = (req, res) => {
  const storeId = req.store._id

  const search = req.query.search ? req.query.search : ''
  const regex = '.*' + search + '.*'

  const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'desc'

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = limit * (page - 1)

  const filter = {
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    storeId,
    tempId: { $regex: regex, $options: 'i' }
  }

  if (req.query.status) {
    filter.status = req.query.status.split('|')
    filterArgs.status = {
      $in: req.query.status.split('|')
    }
  }

  Order.aggregate(
    [
      {
        $addFields: {
          tempId: { $toString: '$_id' }
        }
      },
      {
        $match: filterArgs
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 }
        }
      }
    ],
    (error, result) => {
      if (error) {
        return res.status(404).json({
          error: 'List orders by store not found'
        })
      }

      const size = result.reduce((p, c) => p + c.count, 0)
      const pageCount = Math.ceil(size / limit)
      filter.pageCount = pageCount

      if (page > pageCount) {
        skip = (pageCount - 1) * limit
      }

      if (size <= 0) {
        return res.json({
          success: 'Load list orders by store successfully',
          filter,
          size,
          orders: []
        })
      }

      Order.find({ _id: { $in: result.map((r) => r._id) } })
        .sort({ [sortBy]: order, _id: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', '_id firstName lastName avatar')
        .populate('storeId', '_id name address avatar isActive isOpen')
        .populate('commissionId')
        .exec()
        .then((orders) => {
          return res.json({
            success: 'Load list orders by store successfully',
            filter,
            size,
            orders
          })
        })
        .catch((error) => {
          return res.status(500).json({
            error: 'Load list orders by store failed'
          })
        })
    }
  )
}

exports.listOrderForAdmin = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const regex = '.*' + search + '.*'

  const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'desc'

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 8
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = limit * (page - 1)

  const filter = {
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    tempId: { $regex: regex, $options: 'i' }
  }

  if (req.query.status) {
    filter.status = req.query.status.split('|')
    filterArgs.status = {
      $in: req.query.status.split('|')
    }
  }

  Order.aggregate(
    [
      {
        $addFields: {
          tempId: { $toString: '$_id' }
        }
      },
      {
        $match: filterArgs
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 }
        }
      }
    ],
    (error, result) => {
      if (error) {
        return res.status(404).json({
          error: 'List orders not found'
        })
      }

      const size = result.reduce((p, c) => p + c.count, 0)
      const pageCount = Math.ceil(size / limit)
      filter.pageCount = pageCount

      if (page > pageCount) {
        skip = (pageCount - 1) * limit
      }

      if (size <= 0) {
        return res.json({
          success: 'Load list orders successfully',
          filter,
          size,
          orders: []
        })
      }

      Order.find({ _id: { $in: result.map((r) => r._id) } })
        .sort({ [sortBy]: order, _id: 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', '_id firstName lastName avatar')
        .populate('storeId', '_id name address avatar isActive isOpen')
        .populate('commissionId')
        .exec()
        .then((orders) => {
          return res.json({
            success: 'Load list orders successfully',
            filter,
            size,
            orders
          })
        })
        .catch((error) => {
          return res.status(500).json({
            error: 'Load list orders failed'
          })
        })
    }
  )
}

//CRUD
exports.createOrder = (req, res, next) => {
  const { userId, storeId } = req.cart
  const {
    commissionId,
    address,
    phone,
    firstName,
    shippingFee,
    lastName,
    amountFromUser,
    amountFromStore,
    amountToStore,
    amountToZenpii,
    isPaidBefore
  } = req.body

  if (
    !userId ||
    !storeId ||
    !commissionId ||
    !address ||
    !shippingFee ||
    !phone ||
    !firstName ||
    !lastName ||
    !amountFromUser ||
    !amountFromStore ||
    !amountToStore ||
    !amountToZenpii
  )
    return res.status(400).json({
      error: 'All fields are required'
    })

  if (!userId.equals(req.user._id))
    return res.status(400).json({
      error: 'This is not right cart!'
    })

  const order = new Order({
    userId,
    storeId,
    firstName,
    lastName,
    phone,
    address,
    shippingFee,
    commissionId,
    amountFromUser,
    amountFromStore,
    amountToStore,
    amountToZenpii,
    isPaidBefore
  })

  order.save((error, order) => {
    if (error || !order) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    } else {
      req.order = order
      next()
    }
  })
}

exports.createOrderItems = (req, res, next) => {
  CartItem.find({ cartId: req.cart._id })
    .exec()
    .then((items) => {
      const newItems = items.map((item) => {
        return {
          orderId: req.order._id,
          productId: item.productId,
          variantValueIds: item.variantValueIds,
          count: item.count,
          isDeleted: item.isDeleted
        }
      })

      OrderItem.insertMany(newItems, (error, items) => {
        if (error)
          return res.status(500).json({
            error: errorHandler(error)
          })
        else {
          next()
        }
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Create order items failed'
      })
    })
}

exports.removeCart = (req, res, next) => {
  Cart.findOneAndUpdate(
    { _id: req.cart._id },
    { isDeleted: true },
    { new: true }
  )
    .exec()
    .then((cart) => {
      if (!cart)
        return res.status(400).json({
          error: 'Remove cart failed'
        })
      else next()
    })
    .catch((error) => {
      return res.status(400).json({
        error: 'Remove cart failed'
      })
    })
}

exports.removeAllCartItems = (req, res) => {
  CartItem.deleteMany({ cartId: req.cart._id }, (error, items) => {
    if (error)
      return res.status(400).json({
        error: 'Remove all cart items failed'
      })
    else
      return res.json({
        success: 'Create order successfully',
        order: req.order,
        user: cleanUserLess(req.user)
      })
  })
}

exports.checkOrderAuth = (req, res, next) => {
  if (req.user.role === 'admin') next()
  else if (
    req.user._id.equals(req.order.userId) ||
    (req.store && req.store._id.equals(req.order.storeId))
  )
    next()
  else
    return res.status(401).json({
      error: 'That is not right order!'
    })
}

exports.readOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.order._id })
      .populate('userId', '_id firstName lastName avatar')
      .populate('storeId', '_id name address avatar isActive isOpen')
      .populate('commissionId')

    if (!order)
      return res.status(501).json({
        error: 'Not found!'
      })

    return res.json({
      success: 'read order successfully',
      order
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Not found!'
    })
  }
}

// 'Not processed' --> 'Cancelled' (in 1h)
exports.updateStatusForUser = (req, res, next) => {
  const currentStatus = req.order.status
  if (currentStatus !== 'Not processed')
    return res.status(401).json({
      error: 'This order is already processed!'
    })

  const time = new Date().getTime() - new Date(req.order.createdAt).getTime()
  const hours = Math.floor(time / 1000) / 3600
  if (hours >= 1) {
    return res.status(401).json({
      error: 'This order is not within the time allowed!'
    })
  }

  const { status } = req.body
  if (status !== 'Cancelled')
    return res.status(401).json({
      error: 'This status value is invalid!'
    })

  Order.findOneAndUpdate(
    { _id: req.order._id },
    { $set: { status } },
    { new: true }
  )
    .populate('userId', '_id firstName lastName avatar')
    .populate('storeId', '_id name address avatar isActive isOpen')
    .populate('commissionId')
    .exec()
    .then((order) => {
      if (!order)
        return res.status(500).json({
          error: 'Not found!'
        })

      if (order.status === 'Cancelled') {
        req.updatePoint = {
          userId: req.order.userId,
          storeId: req.order.storeId,
          point: -1
        }

        if (order.isPaidBefore === true)
          req.createTransaction = {
            userId: order.userId,
            isUp: true,
            amount: order.amountFromUser
          }

        next()
      }

      return res.json({
        success: 'update order successfully',
        order,
        user: cleanUserLess(req.user)
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'update order failed'
      })
    })
}

exports.updateStatusForStore = (req, res, next) => {
  const currentStatus = req.order.status
  const { status } = req.body

  if (
    status !== 'Not processed' &&
    status !== 'Processing' &&
    status !== 'Shipped' &&
    status !== 'Delivered' &&
    status !== 'Cancelled'
  )
    return res.status(400).json({
      error: 'This status value is invalid!'
    })
  if (
    (currentStatus === 'Not processed' && status === 'Delivered') ||
    (currentStatus === 'Not processed' && status === 'Shipped') ||
    (currentStatus === 'Processing' && status === 'Not processed') ||
    (currentStatus === 'Processing' && status === 'Delivered') ||
    (currentStatus === 'Shipped' && status === 'Not processed') ||
    (currentStatus === 'Shipped' && status === 'Processing') ||
    (currentStatus === 'Delivered' && status !== 'Delivered')
  )
    return res.status(401).json({
      error: 'Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.'
    })

  Order.findOneAndUpdate(
    { _id: req.order._id },
    { $set: { status } },
    { new: true }
  )
    .populate('userId', '_id firstName lastName avatar')
    .populate('storeId', '_id name address avatar isActive isOpen')
    .populate('commissionId')
    .exec()
    .then((order) => {
      if (!order)
        return res.status(500).json({
          error: 'Not found!'
        })

      if (status === 'Cancelled') {
        req.updatePoint = {
          userId: req.order.userId,
          storeId: req.order.storeId,
          point: -1
        }

        if (order.isPaidBefore === true)
          req.createTransaction = {
            userId: order.userId,
            isUp: true,
            amount: order.amountFromUser
          }

        next()
      } else if (status === 'Delivered') {
        req.updatePoint = {
          userId: req.order.userId,
          storeId: req.order.storeId,
          point: 1
        }

        req.createTransaction = {
          storeId: order.storeId,
          isUp: order.isPaidBefore === true ? true : false,
          amount:
            order.isPaidBefore === true
              ? order.amountToStore
              : order.amountToZenpii
        }
        next()
      } else {
        return res.json({
          success: 'update order successfully',
          order
        })
      }
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'update order failed'
      })
    })
}

exports.updateQuantitySoldProduct = (req, res, next) => {
  OrderItem.find({ orderId: req.order._id })
    .exec()
    .then((items) => {
      let list = []
      items.forEach((item) => {
        const temp = list.map((element) => element.productId)
        const index = temp.indexOf(item.productId)
        if (index === -1)
          list.push({ productId: item.productId, count: item.count })
        else {
          list[index].count += item.count
        }
      })

      let bulkOps = list.map((element) => {
        return {
          updateOne: {
            filter: { _id: element.productId },
            update: {
              $inc: {
                quantity: -element.count,
                sold: +element.count
              }
            }
          }
        }
      })

      Product.bulkWrite(bulkOps, {}, (error, products) => {
        if (error) {
          return res.status(400).json({
            error: 'Could not update product'
          })
        }
        console.log('Update product successfully')
        return res.json({
          success: 'Order successfully, update product successfully',
          order: req.order
        })
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: 'Could not update product quantity, sold'
      })
    })

  next()
}
exports.createReturnRequest = (req, res) => {
  const { reason } = req.body
  const orderId = req.params.orderId

  if (!reason) {
    return res.status(400).json({
      error: 'Reason are required'
    })
  }

  const returnRequest = {
    reason,
    status: 'Pending',
    createdAt: new Date(),
    userId: req.params.userId,
    _id: ObjectId()
  }

  Order.findByIdAndUpdate(
    orderId,
    { $set: { returnRequests: returnRequest } },
    { new: true },
    (error, order) => {
      if (error || !order) {
        return res.status(500).json({
          error: 'Could not create return request'
        })
      }

      return res.json({
        success: 'Return request created successfully',
        order
      })
    }
  )
}

exports.listReturnOrder = async (req, res) => {
  try {
    const storeId = req.store._id
    const search = req.query.search ? req.query.search : ''
    const regex = '.*' + search + '.*'

    const sortBy = req.query.sortBy || 'createdAt'
    const order = ['asc', 'desc'].includes(req.query.order)
      ? req.query.order
      : 'desc'

    const limit = parseInt(req.query.limit) || 6
    const page = Math.max(1, parseInt(req.query.page) || 1)
    let skip = limit * (page - 1)

    const filter = { search, sortBy, order, limit, pageCurrent: page }

    const filterArgs = {
      storeId,
      tempId: { $regex: regex },
      returnRequests: { $exists: true, $ne: [] }
    }

    if (req.query.status) {
      filter.status = req.query.status
      filterArgs['returnRequests.status'] = {
        $in: req.query.status.split(',')
      }
    }

    const result = await Order.aggregate([
      {
        $addFields: {
          tempId: { $toString: '$_id' }
        }
      },
      {
        $match: filterArgs
      },
      {
        $group: {
          _id: '$_id',
          count: { $sum: 1 }
        }
      }
    ])

    const size = result.reduce((p, c) => p + c.count, 0)
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    if (size <= 0) {
      return res.json({
        success: 'Load list orders by store successfully',
        filter,
        size,
        orders: []
      })
    }

    const orders = await Order.find({ _id: { $in: result.map((r) => r._id) } })
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('userId')
      .populate('storeId')

    return res.json({
      success: 'Load list orders by store successfully',
      filter,
      size,
      orders
    })
  } catch (error) {
    console.error('Error in listReturnOrder:', error)
    return res.status(500).json({
      error: 'Load list orders by store failed'
    })
  }
}

exports.returnOrder = async (req, res, next) => {
  const orderId = req.params.orderId
  const { status } = req.body

  if (!status) {
    return res.status(400).json({
      error: 'Status is required'
    })
  }

  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { 'returnRequests.status': status } },
      { new: true }
    )
    if (!order) {
      return res.status(500).json({
        error: 'Could not update return request'
      })
    }

    if (status === 'Approved') {
      try {
        await handleApprovedReturn(order)
        order.status = 'Returned'
        await order.save()
        return res.json({
          success: 'Return request approved successfully',
          order
        })
      } catch (err) {
        return res.status(500).json({
          error: 'Failed to handle approved return'
        })
      }
    } else {
      return res.json({
        success: 'Return request updated successfully',
        order
      })
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Could not update return request'
    })
  }
}
const handleApprovedReturn = async (order) => {
  try {
    const items = await OrderItem.find({ orderId: order._id }).exec()
    const list = []

    items.forEach((item) => {
      const index = list.findIndex((element) =>
        element.productId.equals(item.productId)
      )
      if (index === -1) {
        list.push({ productId: item.productId, count: item.count })
      } else {
        list[index].count += item.count
      }
    })

    const bulkOps = list.map((element) => ({
      updateOne: {
        filter: { _id: element.productId },
        update: {
          $inc: {
            quantity: +element.count,
            sold: -element.count
          }
        }
      }
    }))

    await Product.bulkWrite(bulkOps)
    const sum =
      parseFloat(order.amountToStore.toString()) +
      parseFloat(order.amountFromStore.toString())

    const transaction1 = new Transaction({
      storeId: order.storeId,
      isUp: false,
      amount: sum
    })

    await Store.findOneAndUpdate(
      { _id: order.storeId },
      {
        $inc: {
          point: -1,
          e_wallet: -sum
        }
      }
    )

    const transaction2 = new Transaction({
      userId: order.userId,
      isUp: true,
      amount: order.amountFromUser
    })

    await User.findByIdAndUpdate(
      { _id: order.userId },
      {
        $inc: { point: -1, e_wallet: +order.amountFromUser }
      }
    )

    await transaction1.save()
    await transaction2.save()
    console.log('Products and wallets updated successfully')
  } catch (error) {
    console.error('Error in handleApprovedReturn:', error)
    throw new Error('Could not handle approved return')
  }
}

exports.countOrders = (req, res) => {
  const filterArgs = {}
  if (req.query.status)
    filterArgs.status = {
      $in: req.query.status.split('|')
    }
  if (req.query.userId) filterArgs.userId = req.query.userId
  if (req.query.storeId) filterArgs.storeId = req.query.storeId

  Order.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.json({
        success: 'Count order successfully',
        count: 0
      })
    }

    return res.json({
      success: 'Count order successfully',
      count
    })
  })
}

exports.updatePoint = async (req, res, next) => {
  try {
    const { userId, storeId, point } = req.updatePoint
    await User.findOneAndUpdate({ _id: userId }, { $inc: { point: +point } })
    await Store.findOneAndUpdate({ _id: storeId }, { $inc: { point: +point } })

    console.log('Update point successfully')
  } catch {
    console.log('Update point failed')
  }
}
