const Brand = require('../models/brand.model')
const asyncHandler = require('express-async-handler')

const createBrand = asyncHandler(async (req, res) => {
  const response = await Brand.create(req.body)
  return res.json({
    success: response ? true : false,
    createdBrand: response ? response : 'Cant create new brand'
  })
})

const getBrands = asyncHandler(async (req, res) => {
  const response = await Brand.find()
  return res.json({
    success: response ? true : false,
    brands: response ? response : 'Cant get brand'
  })
})

const updateBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params
  const response = await Brand.findByIdAndUpdate(bid, req.body, {
    new: true
  })
  return res.json({
    success: response ? true : false,
    updatedBrand: response ? response : 'Cant update brand'
  })
})

const deleteBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params
  const response = await Brand.findByIdAndDelete(bid)
  return res.json({
    success: response ? true : false,
    deletedBrand: response ? response : 'Cant delete brand'
  })
})
module.exports = {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand
}
