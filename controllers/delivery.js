const Delivery = require('../models/delivery')
const { errorHandler } = require('../helpers/errorHandler')

exports.deliveryById = (req, res, next, id) => {
  Delivery.findById(id, (error, delivery) => {
    if (error || !delivery) {
      return res.status(404).json({
        error: 'Delivery not found'
      })
    }

    req.delivery = delivery
    next()
  })
}

exports.readDelivery = (req, res) => {
  if (req.delivery.isDeleted)
    return res.status(404).json({
      error: 'delivery not found'
    })
  else
    return res.json({
      success: 'read delivery successfully',
      delivery: req.delivery
    })
}

exports.createDelivery = (req, res) => {
  const { name, price, description } = req.body

  if (!name || !price || !description)
    return res.status(400).json({
      error: 'All fields are required'
    })

  const delivery = new Delivery({
    name,
    price,
    description
  })

  delivery.save((error, delivery) => {
    if (error || !delivery) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create delivery successfully',
      delivery
    })
  })
}

exports.updateDelivery = (req, res) => {
  const { name, price, description } = req.body

  if (!name || !price || !description)
    return res.status(400).json({
      error: 'All fields are required'
    })

  Delivery.findOneAndUpdate(
    { _id: req.delivery._id },
    { $set: { name, price, description } },
    { new: true }
  )
    .exec()
    .then((delivery) => {
      if (!delivery) {
        return res.status(500).json({
          error: 'delivery not found'
        })
      }

      return res.json({
        success: 'Update delivery successfully',
        delivery
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeDelivery = (req, res) => {
  Delivery.findOneAndUpdate(
    { _id: req.delivery._id },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .exec()
    .then((delivery) => {
      if (!delivery) {
        return res.status(500).json({
          error: 'delivery not found'
        })
      }

      return res.json({
        success: 'Remove delivery successfully',
        delivery
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreDelivery = (req, res) => {
  Delivery.findOneAndUpdate(
    { _id: req.delivery._id },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .exec()
    .then((delivery) => {
      if (!delivery) {
        return res.status(500).json({
          error: 'delivery not found'
        })
      }

      return res.json({
        success: 'Restore delivery successfully',
        delivery
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.listActiveDeliveries = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const regex = search
    .split(' ')
    .filter((w) => w)
    .join('|')

  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc'

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
    $or: [
      { name: { $regex: regex, $options: 'i' } },
      { description: { $regex: regex, $options: 'i' } }
    ],
    isDeleted: false
  }

  Delivery.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List active deliveries not found'
      })
    }

    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    if (count <= 0) {
      return res.json({
        success: 'Load list active deliveries successfully',
        filter,
        size,
        deliveries: []
      })
    }

    Delivery.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
      .then((deliveries) => {
        return res.json({
          success: 'Load list active deliveries successfully',
          filter,
          size,
          deliveries
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list active deliveries failed'
        })
      })
  })
}

exports.listDeliveries = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const regex = search
    .split(' ')
    .filter((w) => w)
    .join('|')

  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc'

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
    $or: [
      { name: { $regex: regex, $options: 'i' } },
      { description: { $regex: regex, $options: 'i' } }
    ]
  }

  Delivery.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List deliveries not found'
      })
    }

    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    if (count <= 0) {
      return res.json({
        success: 'Load list deliveries successfully',
        filter,
        size,
        deliveries: []
      })
    }

    Delivery.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
      .then((deliveries) => {
        return res.json({
          success: 'Load list deliveries successfully',
          filter,
          size,
          deliveries
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list deliveries failed'
        })
      })
  })
}
