/*------
  TEST
  ------*/
const Slug = require('../models/slugModel')
const { errorHandler } = require('../helpers/errorHandler')

exports.createSlug = (req, res, next) => {
  console.log('---CREATE SLUG---')
  const { slug, id, ref } = req.createSlug
  Slug.find({ id, ref })
    .sort('-_id')
    .exec()
    .then((slugs) => {
      if (slugs.length > 1) {
        const days =
          (slugs[0].createdAt.getTime() - new Date().getTime()) /
          (1000 * 3600 * 24)
        if (days < 14) {
          console.log(
            `---CREATE SLUG FAILED---: Can create new slug after ${
              14 - days
            } days`
          )
        } else {
          const newSlug = new Slug({ slug, id, ref })
          newSlug.save((error, slug) => {
            if (error || !slug) {
              console.log('---CREATE SLUG FAILED---')
            } else {
              console.log('---CREATE NEW SLUG SUCCESSFULLY---')
              next()
              Slug.deleteOne({ _id: slugs[1]._id })
                .exec()
                .then(() => {
                  console.log('---REMOVE OLD SLUG FAILED---')
                })
                .catch((error) => {
                  console.log('---REMOVE OLD SLUG SUCCESSFULLY---')
                })
            }
          })
        }
      } else {
        const newSlug = new Slug({ slug, id, ref })
        newSlug.save((error, slug) => {
          if (error || !slug) {
            console.log('---CREATE SLUG FAILED---')
          }
          console.log('---CREATE SLUG SUCCESSFULLY---')
          next()
        })
      }
    })
}

exports.userIdBySlug = (req, res) => {
  const { slug } = req.body
  Slug.find({ slug: slug, ref: 'user' })
    .sort('-_id')
    .exec()
    .then((slugs) => {
      return res.json({
        success: 'Get userId by slug successfully',
        slug: slugs[0].slug,
        userId: slug[0].id
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Slug not found'
      })
    })
}

exports.storeIdBySlug = (req, res) => {
  const { slug } = req.body
  Slug.find({ slug: slug, ref: 'store' })
    .sort('-_id')
    .exec()
    .then((slugs) => {
      return res.json({
        success: 'Get storeId by slug successfully',
        slug: slugs[0].slug,
        storeId: slug[0].id
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Slug not found'
      })
    })
}

exports.productIdBySlug = (req, res) => {
  const { slug } = req.body
  Slug.find({ slug: slug, ref: 'product' })
    .sort('-_id')
    .exec()
    .then((slugs) => {
      return res.json({
        success: 'Get productId by slug successfully',
        slug: slugs[0].slug,
        productId: slug[0].id
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Slug not found'
      })
    })
}
