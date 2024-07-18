const Brand = require('../models/brand')
const { errorHandler } = require('../helpers/errorHandler')

exports.brandById = (req, res, next, id) => {
  Brand.findById(id, (error, brand) => {
    if (error || !brand) {
      return res.status(404).json({
        error: 'Brand not found'
      })
    }

    req.brand = brand
    next()
  })
}

exports.getBrand = (req, res) => {
  Brand.findOne({ _id: req.brand._id })
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
    .then((brand) => {
      if (!brand)
        return res.status(500).json({
          error: 'Load brand failed'
        })

      return res.json({
        success: 'Load brand successfully',
        brand: brand
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load brand failed'
      })
    })
}

exports.checkBrand = (req, res, next) => {
  const { name, categoryIds } = req.body
  const brandId = req.brand ? req.brand._id : null

  Brand.findOne({ _id: { $ne: brandId }, name, categoryIds })
    .exec()
    .then((category) => {
      if (!category) next()
      else
        return res.status(400).json({
          error: 'Thương hiệu đã tồn tại'
        })
    })
    .catch((error) => {
      next()
    })
}

exports.createBrand = (req, res) => {
  const { name, categoryIds } = req.body

  if (!name || !categoryIds)
    return res.status(400).json({
      error: 'All fields are required'
    })

  const brand = new Brand({
    name,
    categoryIds
  })

  brand.save((error, brand) => {
    if (error || !brand) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create brand successfully',
      brand
    })
  })
}

exports.updateBrand = (req, res, next) => {
  const { name, categoryIds } = req.body

  if (!name || !categoryIds)
    return res.status(400).json({
      error: 'All fields are required'
    })

  Brand.findOneAndUpdate(
    { _id: req.brand._id },
    { $set: { name, categoryIds } },
    { new: true }
  )
    .exec()
    .then((brand) => {
      if (!brand) {
        return res.status(500).json({
          error: 'Không tìm thấy thương hiệu'
        })
      }

      return res.json({
        success: 'Update brand successfully',
        brand
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeBrand = (req, res, next) => {
  Brand.findOneAndUpdate(
    { _id: req.brand._id },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .exec()
    .then((brand) => {
      if (!brand) {
        return res.status(500).json({
          error: 'brand not found'
        })
      }

      req.brand = brand
      next()
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreBrand = (req, res, next) => {
  Brand.findOneAndUpdate(
    { _id: req.brand._id },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .exec()
    .then((brand) => {
      if (!brand) {
        return res.status(500).json({
          error: 'brand not found'
        })
      }

      req.brand = brand
      next()
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.listBrandCategories = (req, res) => {
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

  Brand.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List active brands not found'
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
        success: 'Load list active brands successfully',
        filter,
        size,
        brands: []
      })
    }

    Brand.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
      .then((brands) => {
        return res.json({
          success: 'Load list active brands successfully',
          filter,
          size,
          brands
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list active brands failed'
        })
      })
  })
}

exports.listBrands = (req, res) => {
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

  Brand.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List brands not found'
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
        success: 'Load list brands successfully',
        filter,
        size,
        brands: []
      })
    }

    Brand.find(filterArgs)
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
      .then((brands) => {
        return res.json({
          success: 'Load list brands successfully',
          filter,
          size,
          brands
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list brands failed'
        })
      })
  })
}
