const UserLevel = require('../models/userLevel')
const { errorHandler } = require('../helpers/errorHandler')

exports.userLevelById = (req, res, next, id) => {
  UserLevel.findById(id, (error, userLevel) => {
    if (error || !userLevel) {
      return res.status(404).json({
        error: 'User level not found'
      })
    }

    req.userLevel = userLevel
    next()
  })
}

exports.getUserLevel = (req, res) => {
  const point = req.user.point >= 0 ? req.user.point : 0

  UserLevel.find({ minPoint: { $lte: point }, isDeleted: false })
    .sort('-minPoint')
    .limit(1)
    .exec()
    .then((lvs) => {
      return res.json({
        success: 'Get user level successfully',
        level: {
          point: req.user.point,
          name: lvs[0].name,
          minPoint: lvs[0].minPoint,
          discount: lvs[0].discount,
          color: lvs[0].color
        }
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Get user level failed'
      })
    })
}

exports.createUserLevel = (req, res) => {
  const { name, minPoint, discount, color } = req.body

  const level = new UserLevel({ name, minPoint, discount, color })
  level.save((error, level) => {
    if (error || !level) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create user level successfully'
    })
  })
}

exports.updateUserLevel = (req, res) => {
  const { name, minPoint, discount, color } = req.body

  UserLevel.findOneAndUpdate(
    { _id: req.userLevel._id },
    { $set: { name, minPoint, discount, color } }
  )
    .exec()
    .then((level) => {
      if (!level) {
        return res.status(500).json({
          error: 'User level not found'
        })
      }

      return res.json({
        success: 'Update user level successfully'
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeUserLevel = (req, res) => {
  UserLevel.findOneAndUpdate(
    { _id: req.userLevel._id },
    { $set: { isDeleted: true } }
  )
    .exec()
    .then((level) => {
      if (!level) {
        return res.status(500).json({
          error: 'User level not found'
        })
      }

      return res.json({
        success: 'Remove user level successfully'
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreUserLevel = (req, res) => {
  UserLevel.findOneAndUpdate(
    { _id: req.userLevel._id },
    { $set: { isDeleted: false } }
  )
    .exec()
    .then((level) => {
      if (!level) {
        return res.status(500).json({
          error: 'User level not found'
        })
      }

      return res.json({
        success: 'Restore user level successfully'
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

//?search=...&sortBy=...&order=...
exports.listUserLevel = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc' //desc

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

  UserLevel.countDocuments(
    { name: { $regex: search, $options: 'i' } },
    (error, count) => {
      if (error) {
        return res.status(404).json({
          error: 'List user level not found'
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
          success: 'Load list user levels successfully',
          filter,
          size,
          levels: []
        })
      }

      UserLevel.find({ name: { $regex: search, $options: 'i' } })
        .sort({ [sortBy]: order, _id: 1 })
        .skip(skip)
        .limit(limit)
        .exec()
        .then((levels) => {
          return res.json({
            success: 'Load list user levels successfully',
            filter,
            size,
            levels
          })
        })
        .catch((error) => {
          return res.status(500).json({
            error: 'Load list user levels failed'
          })
        })
    }
  )
}

exports.listActiveUserLevel = (req, res) => {
  UserLevel.find({ isDeleted: false })
    .exec()
    .then((levels) => {
      return res.json({
        success: 'Load list active user levels successfully',
        levels
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list active user levels failed'
      })
    })
}
