const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found!`)
  res.status(404)
  next(error)
}

const errorHandler = (error, req, res, next) => {
  // check nếu là lỗi db hay gì khác thì đổi thành lỗi server (500) không thì trả về 404
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  return res.status(statusCode).json({
    success: false,
    mess: error?.message
  })
}

module.exports = {
  notFound,
  errorHandler
}
