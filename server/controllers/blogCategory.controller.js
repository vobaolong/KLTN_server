const slugify = require('slugify')
const BlogCategory = require('../models/blogCategory.model')
const asyncHandler = require('express-async-handler')

const createBlogCategory = asyncHandler(async (req, res) => {
  const response = await BlogCategory.create(req.body)
  return res.json({
    success: response ? true : false,
    createdCategory: response ? response : 'Cant create new category'
  })
})

const getBlogCategories = asyncHandler(async (req, res) => {
  const response = await BlogCategory.find().select('title _id')
  return res.json({
    success: response ? true : false,
    categories: response ? response : 'Cant get category'
  })
})

const updateBlogCategory = asyncHandler(async (req, res) => {
  const { bcid } = req.params
  const response = await BlogCategory.findByIdAndUpdate(bcid, req.body, {
    new: true
  })
  return res.json({
    success: response ? true : false,
    updatedCategory: response ? response : 'Cant update category'
  })
})

const deleteBlogCategory = asyncHandler(async (req, res) => {
  const { bcid } = req.params
  const response = await BlogCategory.findByIdAndDelete(bcid)
  return res.json({
    success: response ? true : false,
    deletedCategory: response ? response : 'Cant delete category'
  })
})
module.exports = {
  createBlogCategory,
  getBlogCategories,
  updateBlogCategory,
  deleteBlogCategory
}
