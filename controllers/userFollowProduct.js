const UserFollowProduct = require('../models/userFollowProduct')
const Product = require('../models/product')

exports.followProduct = (req, res) => {
  const userId = req.user._id
  const productId = req.product._id

  UserFollowProduct.findOneAndUpdate(
    { userId, productId },
    { isDeleted: false },
    { upsert: true, new: true }
  )
    .exec()
    .then((follow) => {
      if (!follow)
        return res.status(400).json({
          error: 'Follow is already exists'
        })
      else
        Product.findOne({ _id: productId })
          .populate({
            path: 'categoryId',
            populate: {
              path: 'categoryId',
              populate: { path: 'categoryId' }
            }
          })
          .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
          })
          .populate('storeId', '_id name avatar isActive isOpen')
          .exec()
          .then((product) => {
            if (!product) {
              return res.status(404).json({
                error: 'Sản phẩm không tồn tại'
              })
            }

            return res.json({
              success: 'Following product',
              product
            })
          })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Follow product failed'
      })
    })
}

exports.unfollowProduct = (req, res) => {
  const userId = req.user._id
  const productId = req.product._id

  UserFollowProduct.findOneAndUpdate(
    { userId, productId },
    { isDeleted: true },
    { upsert: true, new: true }
  )
    .exec()
    .then((follow) => {
      if (!follow)
        return res.status(400).json({
          error: 'Follow is not exists'
        })
      else
        Product.findOne({ _id: productId })
          .populate({
            path: 'categoryId',
            populate: {
              path: 'categoryId',
              populate: { path: 'categoryId' }
            }
          })
          .populate({
            path: 'variantValueIds',
            populate: { path: 'variantId' }
          })
          .populate('storeId', '_id name avatar isActive isOpen')
          .exec()
          .then((product) => {
            if (!product) {
              return res.status(404).json({
                error: 'Sản phẩm không tồn tại'
              })
            }

            return res.json({
              success: 'Product unFollowed',
              product
            })
          })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'UnFollowing product failed'
      })
    })
}

exports.checkFollowingProduct = (req, res) => {
  const userId = req.user._id
  const productId = req.product._id

  UserFollowProduct.findOne({ userId, productId, isDeleted: false })
    .exec()
    .then((follow) => {
      if (!follow) {
        return res.json({
          error: 'Following product not found'
        })
      } else {
        return res.json({
          success: 'Following product'
        })
      }
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Favorite product not found'
      })
    })
}

exports.getNumberOfFollowersForProduct = (req, res) => {
  const productId = req.product._id
  UserFollowProduct.countDocuments(
    { productId, isDeleted: false },
    (error, count) => {
      if (error) {
        return res.status(404).json({
          error: 'Following product not found'
        })
      }

      return res.json({
        success: 'get product number of followers successfully',
        count
      })
    }
  )
}

//?limit=...&page=...
exports.listFollowingProductsByUser = (req, res) => {
  const userId = req.user._id
  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = (page - 1) * limit

  const filter = {
    limit,
    pageCurrent: page
  }

  UserFollowProduct.find({ userId, isDeleted: false })
    .exec()
    .then((follows) => {
      const productIds = follows.map((follow) => follow.productId)
      Product.countDocuments(
        { _id: { $in: productIds }, isActive: true, isSelling: true },
        (error, count) => {
          if (error) {
            return res.status(404).json({
              error: 'Following products not found'
            })
          }

          const size = count
          const pageCount = Math.ceil(size / limit)
          filter.pageCount = pageCount

          if (page > pageCount) {
            skip = (pageCount - 1) * limit
          }

          if (count <= 0) {
            return res.json({
              success: 'Load list following products successfully',
              filter,
              size,
              products: []
            })
          }

          Product.find({
            _id: { $in: productIds },
            isActive: true,
            isSelling: true
          })
            .sort({ name: 1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
              path: 'categoryId',
              populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' }
              }
            })
            .populate({
              path: 'variantValueIds',
              populate: { path: 'variantId' }
            })
            .populate('storeId', '_id name avatar isActive isOpen')
            .exec()
            .then((products) => {
              return res.json({
                success: 'Load list following products successfully',
                filter,
                size,
                products
              })
            })
        }
      )
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list followings products failed'
      })
    })
}
