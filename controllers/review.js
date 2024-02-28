const Review = require('../models/review')
const Product = require('../models/product')
const Store = require('../models/store')
const { errorHandler } = require('../helpers/errorHandler')
const { cleanUserLess } = require('../helpers/userHandler')

exports.reviewById = (req, res, next, id) => {
  Review.findById(id, (error, review) => {
    if (error || !review) {
      return res.status(404).json({
        error: 'Review not found'
      })
    }

    req.review = review
    next()
  })
}

exports.checkReview = (req, res) => {
  const { orderId, productId } = req.body
  console.log(orderId, productId)
  Review.findOne({ userId: req.user._id, orderId, productId })
    .exec()
    .then((review) => {
      if (!review)
        return res.status(404).json({
          error: 'Review not found'
        })

      return res.json({
        success: 'Reviewed',
        review
      })
    })
    .catch((err) => {
      return res.status(404).json({
        error: 'Review not found'
      })
    })
}

exports.createReview = (req, res, next) => {
  const { content, rating, storeId, productId, orderId } = req.body

  if (!rating || !storeId || !productId || !orderId)
    return res.status(400).json({
      error: 'All fields are required'
    })

  const review = new Review({
    content,
    rating,
    userId: req.user._id,
    storeId,
    productId,
    orderId
  })
  review.save((error, review) => {
    if (error || !review)
      return res.status(400).json({
        error: errorHandler(error)
      })
    else {
      //update rating
      next()
      return res.json({
        success: 'Review successfully',
        review
      })
    }
  })
}

exports.updateReview = (req, res, next) => {
  const { content, rating } = req.body

  if (!content || !rating)
    return res.status(400).json({
      error: 'All fields are required'
    })

  Review.findOneAndUpdate(
    { _id: req.review._id, userId: req.user._id },
    { $set: { content, rating } },
    { new: true }
  )
    .exec()
    .then((review) => {
      if (!review)
        return res.status(400).json({
          error: errorHandler(error)
        })
      else {
        //update rating
        next()
        return res.json({
          success: 'Update review successfully',
          review
        })
      }
    })
}

exports.removeReview = (req, res, next) => {
  Review.deleteOne(
    { _id: req.review._id, userId: req.user._id },
    (error, review) => {
      if (error)
        return res.status(400).json({
          error: errorHandler(error)
        })
      else {
        req.body = {
          ...req.body,
          productId: req.review.productId,
          storeId: req.review.storeId
        }
        next()
        return res.json({
          success: 'Remove review successfully',
          review
        })
      }
    }
  )
}

exports.updateRating = (req, res) => {
  const { productId, storeId } = req.body
  Review.aggregate(
    [
      {
        $group: {
          _id: '$productId',
          rating: {
            $sum: '$rating'
          },
          count: { $sum: 1 }
        }
      }
    ],
    (error, result) => {
      if (error) console.log(error)
      else {
        const temp = result.filter((r) => r._id.equals(productId))[0]
        const rating = temp
          ? (parseFloat(temp.rating) / parseFloat(temp.count)).toFixed(1)
          : 3
        Product.findOneAndUpdate({ _id: productId }, { $set: { rating } })
          .exec()
          .then((product) => {
            if (!product) console.log('---UPDATE PRODUCT RATING FAILED---')
            else console.log('---UPDATE PRODUCT RATING SUCCESSFULLY---', rating)
          })
          .catch((error) => {
            console.log('---UPDATE PRODUCT RATING FAILED---')
          })
      }
    }
  )

  Review.aggregate(
    [
      {
        $group: {
          _id: '$storeId',
          rating: {
            $sum: '$rating'
          },
          count: { $sum: 1 }
        }
      }
    ],
    (error, result) => {
      if (error) console.log(error)
      else {
        const temp = result.filter((r) => r._id.equals(storeId))[0]
        const rating = temp
          ? (parseFloat(temp.rating) / parseFloat(temp.count)).toFixed()
          : 3
        Store.findOneAndUpdate({ _id: storeId }, { $set: { rating } })
          .exec()
          .then((store) => {
            if (!store) console.log('---UPDATE STORE RATING FAILED---')
            else console.log('---UPDATE STORE RATING SUCCESSFULLY---', rating)
          })
          .catch((error) => {
            console.log('---UPDATE STORE RATING FAILED---')
          })
      }
    }
  )
}

exports.listReviews = (req, res) => {
  const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'desc'

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = limit * (page - 1)

  const filter = {
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  const filterArgs = {}

  if (req.query.productId) {
    filter.productId = req.query.productId
    filterArgs.productId = req.query.productId
  }

  if (req.query.storeId) {
    filter.storeId = req.query.storeId
    filterArgs.storeId = req.query.storeId
  }

  if (req.query.userId) {
    filter.userId = req.query.userId
    filterArgs.userId = req.query.userId
  }

  if (req.query.rating && req.query.rating > 0 && req.query.rating < 6) {
    filter.rating = parseInt(req.query.rating)
    filterArgs.rating = parseInt(req.query.rating)
  }

  Review.countDocuments(filterArgs, (error, count) => {
    if (error)
      return res.status(404).json({
        error: 'Reviews not found'
      })

    const size = count
    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    if (count <= 0) {
      return res.json({
        success: 'Load list reviews successfully',
        filter,
        size,
        reviews: []
      })
    }

    Review.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', '_id firstName lastName avatar')
      .populate('productId', '_id name listImages isActive isSelling')
      .populate('storeId', '_id name avatar isActive isOpen')
      .exec()
      .then((reviews) => {
        return res.json({
          success: 'Load list reviews successfully',
          filter,
          size,
          reviews
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list reviews failed'
        })
      })
  })
}
