const Commission = require('../models/commission')
const { errorHandler } = require('../helpers/errorHandler')

//?search=...&sortBy=...&order=...
exports.listCommissions = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc' //desc;

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

  Commission.countDocuments(
    {
      name: {
        $regex: search,
        $options: 'i'
      }
    },
    (error, count) => {
      if (error) {
        return res.status(404).json({
          error: 'List commissions not found'
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
          success: 'Load list commissions successfully',
          filter,
          size,
          commissions: []
        })
      }

      Commission.find({ name: { $regex: search, $options: 'i' } })
        .sort({ [sortBy]: order, _id: 1 })
        .skip(skip)
        .limit(limit)
        .exec()
        .then((commissions) => {
          return res.json({
            success: 'Load list commissions successfully',
            filter,
            size,
            commissions
          })
        })
        .catch((error) => {
          return res.status(500).json({
            error: 'Load list commissions failed'
          })
        })
    }
  )
}

exports.listActiveCommissions = (req, res) => {
  Commission.find({ isDeleted: false })
    .exec()
    .then((commissions) => {
      commissions.forEach((commission) => {
        commission.isDeleted = undefined
      })

      return res.json({
        success: 'Load list active commissions successfully',
        commissions
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list active commissions failed'
      })
    })
}

exports.createCommission = (req, res) => {
  const { name, fee, description } = req.body

  const commission = new Commission({ name, fee, description })
  commission.save((error, commission) => {
    if (error || !commission) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create commission successfully'
    })
  })
}

exports.updateCommission = (req, res) => {
  const commissionId = req.params.commissionId
  const { name, fee, description } = req.body

  Commission.findOneAndUpdate(
    { _id: commissionId },
    { $set: { name, fee, description } }
  )
    .exec()
    .then((commission) => {
      if (!commission) {
        return res.status(404).json({
          error: 'Commission not found'
        })
      }

      return res.json({
        success: 'Update commission successfully'
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Commission not found'
      })
    })
}

exports.removeCommission = (req, res) => {
  const commissionId = req.params.commissionId

  Commission.findOneAndUpdate(
    { _id: commissionId },
    { $set: { isDeleted: true } }
  )
    .exec()
    .then((commission) => {
      if (!commission) {
        return res.status(404).json({
          error: 'Commission not found'
        })
      }

      return res.json({
        success: 'Remove commission successfully'
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Commission not found'
      })
    })
}

exports.restoreCommission = (req, res) => {
  const commissionId = req.params.commissionId

  Commission.findOneAndUpdate(
    { _id: commissionId },
    { $set: { isDeleted: false } }
  )
    .exec()
    .then((commission) => {
      if (!commission) {
        return res.status(404).json({
          error: 'Commission not found'
        })
      }

      return res.json({
        success: 'Restore commission successfully'
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Commission not found'
      })
    })
}
