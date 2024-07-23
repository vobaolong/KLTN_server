const express = require('express')
const router = express.Router()

//import controllers
const { isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { checkListCategoriesChild } = require('../controllers/category')
const {
  brandById,
  getBrand,
  checkBrand,
  createBrand,
  updateBrand,
  removeBrand,
  restoreBrand,
  listBrands,
  listBrandCategories
} = require('../controllers/brand')

//routes
router.get('/brand/by/id/:brandId/:userId', isAuth, isAdmin, getBrand)
router.get('/active/brands', listBrandCategories, listBrands)
router.get('/brands', listBrands)
router.get('/brands/:userId', isAuth, isAdmin, listBrands)
router.post(
  '/brand/create/:userId',
  isAuth,
  isAdmin,
  checkListCategoriesChild,
  checkBrand,
  createBrand
)
router.put(
  '/brand/:brandId/:userId',
  isAuth,
  isAdmin,
  checkListCategoriesChild,
  checkBrand,
  updateBrand
)
router.delete('/brand/:brandId/:userId', isAuth, isAdmin, removeBrand)
router.get('/brand/restore/:brandId/:userId', isAuth, isAdmin, restoreBrand)

//router params
router.param('brandId', brandById)
router.param('userId', userById)

module.exports = router
