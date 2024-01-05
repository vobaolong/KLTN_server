const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')

const createProduct = asyncHandler(async (req, res) => {
  if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
  const newProduct = await Product.create(req.body)
  return res.status(200).json({
    success: newProduct ? true : false,
    createdProduct: newProduct ? newProduct : 'Cannot create new product'
  })
})
const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const product = await Product.findById(pid)
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : 'Cannot get product'
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
  // execute query
  queryCommand.exec(async (error, response) => {
    if (error) throw new Error(error.message)
    const counts = await Product.find(formattedQueries).countDocuments()
  })
  return res.status(200).json({
    success: response ? true : false,
    productDatas: response ? response : 'Cannot get products',
    counts
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
    updatedProduct: updatedProduct ? updatedProduct : 'Cannot update product'
  })
})
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params
  const deletedProduct = await Product.findByIdAndDelete(pid)
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : 'Cannot delete product'
  })
})

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct
}
