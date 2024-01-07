const slugify = require('slugify')
const Product = require('../models/product.model')
const asyncHandler = require('express-async-handler')

const createProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
  const newProduct = await Product.create(req.body)
  return res.status(200).json({
    success: newProduct ? true : false,
    createdProduct: newProduct ? newProduct : 'Cant create new product'
  })
})
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const product = await Product.findById(pid)
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : 'Cant get product'
  })
})

// Filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
  const queries = { ...req.query }
  // Tách các trường đặc biệt ra khởi query
  const excludeFields = ['limit', 'sort', 'page', 'fields']
  excludeFields.forEach((e) => delete queries[e])

  let queryString = JSON.stringify(queries)
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (matchedEl) => `$${matchedEl}`
  )
  const formattedQueries = JSON.parse(queryString)

  //  Filter
  if (queries?.title)
    formattedQueries.title = { $regex: queries.title, $option: 'i' }
  let queryCommand = Product.find(formattedQueries)

  // sort
  if (req.query.sort) {
    const sortBy = req.query.split(',').join(' ')
    queryCommand = queryCommand.sort(sortBy)
  }

  // fields limit
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ')
    queryCommand = queryCommand.select(fields)
  }

  // pagination
  // + = convert sang number
  const page = +req.query.page || 1
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
  const skip = (page - 1) * limit
  queryCommand.skip(skip).limit(limit)

  // execute query
  queryCommand.exec(async (error, response) => {
    if (error) throw new Error(error.message)
    const counts = await Product.find(formattedQueries).countDocuments()
    return res.status(200).json({
      success: response ? true : false,
      products: response ? response : 'Cant get products',
      counts
    })
  })
})

const updateProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true
  })
  return res.status(200).json({
    success: updatedProduct ? true : false,
    updatedProduct: updatedProduct ? updatedProduct : 'Cant update product'
  })
})

const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const deletedProduct = await Product.findByIdAndDelete(pid)
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : 'Cant delete product'
  })
})

const ratings = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { star, comment, pid } = req.body
  if (!star || !pid) throw new Error('Missing value for star')
  const ratingProduct = await Product.findById(pid)
  const alreadyRating = ratingProduct?.ratings?.find(
    (e) => e.postedBy.toString() === _id
  )

  if (alreadyRating) {
    // update rating
    await Product.updateOne(
      {
        rating: { $elemMatch: alreadyRating }
      },
      {
        $set: { 'ratings.$.star': star, 'ratings.$.comment': comment }
      }
    )
  } else {
    // add rating
    await Product.findByIdAndUpdate(
      pid,
      {
        $push: { ratings: { star, comment, postedBy: _id } }
      },
      { new: true }
    )
  }

  // sum ratings
  const updatedProduct = await Product.findById(pid)
  const ratingCount = updatedProduct.ratings.length
  const sumRatings = updatedProduct.ratings.reduce((sum, e) => sum + +e.star, 0)
  updatedProduct.totalRatings = Math.round((sumRatings * 10) / ratingCount) / 10

  await updatedProduct.save()

  return res.status(200).json({
    status: true,
    updatedProduct
  })
})

const uploadImgProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  if (!req.files) throw new Error('Missing value')
  const response = await Product.findByIdAndUpdate(
    pid,
    {
      $push: { images: { $each: req.files.map((e) => e.path) } }
    },
    { new: true }
  )
  return res.status(200).json({
    status: response ? true : false,
    updatedProduct: response ? response : 'Cant upload image product'
  })
})

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  ratings,
  uploadImgProduct
}
