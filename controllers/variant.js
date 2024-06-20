const Variant = require('../models/variant')
const { errorHandler } = require('../helpers/errorHandler')

exports.variantById = (req, res, next, id) => {
  Variant.findById(id, (error, variant) => {
    if (error || !variant) {
      return res.status(404).json({
        error: 'Variant not found'
      })
    }

    req.variant = variant
    next()
  })
}

exports.getVariant = (req, res) => {
  Variant.findOne({ _id: req.variant._id })
    .populate({
      path: 'categoryIds',
      populate: {
        path: 'categoryId',
        populate: {
          path: 'categoryId'
        }
      }
    })
    .exec()
    .then((variant) => {
      if (!variant)
        return res.status(500).json({
          error: 'Load variant failed'
        })

      return res.json({
        success: 'Load variant successfully',
        variant: variant
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load variant failed'
      })
    })
}

exports.checkVariant = (req, res, next) => {
  const { name, categoryIds } = req.body
  const variantId = req.variant ? req.variant._id : null

  Variant.findOne({ _id: { $ne: variantId }, name, categoryIds })
    .exec()
    .then((category) => {
      if (!category) next()
      else
        return res.status(400).json({
          error: 'Variant already exists'
        })
    })
    .catch((error) => {
      next()
    })
}

exports.createVariant = (req, res) => {
  const { name, categoryIds } = req.body

  if (!name || !categoryIds)
    return res.status(400).json({
      error: 'All fields are required'
    })

  const variant = new Variant({
    name,
    categoryIds
  })

  variant.save((error, variant) => {
    if (error || !variant) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create variant successfully',
      variant
    })
  })
}

exports.updateVariant = (req, res, next) => {
  const { name, categoryIds } = req.body

  if (!name || !categoryIds)
    return res.status(400).json({
      error: 'All fields are required'
    })

  Variant.findOneAndUpdate(
    { _id: req.variant._id },
    { $set: { name, categoryIds } },
    { new: true }
  )
    .exec()
    .then((variant) => {
      if (!variant) {
        return res.status(500).json({
          error: 'variant not found'
        })
      }

      return res.json({
        success: 'Update variant successfully',
        variant
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeVariant = (req, res, next) => {
  Variant.findOneAndUpdate(
    { _id: req.variant._id },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .exec()
    .then((variant) => {
      if (!variant) {
        return res.status(500).json({
          error: 'variant not found'
        })
      }

      req.variant = variant
      next()
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreVariant = (req, res, next) => {
  Variant.findOneAndUpdate(
    { _id: req.variant._id },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .exec()
    .then((variant) => {
      if (!variant) {
        return res.status(500).json({
          error: 'variant not found'
        })
      }

      req.variant = variant
      next()
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.listActiveVariants = (req, res) => {
  const search = req.query.search ? req.query.search : ''
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

  const categoryId = req.query.categoryId ? req.query.categoryId : null

  const filter = {
    search,
    categoryId,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    name: { $regex: search, $options: 'i' },
    categoryIds: categoryId,
    isDeleted: false
  }

  Variant.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List active variants not found'
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
        success: 'Load list active variants successfully',
        filter,
        size,
        variants: []
      })
    }

    Variant.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
      .then((variants) => {
        return res.json({
          success: 'Load list active variants successfully',
          filter,
          size,
          variants
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list active variants failed'
        })
      })
  })
}

exports.listVariants = (req, res) => {
  const search = req.query.search ? req.query.search : ''
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
    name: { $regex: search, $options: 'i' }
  }

  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId
    filterArgs.categoryIds = req.query.categoryId
  }

  Variant.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List variants not found'
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
        success: 'Load list variants successfully',
        filter,
        size,
        variants: []
      })
    }

    Variant.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .populate({
        path: 'categoryIds',
        populate: {
          path: 'categoryId',
          populate: { path: 'categoryId' }
        }
      })
      .skip(skip)
      .limit(limit)
      .exec()
      .then((variants) => {
        return res.json({
          success: 'Load list variants successfully',
          filter,
          size,
          variants
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list variants failed'
        })
      })
  })
}
