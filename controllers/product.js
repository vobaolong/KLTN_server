const Product = require('../models/product')
const Category = require('../models/category')
const fs = require('fs')
const { errorHandler } = require('../helpers/errorHandler')
//
exports.productById = (req, res, next, id) => {
  Product.findById(id, (error, product) => {
    if (error || !product) {
      return res.status(404).json({
        error: 'Product not found'
      })
    }
    req.product = product
    next()
  })
}

exports.getProductForManager = (req, res) => {
  Product.findOne({ _id: req.product._id, storeId: req.store._id })
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId',
        populate: { path: 'categoryId' }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .populate('storeId', '_id name avatar isActive isOpen')
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(500).json({
          error: 'Product not found'
        })
      }

      return res.json({
        success: 'Get product successfully',
        product
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Product not found'
      })
    })
}

exports.getProduct = (req, res) => {
  if (!req.product.isActive || !req.product.isSelling)
    return res.status(404).json({
      error: 'Active/Selling Product not found'
    })

  Product.findOne({ _id: req.product._id, isSelling: true, isActive: true })
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId',
        populate: { path: 'categoryId' }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .populate('storeId', '_id name avatar isActive isOpen')
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(500).json({
          error: 'Product not found'
        })
      }

      return res.json({
        success: 'Get product successfully',
        product
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Product not found'
      })
    })
}

exports.createProduct = (req, res) => {
  const {
    name,
    description,
    price,
    salePrice,
    quantity,
    categoryId,
    variantValueIds
  } = req.fields
  const listImages = req.filepaths
  if (
    !name ||
    !description ||
    !price ||
    !salePrice ||
    !quantity ||
    !categoryId ||
    !listImages ||
    listImages.length <= 0
  ) {
    try {
      listImages.forEach((image) => {
        fs.unlinkSync('public' + image)
      })
    } catch {}
    return res.status(400).json({
      error: 'All fields are required'
    })
  }

  let variantValueIdsArray = []
  if (variantValueIds) {
    variantValueIdsArray = variantValueIds.split('|')
  }
  const product = new Product({
    name,
    description,
    price,
    salePrice,
    quantity,
    categoryId,
    variantValueIds: variantValueIdsArray,
    isActive: req.store.isActive,
    storeId: req.store._id,
    listImages
  })

  product.save((error, product) => {
    if (error || !product) {
      try {
        listImages.forEach((image) => {
          fs.unlinkSync('public' + image)
        })
      } catch {}

      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Creating product successfully',
      product
    })
  })
}

