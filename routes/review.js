const express = require('express')
const router = express.Router()

//import controllers
const { isAuth } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const {
  reviewById,
  createReview,
  updateReview,
  removeReview,
  updateRating,
  listReviews,
  checkReview
} = require('../controllers/review')

//routes
router.get('/reviews', listReviews)
router.post('/review/check/:userId', isAuth, checkReview)
router.post('/review/create/:userId', isAuth, createReview, updateRating)
router.put('/review/:reviewId/:userId', isAuth, updateReview, updateRating)
router.delete('/review/:reviewId/:userId', isAuth, removeReview, updateRating)

//router params
router.param('reviewId', reviewById)
router.param('userId', userById)

module.exports = router
