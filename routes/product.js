const express = require('express')
const router = express.Router()

//import controllers
const { isAuth, isAdmin, isManager } = require('../controllers/auth')
const { userById } = require('../controllers/user')
const { storeById } = require('../controllers/store')
const { checkCategoryChild } = require('../controllers/category')
const { upload } = require('../controllers/upload')
const {
  productById,
  getProduct,
  createProduct,
  updateProduct,
  sellingProduct,
  activeProduct,
  addToListImages,
  updateListImages,
  removefromListImages,
  listProductCategories,
  listProductCategoriesByStore,
  listProducts,
  listProductsByStore,
  listProductsByStoreForManager,
  listProductsForAdmin,
  getProductForManager
} = require('../controllers/product')

//routes
router.get('/product/:productId', getProduct)
router.get(
  '/product/for/manager/:productId/:storeId/:userId',
  isAuth,
  isManager,
  getProductForManager
)
router.get('/active/products', listProductCategories, listProducts)
router.get(
  '/selling/products/by/store/:storeId',
  listProductCategoriesByStore,
  listProductsByStore
)
router.get(
  '/products/by/store/:storeId/:userId',
  isAuth,
  isManager,
  listProductCategoriesByStore,
  listProductsByStoreForManager
)
router.get('/products/:userId', isAuth, isAdmin, listProductsForAdmin)
router.post(
  '/product/create/:storeId/:userId',
  isAuth,
  isManager,
  upload,
  checkCategoryChild,
  createProduct
)
router.put(
  '/product/update/:productId/:storeId/:userId',
  isAuth,
  isManager,
  upload,
  checkCategoryChild,
  updateProduct
)
router.put(
  '/product/selling/:productId/:storeId/:userId',
  isAuth,
  isManager,
  sellingProduct
)
router.put('/product/active/:productId/:userId', isAuth, isAdmin, activeProduct)
router.post(
  '/product/images/:productId/:storeId/:userId',
  isAuth,
  isManager,
  upload,
  addToListImages
)
router.put(
  '/product/images/:productId/:storeId/:userId',
  isAuth,
  isManager,
  upload,
  updateListImages
)
router.delete(
  '/product/images/:productId/:storeId/:userId',
  isAuth,
  isManager,
  removefromListImages
)

//router params
router.param('productId', productById)
router.param('userId', userById)
router.param('storeId', storeById)

module.exports = router
