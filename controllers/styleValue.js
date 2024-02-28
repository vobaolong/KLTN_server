const StyleValue = require('../models/styleValue')
const { errorHandler } = require('../helpers/errorHandler')

exports.styleValueById = (req, res, next, id) => {
  StyleValue.findById(id, (error, styleValue) => {
    if (error || !styleValue) {
      return res.status(404).json({
        error: 'Style value not found'
      })
    }

    req.styleValue = styleValue
    next()
  })
}

exports.createStyleValue = (req, res, next) => {
  const { name, styleId } = req.body

  if (!name || !styleId)
    return res.status(400).json({
      error: 'All fields are required'
    })

  const styleValue = new StyleValue({ name, styleId })

  styleValue.save((error, styleValue) => {
    if (error || !styleValue) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Create style value successfully',
      styleValue
    })
  })
}

exports.updateStyleValue = (req, res) => {
  const { name } = req.body

  if (!name)
    return res.status(400).json({
      error: 'All fields are required'
    })

  StyleValue.findOneAndUpdate(
    { _id: req.styleValue._id },
    { $set: { name } },
    { new: true }
  )
    .exec()
    .then((styleValue) => {
      if (!styleValue) {
        return res.status(500).json({
          error: 'style value not found'
        })
      }

      return res.json({
        success: 'Update styleValue successfully',
        styleValue
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeStyleValue = (req, res) => {
  StyleValue.findOneAndUpdate(
    { _id: req.styleValue._id },
    { $set: { isDeleted: true } },
    { new: true }
  )
    .exec()
    .then((styleValue) => {
      if (!styleValue) {
        return res.status(500).json({
          error: 'style value not found'
        })
      }

      return res.json({
        success: 'Remove styleValue successfully',
        styleValue
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreStyleValue = (req, res) => {
  StyleValue.findOneAndUpdate(
    { _id: req.styleValue._id },
    { $set: { isDeleted: false } },
    { new: true }
  )
    .exec()
    .then((styleValue) => {
      if (!styleValue) {
        return res.status(500).json({
          error: 'style value not found'
        })
      }

      return res.json({
        success: 'Restore style Value successfully',
        styleValue
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeAllStyleValue = (req, res) => {
  StyleValue.updateMany(
    { styleId: req.style._id },
    { $set: { isDeleted: true } }
  )
    .exec()
    .then(() => {
      return res.json({
        success: 'Remove style & values successfully',
        style: req.style
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.restoreAllStyleValue = (req, res) => {
  StyleValue.updateMany(
    { styleId: req.style._id },
    { $set: { isDeleted: false } }
  )
    .exec()
    .then(() => {
      return res.json({
        success: 'Restore style & values successfully',
        style: req.style
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.listActiveStyleValuesByStyle = (req, res) => {
  StyleValue.find({ styleId: req.style._id, isDeleted: false })
    .populate('styleId')
    .sort({ name: '1', _id: 1 })
    .exec()
    .then((values) => {
      return res.json({
        success: 'Load list values of style successfully',
        styleValues: values,
        style: req.style
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list values of style failed'
      })
    })
}

exports.listStyleValuesByStyle = (req, res) => {
  StyleValue.find({ styleId: req.style._id })
    .populate('styleId')
    .sort({ name: '1', _id: 1 })
    .exec()
    .then((values) => {
      return res.json({
        success: 'Load list values of style successfully',
        styleValues: values,
        style: req.style
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list values of style failed'
      })
    })
}
