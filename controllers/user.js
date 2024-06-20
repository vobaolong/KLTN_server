const User = require('../models/user')
const AddressCache = require('../models/addressCache')
const fs = require('fs')
const { errorHandler } = require('../helpers/errorHandler')
const { cleanUser, cleanUserLess } = require('../helpers/userHandler')

// USER
exports.userById = (req, res, next, id) => {
  User.findById(id, (error, user) => {
    if (error || !user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    req.user = user
    next()
  })
}

exports.getUser = (req, res) => {
  return res.json({
    success: 'Get user successfully',
    user: cleanUser(req.user)
  })
}

exports.getUserProfile = (req, res) => {
  User.findOne({ _id: req.user._id })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        })
      }

      return res.json({
        success: 'Get user profile successfully',
        user: cleanUserLess(user)
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'User not found'
      })
    })
}

exports.updateProfile = (req, res) => {
  const { firstName, lastName, id_card, email, phone } = req.body

  if (email && req.user.googleId) {
    return res.status(400).json({
      error: 'Can not update Google email address'
    })
  }

  const isEmailActive =
    email && req.user.email != email ? false : req.user.isEmailActive
  const isPhoneActive =
    phone && req.user.phone != phone ? false : req.user.isPhoneActive

  User.findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: {
        firstName,
        lastName,
        id_card,
        email,
        phone,
        isEmailActive,
        isPhoneActive
      }
    },
    { new: true }
  )
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(500).json({
          error: 'User not found'
        })
      }

      return res.json({
        success: 'Update user successfully.',
        user: cleanUserLess(user)
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.updatePassword = (req, res) => {
  let { newPassword } = req.body

  const user = req.user
  newPassword = user.encryptPassword(newPassword, user.salt)

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { hashed_password: newPassword } }
  )
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(500).json({
          error: 'User not found'
        })
      }

      return res.json({
        success: 'Update new password successfully'
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// ADDRESS
exports.addAddress = (req, res) => {
  let addresses = req.user.addresses

  if (addresses.length >= 10) {
    return res.status(400).json({
      error: 'The limit is 10 addresses'
    })
  }

  addresses.push(req.body.address.trim())
  addresses = [...new Set(addresses)]
  const addressCache = new AddressCache({
    ...req.body
  })

  addressCache.save((error, addressCacheRes) => {
    if (error || !addressCacheRes) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }
  })

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { addresses } },
    { new: true }
  )
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(500).json({
          error: 'User not found'
        })
      }

      return res.json({
        success: 'Add address successfully',
        user: cleanUserLess(user)
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.updateAddress = async (req, res) => {
  const addressIndex =
    req.query.index && req.query.index >= 0 && req.query.index <= 10
      ? parseInt(req.query.index)
      : -1
  if (addressIndex == -1)
    return res.status(400).json({
      error: 'index not found'
    })

  let addresses = req.user.addresses
  if (addresses.length <= addressIndex)
    return res.status(404).json({
      error: 'Address not found'
    })

  const index = addresses.indexOf(req.body.address.trim())
  if (index != -1 && index != addressIndex)
    return res.status(400).json({
      error: 'Address already exists'
    })

  const addressDetail = req.body.addressDetail

  if (addressDetail._id) {
    await AddressCache.findByIdAndUpdate(addressDetail._id, {
      provinceID: addressDetail.province,
      provinceName: addressDetail.provinceName,
      districtID: addressDetail.district,
      districtName: addressDetail.districtName,
      wardID: addressDetail.ward,
      wardName: addressDetail.wardName,
      address: addressDetail.street
    })
  } else {
    const newAddressCache = new AddressCache({
      provinceID: addressDetail.province,
      provinceName: addressDetail.provinceName,
      districtID: addressDetail.district,
      districtName: addressDetail.districtName,
      wardID: addressDetail.ward,
      wardName: addressDetail.wardName,
      address: addressDetail.street
    })
    await newAddressCache.save()
  }

  addresses.splice(addressIndex, 1, req.body.address.trim())
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { addresses } },
    { new: true }
  )
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(500).json({
          error: 'User not found'
        })
      }

      return res.json({
        success: 'Update address successfully',
        user: cleanUserLess(user)
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeAddress = (req, res) => {
  const addressIndex =
    req.query.index && req.query.index >= 0 && req.query.index <= 10
      ? parseInt(req.query.index)
      : -1
  if (addressIndex == -1)
    return res.status(400).json({
      error: 'index not found'
    })

  let addresses = req.user.addresses
  if (addresses.length <= addressIndex)
    return res.status(404).json({
      error: 'Address not found'
    })

  addresses.splice(addressIndex, 1)
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { addresses } },
    { new: true }
  )
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(500).json({
          error: 'User not found'
        })
      }

      return res.json({
        success: 'Remove address successfully',
        user: cleanUserLess(user)
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// AVATAR
exports.updateAvatar = (req, res) => {
  const oldpath = req.user.avatar

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { avatar: req.filepaths[0] } },
    { new: true }
  )
    .exec()
    .then((user) => {
      if (!user) {
        try {
          fs.unlinkSync('public' + req.filepaths[0])
        } catch {}

        return res.status(500).json({
          error: 'User not found'
        })
      }

      if (oldpath != '/uploads/default.webp') {
        try {
          fs.unlinkSync('public' + oldpath)
        } catch {}
      }

      return res.json({
        success: 'Update avatar successfully',
        user: cleanUserLess(user)
      })
    })
    .catch((error) => {
      try {
        fs.unlinkSync('public' + req.filepaths[0])
      } catch {}

      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// COVER
exports.updateCover = (req, res) => {
  const oldpath = req.user.cover

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { cover: req.filepaths[0] } },
    { new: true }
  )
    .exec()
    .then((user) => {
      if (!user) {
        try {
          fs.unlinkSync('public' + req.filepaths[0])
        } catch {}

        return res.status(500).json({
          error: 'User not found'
        })
      }

      if (oldpath != '/uploads/default.webp') {
        try {
          fs.unlinkSync('public' + oldpath)
        } catch {}
      }

      return res.json({
        success: 'Update cover successfully',
        user: cleanUserLess(user)
      })
    })
    .catch((error) => {
      try {
        fs.unlinkSync('public' + req.filepaths[0])
      } catch {}

      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

// LIST USERS
exports.listUser = (req, res) => {
  const search = req.query.search ? req.query.search : ''

  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc' //desc

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = (page - 1) * limit

  const filter = {
    search,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    $or: [
      {
        firstName: {
          $regex: search,
          $options: 'i'
        }
      },
      {
        lastName: {
          $regex: search,
          $options: 'i'
        }
      }
    ],
    role: { $ne: 'admin' }
  }

  User.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Users not found'
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
        success: 'Load list users successfully',
        filter,
        size,
        users: []
      })
    }

    User.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .limit(limit)
      .skip(skip)
      .exec()
      .then((users) => {
        users.forEach((user) => {
          user = cleanUser(user)
        })

        return res.json({
          success: 'Load list users successfully',
          filter,
          size,
          users
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list users failed'
        })
      })
  })
}

// list users for admin management
exports.listUserForAdmin = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'

  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc' //desc
  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = (page - 1) * limit

  const filter = {
    search,
    sortBy,
    order,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    $or: [
      {
        firstName: {
          $regex: search,
          $options: 'i'
        }
      },
      {
        lastName: {
          $regex: search,
          $options: 'i'
        }
      },
      {
        email: {
          $regex: search,
          $options: 'i'
        }
      },
      {
        phone: {
          $regex: search,
          $options: 'i'
        }
      }
    ],
    role: { $ne: 'admin' }
  }

  User.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Users not found'
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
        success: 'Load list users successfully',
        filter,
        size,
        users: []
      })
    }

    User.find(filterArgs)
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec()
      .then((users) => {
        users.forEach((user) => {
          user = cleanUserLess(user)
        })

        return res.json({
          success: 'Load list users successfully',
          filter,
          size,
          users
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list users failed'
        })
      })
  })
}
