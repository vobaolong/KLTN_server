const { validationResult } = require('express-validator')

exports.validateHandler = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const firstError = errors.errors.map((error) => error.msg)[0]
    return res.status(400).json({ error: firstError })
  }

  next()
}
