const Category = require('../models/category')
const fs = require('fs')
const { errorHandler } = require('../helpers/errorHandler')

exports.categoryById = (req, res, next, id) => {
  Category.findById(id, (error, category) => {
    if (error || !category) {
      return res.status(404).json({
        error: 'Category not found'
      })
    }

    req.category = category
    next()
  })
}

exports.getCategory = (req, res) => {
  Category.findOne({ _id: req.category._id })
    .populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })
    .exec()
    .then((category) => {
      if (!category)
        return res.status(500).json({
          error: 'Load category failed'
        })

      return res.json({
        success: 'Load category successfully',
        category: category
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load category failed'
      })
    })
}

exports.checkCategory = (req, res, next) => {
  const { categoryId } = req.fields
  if (categoryId) {
    Category.findOne({ _id: categoryId })
      .populate('categoryId')
      .exec()
      .then((category) => {
        if (
          !category ||
          (category.categoryId != null &&
            category.categoryId.categoryId != null)
        ) {
          try {
            fs.unlinkSync('public' + req.filepaths[0])
          } catch {}

          return res.status(400).json({
            error: 'CategoryId invalid'
          })
        } else next()
      })
      .catch((error) => {
        try {
          fs.unlinkSync('public' + req.filepaths[0])
        } catch {}

        return res.status(400).json({
          error: 'CategoryId invalid'
        })
      })
  } else next()
}

exports.checkCategoryChild = (req, res, next) => {
  let { categoryId } = req.body

  try {
    if (!categoryId) categoryId = req.fields.categoryId
  } catch {}

  Category.findOne({ categoryId })
    .exec()
    .then((category) => {
      if (!category) next()
      else {
        try {
          req.filepaths.forEach((path) => {
            fs.unlinkSync('public' + path)
          })
        } catch (err) {}

        return res.status(400).json({
          error: 'CategoryId invalid'
        })
      }
    })
    .catch((error) => next())
}

exports.checkListCategoriesChild = (req, res, next) => {
  const { categoryIds } = req.body

  Category.findOne({ categoryId: { $in: categoryIds } })
    .exec()
    .then((category) => {
      if (!category) next()
      else
        return res.status(400).json({
          error: 'categoryIds invalid'
        })
    })
    .catch((error) => next())
}

exports.createCategory = (req, res) => {
  const { name, categoryId } = req.fields
  const image = req.filepaths[0]
  if (!name) {
    try {
      fs.unlinkSync('public' + req.filepaths[0])
    } catch {}

    return res.status(400).json({
      error: 'All fields are required'
    })
  }

  const category = new Category({
    name,
    categoryId,
    image
  })

  category.save((error, category) => {
    if (error || !category) {
      try {
        fs.unlinkSync('public' + req.filepaths[0])
      } catch {}

      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Creating category successfully',
      category
    })
  })
}

exports.updateCategory = (req, res) => {
  let { name, categoryId } = req.fields
  const image = req.filepaths[0] ? req.filepaths[0] : req.category.image
  if (!categoryId) categoryId = null
  else if (categoryId == req.category._id) {
    return res.status(400).json({
      error: 'categoryId invalid'
    })
  }

  if (!name || !image) {
    try {
      fs.unlinkSync('public' + req.filepaths[0])
    } catch {}

    return res.status(400).json({
      error: 'All fields are required'
    })
  }

  Category.findOneAndUpdate(
    { _id: req.category._id },
    { $set: { name, image, categoryId } },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })
    .exec()
    .then((category) => {
      if (!category) {
        try {
          fs.unlinkSync('public' + req.filepaths[0])
        } catch {}

        return res.status(400).json({
          error: errorHandler(error)
        })
      }

      return res.json({
        success: 'Update category successfully',
        category
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

exports.removeCategory = (req, res) => {
  Category.findOneAndUpdate(
    { _id: req.category._id },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })
    .exec()
    .then((category) => {
      if (!category) {
        return res.status(404).json({
          error: 'category not found'
        })
      }

      return res.json({
        success: 'Remove category successfully'
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'category not found'
      })
    })
}

exports.restoreCategory = (req, res) => {
  Category.findOneAndUpdate(
    { _id: req.category._id },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .populate({
      path: 'categoryId',
      populate: { path: 'categoryId' }
    })
    .exec()
    .then((category) => {
      if (!category) {
        return res.status(404).json({
          error: 'category not found'
        })
      }

      return res.json({
        success: 'Restore category successfully'
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'category not found'
      })
    })
}

exports.listActiveCategories = (req, res) => {
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
    name: { $regex: regex, $options: 'i' },
    isDeleted: false
  }

  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId
    filterArgs.categoryId =
      req.query.categoryId === 'null' ? null : req.query.categoryId
  }

  Category.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List active categories not found'
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
        success: 'Load list active categories successfully',
        filter,
        size,
        categories: []
      })
    }

    Category.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: { path: 'categoryId' }
      })
      .exec()
      .then((categories) => {
        return res.json({
          success: 'Load list active categories successfully',
          filter,
          size,
          categories
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list active categories failed'
        })
      })
  })
}

exports.listCategories = (req, res) => {
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
    name: { $regex: regex, $options: 'i' }
  }

  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId
    filterArgs.categoryId =
      req.query.categoryId === 'null' ? null : req.query.categoryId
  }

  Category.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List categories not found'
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
        success: 'Load list categories successfully',
        filter,
        size,
        categories: []
      })
    }

    Category.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'categoryId',
        populate: { path: 'categoryId' }
      })
      .exec()
      .then((categories) => {
        return res.json({
          success: 'Load list categories successfully',
          filter,
          size,
          categories
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list categories failed'
        })
      })
  })
}

exports.listCategoriesByStore = (req, res) => {
  Category.find({ _id: { $in: req.loadedCategories }, isDeleted: false })
    .populate({
      path: 'categoryId',
      populate: {
        path: 'categoryId'
      }
    })
    .exec()
    .then((categories) => {
      return res.json({
        success: 'Load list categories of store successfully',
        categories
      })
    })
    .catch((error) => {
      return res.status(500).json({
        success: 'Load list categories of store failed'
      })
    })
}