exports.updateProduct = (req, res) => {
  const {
    name,
    description,
    price,
    salePrice,
    quantity,
    categoryId,
    variantValueIds
  } = req.fields

  if (
    !name ||
    !description ||
    !price ||
    !salePrice ||
    !quantity ||
    !categoryId
  ) {
    return res.status(400).json({
      error: 'All fields are required'
    })
  }

  let variantValueIdsArray = []
  if (variantValueIds) {
    variantValueIdsArray = variantValueIds.split('|')
  }

  Product.findOneAndUpdate(
    { _id: req.product._id },
    {
      name,
      description,
      price,
      salePrice,
      quantity,
      categoryId,
      variantValueIds: variantValueIdsArray
    },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId',
        populate: { path: 'categoryId' }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .populate('storeId', '_id name avatar isActive isOpen')
    .exec()
    .then((product) => {
      if (!product)
        return res.status(500).json({
          error: 'Product not found'
        })

      return res.json({
        success: 'Update product successfully',
        product
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// ACTIVE
exports.activeAllProduct = (req, res) => {
  const { isActive } = req.body

  Product.updateMany(
    { storeId: req.store._id },
    { $set: { isActive } },
    { new: true }
  )
    .exec()
    .then(() => {
      return res.json({
        success: 'Active/InActive store & products successfully',
        store: req.store
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// ACTIVE
exports.activeProduct = (req, res) => {
  const { isActive } = req.body

  Product.findOneAndUpdate(
    { _id: req.product._id },
    { $set: { isActive } },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId',
        populate: { path: 'categoryId' }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .populate('storeId', '_id name avatar isActive isOpen')
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(500).json({
          error: 'product not found'
        })
      }

      return res.json({
        success: 'Active/InActive product status successfully',
        product
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// hideOrShow
exports.sellingProduct = (req, res) => {
  const { isSelling } = req.body

  Product.findOneAndUpdate(
    { _id: req.product._id },
    { $set: { isSelling } },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId',
        populate: { path: 'categoryId' }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .populate('storeId', '_id name avatar isActive isOpen')
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          error: 'product not found'
        })
      }

      return res.json({
        success: 'Update product status successfully',
        product
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// listImg
exports.addToListImages = (req, res) => {
  let listImages = req.product.listImages

  const index = listImages.length
  if (index >= 7) {
    try {
      fs.unlinkSync('public' + req.filepaths[0])
    } catch {}

    return res.status(400).json({
      error: 'Limit is 7 images'
    })
  }

  Product.findOneAndUpdate(
    { _id: req.product._id },
    { $push: { listImages: req.filepaths[0] } },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId',
        populate: { path: 'categoryId' }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .populate('storeId', '_id name avatar isActive isOpen')
    .exec()
    .then((product) => {
      if (!product) {
        try {
          fs.unlinkSync('public' + req.filepaths[0])
        } catch {}

        return res.status(500).json({
          error: 'product not found'
        })
      }

      return res.json({
        success: 'Add to list image successfully',
        product
      })
    })
    .catch((error) => {
      try {
        fs.unlinkSync('public' + req.filepaths[0])
      } catch {}

      return res.status(500).json({
        error: errorHandler(error)
      })
    })
}

exports.updateListImages = (req, res) => {
  const index = req.query.index ? parseInt(req.query.index) : -1
  const image = req.filepaths[0]

  if (index == -1 || !image)
    return res.status(400).json({
      error: 'Update list image failed'
    })

  let listImages = req.product.listImages
  if (index >= listImages.length) {
    try {
      fs.unlinkSync('public' + image)
    } catch {}

    return res.status(404).json({
      error: 'Image not found'
    })
  }

  const oldpath = listImages[index]
  listImages[index] = image

  Product.findOneAndUpdate(
    { _id: req.product._id },
    { $set: { listImages } },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId',
        populate: { path: 'categoryId' }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .populate('storeId', '_id name avatar isActive isOpen')
    .exec()
    .then((product) => {
      if (!product) {
        try {
          fs.unlinkSync('public' + image)
        } catch {}

        return res.status(500).json({
          error: 'Product not found'
        })
      }

      if (oldpath != '/uploads/default.webp') {
        try {
          fs.unlinkSync('public' + oldpath)
        } catch {}
      }

      return res.json({
        success: 'Update list images successfully',
        product
      })
    })
    .catch((error) => {
      try {
        fs.unlinkSync('public' + image)
      } catch {}

      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeFromListImages = (req, res) => {
  const index = req.query.index ? parseInt(req.query.index) : -1
  if (index == -1) {
    return res.status(400).json({
      error: 'Remove from list images failed'
    })
  }

  let listImages = req.product.listImages
  if (index >= listImages.length) {
    return res.status(404).json({
      error: 'Images not found'
    })
  }

  if (listImages.length <= 1) {
    return res.status(400).json({
      error: 'listImages must not be null'
    })
  }

  try {
    fs.unlinkSync('public' + listImages[index])
  } catch (e) {}

  //update db
  listImages.splice(index, 1)

  Product.findOneAndUpdate(
    { _id: req.product._id },
    { $set: { listImages } },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId',
        populate: { path: 'categoryId' }
      }
    })
    .populate({
      path: 'variantValueIds',
      populate: { path: 'variantId' }
    })
    .populate('storeId', '_id name avatar isActive isOpen')
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(500).json({
          error: 'Product not found'
        })
      }

      return res.json({
        success: 'Remove from list images successfully',
        product
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// LIST PRODUCTS
exports.listProductCategories = (req, res, next) => {
  Product.distinct(
    'categoryId',
    { isActive: true, isSelling: true },
    (error, categories) => {
      if (error) {
        return res.status(400).json({
          error: 'Commissions not found'
        })
      }

      const categoryId = req.query.categoryId

      if (categoryId) {
        const filterCategories = categories.filter((category) =>
          category.equals(categoryId)
        )

        if (filterCategories.length > 0) {
          req.loadedCategories = filterCategories
          next()
        } else {
          Category.find({ _id: { $in: categories } })
            .populate({
              path: 'categoryId',
              populate: { path: 'categoryId' }
            })
            .exec()
            .then((newCategories) => {
              const filterCategories = newCategories
                .filter(
                  (category) =>
                    (category.categoryId &&
                      category.categoryId._id == categoryId) ||
                    (category.categoryId &&
                      category.categoryId.categoryId &&
                      category.categoryId.categoryId._id == categoryId)
                )
                .map((category) => category._id)

              req.loadedCategories = filterCategories
              next()
            })
            .catch((error) => {
              req.loadedCategories = []
              next()
            })
        }
      } else {
        req.loadedCategories = categories
        next()
      }
    }
  )
}

exports.listProductCategoriesByStore = (req, res, next) => {
  Product.distinct(
    'categoryId',
    { storeId: req.store._id, isActive: true, isSelling: true },
    (error, categories) => {
      if (error) {
        return res.status(400).json({
          error: 'Commissions not found'
        })
      }

      req.loadedCategories = categories
      next()
    }
  )
}

exports.listProducts = (req, res) => {
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

  const categoryId = req.loadedCategories

  const rating =
    req.query.rating && req.query.rating > 0 && req.query.rating < 6
      ? parseInt(req.query.rating)
      : -1
  const minPrice =
    req.query.minPrice && req.query.minPrice > 0
      ? parseInt(req.query.minPrice)
      : -1
  const maxPrice =
    req.query.maxPrice && req.query.maxPrice > 0
      ? parseInt(req.query.maxPrice)
      : -1

  const filter = {
    search,
    sortBy,
    order,
    categoryId,
    limit,
    pageCurrent: page,
    rating: rating !== -1 ? rating : 'all',
    minPrice: minPrice !== -1 ? minPrice : 0,
    maxPrice: maxPrice !== -1 ? maxPrice : 'infinite'
  }

  const filterArgs = {
    $or: [
      { name: { $regex: regex, $options: 'i' } }
      // { description: { $regex: regex, $options: 'i' } }
    ],
    categoryId: { $in: categoryId },
    isActive: true,
    isSelling: true,
    salePrice: { $gte: 0 },
    rating: { $gte: 0 }
  }

  if (rating !== -1) filterArgs.rating.$gte = rating
  if (minPrice !== -1) filterArgs.salePrice.$gte = minPrice
  if (maxPrice !== -1) filterArgs.salePrice.$lte = maxPrice

  Product.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Products not found'
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
        success: 'Load list products successfully',
        filter,
        size,
        products: []
      })
    }

    Product.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: {
          path: 'categoryId',
          populate: { path: 'categoryId' }
        }
      })
      .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
      })
      .populate('storeId', '_id name avatar isActive isOpen')
      .exec()
      .then((products) => {
        return res.json({
          success: 'Load list products successfully',
          filter,
          size,
          products
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list products failed'
        })
      })
  })
}

exports.listProductsByStore = (req, res) => {
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

  const categoryId = req.query.categoryId
    ? [req.query.categoryId]
    : req.loadedCategories

  const rating =
    req.query.rating && req.query.rating > 0 && req.query.rating < 6
      ? parseInt(req.query.rating)
      : -1
  const minPrice =
    req.query.minPrice && req.query.minPrice > 0
      ? parseInt(req.query.minPrice)
      : -1
  const maxPrice =
    req.query.maxPrice && req.query.maxPrice > 0
      ? parseInt(req.query.maxPrice)
      : -1

  const filter = {
    search,
    sortBy,
    order,
    categoryId,
    limit,
    pageCurrent: page,
    rating: rating !== -1 ? rating : 'all',
    minPrice: minPrice !== -1 ? minPrice : 0,
    maxPrice: maxPrice !== -1 ? maxPrice : 'infinite',
    storeId: req.store._id
  }

  const filterArgs = {
    $or: [
      { name: { $regex: regex, $options: 'i' } }
      // { description: { $regex: regex, $options: 'i' } }
    ],
    categoryId: { $in: categoryId },
    isSelling: true,
    isActive: true,
    storeId: req.store._id,
    salePrice: { $gte: 0 },
    rating: { $gte: 0 }
  }

  if (rating !== -1) filterArgs.rating.$gte = rating
  if (minPrice !== -1) filterArgs.salePrice.$gte = minPrice
  if (maxPrice !== -1) filterArgs.salePrice.$lte = maxPrice

  Product.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Products not found'
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
        success: 'Load list products successfully',
        filter,
        size,
        products: []
      })
    }

    Product.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: {
          path: 'categoryId',
          populate: { path: 'categoryId' }
        }
      })
      .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
      })
      .populate('storeId', '_id name avatar isActive isOpen')
      .exec()
      .then((products) => {
        return res.json({
          success: 'Load list products successfully',
          filter,
          size,
          products
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list products failed'
        })
      })
  })
}

//for manager
exports.listProductsByStoreForManager = (req, res) => {
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

  let isSelling = [true, false]
  if (req.query.isSelling == 'true') isSelling = [true]
  if (req.query.isSelling == 'false') isSelling = [false]

  const filter = {
    search,
    sortBy,
    order,
    isSelling,
    limit,
    pageCurrent: page,
    storeId: req.store._id
  }

  const filterArgs = {
    $or: [
      { name: { $regex: regex, $options: 'i' } }
      // { description: { $regex: regex, $options: 'i' } }
    ],
    isSelling: { $in: isSelling },
    storeId: req.store._id
  }

  Product.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Products not found'
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
        success: 'Load list products successfully',
        filter,
        size,
        products: []
      })
    }

    Product.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: {
          path: 'categoryId',
          populate: { path: 'categoryId' }
        }
      })
      .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
      })
      .populate('storeId', '_id name avatar isActive isOpen')
      .exec()
      .then((products) => {
        return res.json({
          success: 'Load list products successfully',
          filter,
          size,
          products
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list products failed'
        })
      })
  })
}

//for admin
exports.listProductsForAdmin = (req, res) => {
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

  let isActive = [true, false]
  if (req.query.isActive == 'true') isActive = [true]
  if (req.query.isActive == 'false') isActive = [false]

  const filter = {
    search,
    sortBy,
    order,
    isActive,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    name: { $regex: regex, $options: 'i' },
    // description: { $regex: regex, $options: 'i' },
    isActive: { $in: isActive }
  }

  Product.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Products not found'
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
        success: 'Load list products successfully',
        filter,
        size,
        products: []
      })
    }

    Product.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: {
          path: 'categoryId',
          populate: { path: 'categoryId' }
        }
      })
      .populate({
        path: 'variantValueIds',
        populate: { path: 'variantId' }
      })
      .populate('storeId', '_id name avatar isActive isOpen')
      .exec()
      .then((products) => {
        return res.json({
          success: 'Load list products successfully',
          filter,
          size,
          products
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list products failed'
        })
      })
  })
}
