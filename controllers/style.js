const Style = require('../models/style')
const { errorHandler } = require('../helpers/errorHandler')

exports.styleById = (req, res, next, id) => {
  Style.findById(id, (error, style) => {
    if (error || !style) {
      return res.status(404).json({
        error: 'Style not found'
      })
    }

    req.style = style
    next()
  })
}

exports.getStyle = (req, res) => {
  Style.findOne({ _id: req.style._id })
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
    .then((style) => {
      if (!style)
        return res.status(500).json({
          error: 'Load style failed'
        })

      return res.json({
        success: 'Load style successfully',
        style: style
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load style failed'
      })
    })
}

exports.checkStyle = (req, res, next) => {
  const { name, categoryIds } = req.body
  const styleId = req.style ? req.style._id : null

  Style.findOne({ _id: { $ne: styleId }, name, categoryIds })
    .exec()
    .then((category) => {
      if (!category) next()
      else
        return res.status(400).json({
          error: 'Style already exists'
        })
    })
    .catch((error) => {
      next()
    })
}

exports.createStyle = (req, res) => {
  const { name, categoryIds } = req.body

  if (!name || !categoryIds)
    return res.status(400).json({
      error: 'All fields are required'
    })

  const style = new Style({
    name,
    categoryIds
  })

  style.save((error, style) => {
    if (error || !style) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create style successfully',
      style
    })
  })
}

exports.updateStyle = (req, res, next) => {
  const { name, categoryIds } = req.body

  if (!name || !categoryIds)
    return res.status(400).json({
      error: 'All fields are required'
    })

  Style.findOneAndUpdate(
    { _id: req.style._id },
    { $set: { name, categoryIds } },
    { new: true }
  )
    .exec()
    .then((style) => {
      if (!style) {
        return res.status(500).json({
          error: 'style not found'
        })
      }

      return res.json({
        success: 'Update style successfully',
        style
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeStyle = (req, res, next) => {
  Style.findOneAndUpdate(
    { _id: req.style._id },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .exec()
    .then((style) => {
      if (!style) {
        return res.status(500).json({
          error: 'style not found'
        })
      }

      req.style = style
      next()
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreStyle = (req, res, next) => {
  Style.findOneAndUpdate(
    { _id: req.style._id },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .exec()
    .then((style) => {
      if (!style) {
        return res.status(500).json({
          error: 'style not found'
        })
      }

      req.style = style
      next()
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.listActiveStyles = (req, res) => {
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
    name: { $regex: regex, $options: 'i' },
    categoryIds: categoryId,
    isDeleted: false
  }

  Style.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List active styles not found'
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
        success: 'Load list active styles successfully',
        filter,
        size,
        styles: []
      })
    }

    Style.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
      .then((styles) => {
        return res.json({
          success: 'Load list active styles successfully',
          filter,
          size,
          styles
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list active styles failed'
        })
      })
  })
}

exports.listStyles = (req, res) => {
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
    filterArgs.categoryIds = req.query.categoryId
  }

  Style.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'List styles not found'
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
        success: 'Load list styles successfully',
        filter,
        size,
        styles: []
      })
    }

    Style.find(filterArgs)
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
      .then((styles) => {
        return res.json({
          success: 'Load list styles successfully',
          filter,
          size,
          styles
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list styles failed'
        })
      })
  })
}
