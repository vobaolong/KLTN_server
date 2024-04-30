const Order = require('../models/order')
const OrderItem = require('../models/orderItem')
const Cart = require('../models/cart')
const CartItem = require('../models/cartItem')
const Product = require('../models/product')
const Store = require('../models/store')
const User = require('../models/user')
const { cleanUserLess } = require('../helpers/userHandler')
const { errorHandler } = require('../helpers/errorHandler')

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

//list
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
        .populate('deliveryId')
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
        .populate('deliveryId')
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
        .populate('deliveryId')
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
    deliveryId,
    commissionId,
    address,
    phone,
    firstName,
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
    !deliveryId ||
    !commissionId ||
    !address ||
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
    deliveryId,
    commissionId,
    address,
    phone,
    firstName,
    lastName,
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

exports.readOrder = (req, res) => {
  Order.findOne({ _id: req.order._id })
    .populate('userId', '_id firstName lastName avatar')
    .populate('storeId', '_id name address avatar isActive isOpen')
    .populate('deliveryId')
    .populate('commissionId')
    .exec()
    .then((order) => {
      if (!order)
        return res.status(500).json({
          error: 'Not found!'
        })

      return res.json({
        success: 'read order successfully',
        order
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Not found!'
      })
    })
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
    .populate('deliveryId')
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

//'Not processed' <--> 'Processing' --> 'Shipped'
//'Not processed' <--> 'Processing' --> 'Cancelled'
exports.updateStatusForStore = (req, res, next) => {
  const currentStatus = req.order.status
  if (currentStatus !== 'Not processed' && currentStatus !== 'Processing')
    return res.status(401).json({
      error: 'This order is already processed!'
    })

  const { status } = req.body
  // console.log(status);
  if (
    status !== 'Not processed' &&
    status !== 'Processing' &&
    status !== 'Shipped' &&
    status !== 'Cancelled'
  )
    return res.status(400).json({
      error: 'This status value is invalid!'
    })

  Order.findOneAndUpdate(
    { _id: req.order._id },
    { $set: { status } },
    { new: true }
  )
    .populate('userId', '_id firstName lastName avatar')
    .populate('storeId', '_id name address avatar isActive isOpen')
    .populate('deliveryId')
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
        order
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'update order failed'
      })
    })
}

//'Processing' <-- 'Shipped' <--> 'Delivered'
exports.updateStatusForAdmin = (req, res, next) => {
  const currentStatus = req.order.status
  if (currentStatus !== 'Shipped' && currentStatus !== 'Delivered')
    return res.status(401).json({
      error: 'This order is not already processed!'
    })

  const { status } = req.body
  if (status !== 'Processing' && status !== 'Shipped' && status !== 'Delivered')
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
    .populate('deliveryId')
    .populate('commissionId')
    .exec()
    .then((order) => {
      if (!order)
        return res.status(500).json({
          error: 'Not found!'
        })

      if (status === 'Delivered') {
        req.createTransaction = {
          storeId: order.storeId,
          isUp: true,
          amount: order.amountToStore
        }

        req.updatePoint = {
          userId: req.order.userId,
          storeId: req.order.storeId,
          point: 1
        }
        next()
      } else
        return res.json({
          success: 'update order successfully',
          order
        })
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

exports.updatePoint = async (req, res) => {
  try {
    const { userId, storeId, point } = req.updatePoint
    await User.findOneAndUpdate({ _id: userId }, { $inc: { point: +point } })
    await Store.findOneAndUpdate({ _id: storeId }, { $inc: { point: +point } })
  } catch {}
}
