const StoreLevel = require('../models/storeLevel')
const { errorHandler } = require('../helpers/errorHandler')

exports.storeLevelById = (req, res, next, id) => {
  StoreLevel.findById(id, (error, storeLevel) => {
    if (error || !storeLevel) {
      return res.status(404).json({
        error: 'Store level not found'
      })
    }

    req.storeLevel = storeLevel
    next()
  })
}

exports.getStoreLevel = (req, res) => {
  const point = req.store.point >= 0 ? req.store.point : 0

  StoreLevel.find({ minPoint: { $lte: point }, isDeleted: false })
    .sort('-minPoint')
    .limit(1)
    .exec()
    .then((lvs) => {
      return res.json({
        success: 'Get store level successfully',
        level: {
          point: req.store.point,
          name: lvs[0].name,
          minPoint: lvs[0].minPoint,
          discount: lvs[0].discount,
          color: lvs[0].color
        }
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Get store level failed'
      })
    })
}

exports.createStoreLevel = (req, res) => {
  const { name, minPoint, discount, color } = req.body

  const storeLevel = new StoreLevel({ name, minPoint, discount, color })
  storeLevel.save((error, level) => {
    if (error || !level) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create store level successfully'
    })
  })
}

exports.updateStoreLevel = (req, res) => {
  const { name, minPoint, discount, color } = req.body

  StoreLevel.findOneAndUpdate(
    { _id: req.storeLevel._id },
    { $set: { name, minPoint, discount, color } }
  )
    .exec()
    .then((level) => {
      if (!level) {
        return res.status(500).json({
          error: 'Store level not found'
        })
      }

      return res.json({
        success: 'Update store level successfully'
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeStoreLevel = (req, res) => {
  StoreLevel.findOneAndUpdate(
    { _id: req.storeLevel._id },
    { $set: { isDeleted: true } }
  )
    .exec()
    .then((level) => {
      if (!level) {
        return res.status(500).json({
          error: 'Store level not found'
        })
      }

      return res.json({
        success: 'Remove store level successfully'
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreStoreLevel = (req, res) => {
  StoreLevel.findOneAndUpdate(
    { _id: req.storeLevel._id },
    { $set: { isDeleted: false } }
  )
    .exec()
    .then((level) => {
      if (!level) {
        return res.status(500).json({
          error: 'Store level not found'
        })
      }

      return res.json({
        success: 'Restore store level successfully'
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

//?search=...&sortBy=...&order=...
exports.listStoreLevel = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const order = req.query.order ? req.query.order : 'asc' //desc

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = limit * (page - 1)

  let filter = {
    search,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  StoreLevel.countDocuments(
    { name: { $regex: search, $options: 'i' } },
    (error, count) => {
      if (error) {
        return res.status(404).json({
          error: 'Store Level not found'
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
          success: 'Load list store levels successfully',
          filter,
          size,
          levels: []
        })
      }

      StoreLevel.find({ name: { $regex: search, $options: 'i' } })
        .sort({ [sortBy]: order, _id: 1 })
        .skip(skip)
        .limit(limit)
        .exec()
        .then((levels) => {
          return res.json({
            success: 'Load list store levels successfully',
            filter,
            size,
            levels
          })
        })
        .catch((error) => {
          return res.status(500).json({
            error: 'Load list store levels failed'
          })
        })
    }
  )
}

exports.listActiveStoreLevel = (req, res) => {
  StoreLevel.find({ isDeleted: false })
    .exec()
    .then((levels) => {
      return res.json({
        success: 'Load list active store levels successfully',
        levels
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list active store levels failed'
      })
    })
}
