const slugify = require('slugify')
const ProductCategory = require('../models/productCategory.model')
const asyncHandler = require('express-async-handler')

const createProductCategory = asyncHandler(async (req, res) => {
  const response = await ProductCategory.create(req.body)
  return res.json({
    success: response ? true : false,
    createdCategory: response ? response : 'Cant create new category'
  })
})

const getProductCategories = asyncHandler(async (req, res) => {
  const response = await ProductCategory.find().select('title _id')
  return res.json({
    success: response ? true : false,
    categories: response ? response : 'Cant get category'
  })
})

const updateProductCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params
  const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {
    new: true
  })
  return res.json({
    success: response ? true : false,
    updatedCategory: response ? response : 'Cant update category'
  })
})

const deleteProductCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params
  const response = await ProductCategory.findByIdAndDelete(pcid)
  return res.json({
    success: response ? true : false,
    deletedCategory: response ? response : 'Cant delete category'
  })
})
module.exports = {
  createProductCategory,
  getProductCategories,
  updateProductCategory,
  deleteProductCategory
}
