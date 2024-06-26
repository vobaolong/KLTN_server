const VariantValue = require('../models/variantValue')
const { errorHandler } = require('../helpers/errorHandler')

exports.variantValueById = (req, res, next, id) => {
  VariantValue.findById(id, (error, variantValue) => {
    if (error || !variantValue) {
      return res.status(404).json({
        error: 'variant value not found'
      })
    }

    req.variantValue = variantValue
    next()
  })
}

exports.createVariantValue = (req, res, next) => {
  const { name, variantId } = req.body

  if (!name || !variantId)
    return res.status(400).json({
      error: 'All fields are required'
    })

  const variantValue = new VariantValue({ name, variantId })

  variantValue.save((error, variantValue) => {
    if (error || !variantValue) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create variant value successfully',
      variantValue
    })
  })
}

exports.updateVariantValue = (req, res) => {
  const { name } = req.body

  if (!name)
    return res.status(400).json({
      error: 'All fields are required'
    })

  VariantValue.findOneAndUpdate(
    { _id: req.variantValue._id },
    { $set: { name } },
    { new: true }
  )
    .exec()
    .then((variantValue) => {
      if (!variantValue) {
        return res.status(500).json({
          error: 'variant value not found'
        })
      }

      return res.json({
        success: 'Update variantValue successfully',
        variantValue
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeVariantValue = (req, res) => {
  VariantValue.findOneAndUpdate(
    { _id: req.variantValue._id },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .exec()
    .then((variantValue) => {
      if (!variantValue) {
        return res.status(500).json({
          error: 'variant value not found'
        })
      }

      return res.json({
        success: 'Remove variantValue successfully',
        variantValue
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreVariantValue = (req, res) => {
  VariantValue.findOneAndUpdate(
    { _id: req.variantValue._id },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .exec()
    .then((variantValue) => {
      if (!variantValue) {
        return res.status(500).json({
          error: 'variant value not found'
        })
      }

      return res.json({
        success: 'Restore variant Value successfully',
        variantValue
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeAllVariantValue = (req, res) => {
  VariantValue.updateMany(
    { variantId: req.variant._id },
    { $set: { isDeleted: true } }
  )
    .exec()
    .then(() => {
      return res.json({
        success: 'Remove variant & values successfully',
        variant: req.variant
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreAllVariantValue = (req, res) => {
  VariantValue.updateMany(
    { variantId: req.variant._id },
    { $set: { isDeleted: false } }
  )
    .exec()
    .then(() => {
      return res.json({
        success: 'Restore variant & values successfully',
        variant: req.variant
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.listActiveVariantValuesByVariant = (req, res) => {
  VariantValue.find({ variantId: req.variant._id, isDeleted: false })
    .populate('variantId')
    .sort({ name: '1', _id: 1 })
    .exec()
    .then((values) => {
      return res.json({
        success: 'Load list values of variant successfully',
        variantValues: values,
        variant: req.variant
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list values of variant failed'
      })
    })
}

exports.listVariantValuesByVariant = (req, res) => {
  VariantValue.find({ variantId: req.variant._id })
    .populate('variantId')
    .sort({ name: '1', _id: 1 })
    .exec()
    .then((values) => {
      return res.json({
        success: 'Load list values of variant successfully',
        variantValues: values,
        variant: req.variant
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list values of variant failed'
      })
    })
}
