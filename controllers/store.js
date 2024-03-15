const Store = require('../models/store')
const User = require('../models/user')
const fs = require('fs')
const { errorHandler } = require('../helpers/errorHandler')
const { cleanUser, cleanUserLess } = require('../helpers/userHandler')
const { cleanStore } = require('../helpers/storeHandler')

/*------
  STORE
  ------*/
exports.storeById = (req, res, next, id) => {
  Store.findById(id, (error, store) => {
    if (error || !store) {
      return res.status(404).json({
        error: 'Store not found'
      })
    }

    req.store = store
    next()
  })
}

exports.getStore = (req, res) => {
  Store.findOne({ _id: req.store._id })
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(404).json({
          error: 'Store not found'
        })
      }

      return res.json({
        success: 'Get store successfully',
        store: cleanStore(store)
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Store not found'
      })
    })
}

exports.getStoreProfile = (req, res) => {
  Store.findOne({
    _id: req.store._id
  })
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(404).json({
          error: 'Stores not found'
        })
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })

      return res.json({
        success: 'Get store profile successfully',
        store
      })
    })
    .catch((error) => {
      return res.status(404).json({
        error: 'Store not found'
      })
    })
}

exports.createStore = (req, res) => {
  const { name, bio, address, commissionId } = req.fields
  const avatar = req.filepaths[0]
  const cover = req.filepaths[1]

  if (!name || !bio || !address || !commissionId || !avatar || !cover) {
    try {
      fs.unlinkSync('public' + req.filepaths[0])
      fs.unlinkSync('public' + req.filepaths[1])
    } catch {}

    return res.status(400).json({
      error: 'All fields are required'
    })
  }

  const store = new Store({
    name,
    bio,
    address,
    commissionId,
    avatar,
    cover,
    ownerId: req.user._id
  })
  store.save((error, store) => {
    if (error || !store) {
      try {
        fs.unlinkSync('public' + req.filepaths[0])
        fs.unlinkSync('public' + req.filepaths[1])
      } catch {}

      return res.status(400).json({
        error: errorHandler(error)
      })
    }

    return res.json({
      success: 'Creating store successfully',
      storeId: store._id
    })
  })
}

exports.updateStore = (req, res) => {
  const { name, bio, address } = req.body

  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { name, bio, address } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(500).json({
          error: 'Store not found'
        })
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })

      return res.json({
        success: 'Update store successfully',
        store: store
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

/*------
  ACTIVE
  ------*/
exports.activeStore = (req, res, next) => {
  const { isActive } = req.body

  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { isActive } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(500).json({
          error: 'Store not found'
        })
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })

      //activeAllProducts
      req.store = store
      next()
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

/*------
  COMMISSION
  ------*/
exports.getCommission = (req, res) => {
  Store.findOne({ _id: req.store._id })
    .populate('commissionId')
    .exec()
    .then((store) => {
      if (!store)
        return res.status(500).json({
          error: 'Store not found'
        })
      else
        return res.json({
          error: 'Get commission successfully',
          commission: store.commissionId
        })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Store not found'
      })
    })
}

exports.updateCommission = (req, res) => {
  const { commissionId } = req.body

  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { commissionId } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(500).json({
          error: 'Store not found'
        })
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })
      return res.json({
        success: 'Update store commission successfully',
        store: store
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

/*------
  Open Store
  ------*/
exports.openStore = (req, res) => {
  const { isOpen } = req.body

  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { isOpen } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(404).json({
          error: 'Store not found'
        })
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })

      return res.json({
        success: 'Update store status successfully',
        store: store
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.updateAvatar = (req, res) => {
  const oldpath = req.store.avatar

  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { avatar: req.filepaths[0] } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        try {
          fs.unlinkSync('public' + req.filepaths[0])
        } catch {}

        return res.status(500).json({
          error: 'Store not found'
        })
      }

      if (oldpath != '/uploads/default.jpg') {
        try {
          fs.unlinkSync('public' + oldpath)
        } catch {}
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })

      return res.json({
        success: 'Update avatar successfully',
        store: store
      })
    })
    .catch((error) => {
      try {
        fs.unlinkSync('public' + req.filepaths[0])
      } catch {}

      return res.status(500).json({
        error: errorHandler(error)
      })
    })
}

exports.updateCover = (req, res) => {
  const oldpath = req.store.cover

  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { cover: req.filepaths[0] } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        try {
          fs.unlinkSync('public' + req.filepaths[0])
        } catch {}

        return res.status(500).json({
          error: 'Store not found'
        })
      }

      if (oldpath != '/uploads/default.jpg') {
        try {
          fs.unlinkSync('public' + oldpath)
        } catch {}
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })

      return res.json({
        success: 'Update cover successfully',
        store: store
      })
    })
    .catch((error) => {
      try {
        fs.unlinkSync('public' + req.filepaths[0])
      } catch {}

      return res.status(500).json({
        error: errorHandler(error)
      })
    })
}

/*------
  FEATURE IMAGES
  ------*/
exports.listFeatureImages = (req, res) => {
  let featured_images = req.store.featured_images
  return res.json({
    success: 'load cover successfully',
    featured_images
  })
}

exports.addFeatureImage = (req, res) => {
  let featured_images = req.store.featured_images

  const index = featured_images.length
  if (index >= 7) {
    try {
      fs.unlinkSync('public' + req.filepaths[0])
    } catch {}

    return res.status(400).json({
      error: 'Limit is 7 images'
    })
  }

  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $push: { featured_images: req.filepaths[0] } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        try {
          fs.unlinkSync('public' + req.filepaths[0])
        } catch {}

        return res.status(500).json({
          error: 'Store not found'
        })
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })
      return res.json({
        success: 'Add featured image successfully',
        store: store
      })
    })
    .catch((error) => {
      try {
        fs.unlinkSync('public' + req.filepaths[0])
      } catch {}

      return res.status(500).json({
        error: errorHandler(error)
      })
    })
}

exports.updateFeatureImage = (req, res) => {
  const index = req.query.index ? parseInt(req.query.index) : -1
  const image = req.filepaths[0]

  if (index == -1 || !image)
    return res.status(400).json({
      error: 'Update feature image failed'
    })

  let featured_images = req.store.featured_images
  if (index >= featured_images.length) {
    try {
      fs.unlinkSync('public' + image)
    } catch {}

    return res.status(404).json({
      error: 'Feature image not found'
    })
  }

  const oldpath = featured_images[index]
  featured_images[index] = image
  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { featured_images } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        try {
          fs.unlinkSync('public' + image)
        } catch {}

        return res.status(500).json({
          error: 'Store not found'
        })
      }

      if (oldpath != '/uploads/default.jpg') {
        try {
          fs.unlinkSync('public' + oldpath)
        } catch {}
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })
      return res.json({
        success: 'Update feature image successfully',
        store: store
      })
    })
    .catch((error) => {
      try {
        fs.unlinkSync('public' + image)
      } catch {}

      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeFeaturedImage = (req, res) => {
  const index = req.query.index ? parseInt(req.query.index) : -1
  if (index == -1)
    return res.status(400).json({
      error: 'Update feature image failed'
    })

  let featured_images = req.store.featured_images
  if (index >= featured_images.length) {
    return res.status(404).json({
      error: 'Feature image not found'
    })
  }

  try {
    fs.unlinkSync('public' + featured_images[index])
  } catch (e) {}

  //update db
  featured_images.splice(index, 1)
  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { featured_images } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(500).json({
          error: 'Store not found'
        })
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })
      return res.json({
        success: 'Remove featured image successfully',
        store: store
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

/*------
  STAFFS
  ------*/
exports.listStaffs = (req, res) => {
  Store.findOne({ _id: req.store._id })
    .select('staffIds')
    .populate(
      'staffIds',
      '_id firstName lastName slug email phone id_card point avatar cover'
    )
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(500).json({
          error: 'Store not found'
        })
      }

      store.staffIds.forEach((s) => {
        if (s.email) s.email = s.email.slice(0, 6) + '******'
        if (s.phone) s.phone = '*******' + s.phone.slice(-3)
        if (s.id_card) s.id_card = s.id_card.slice(0, 3) + '******'
      })

      return res.json({
        success: 'Load list staffs successfully',
        staffs: store.staffIds
      })
    })
    .catch((error) => {
      return res.status(500).json({
        error: 'Load list staffs failed'
      })
    })
}

exports.addStaffs = (req, res) => {
  const { staffs } = req.body
  let staffIds = req.store.staffIds

  if (staffs.length > 12 - staffIds.length)
    return res.status(400).json({
      error: 'The limit is 6 staffs'
    })

  User.countDocuments(
    { _id: { $in: staffs }, role: 'user' },
    (error, count) => {
      if (error) {
        return res.status(404).json({
          error: 'Users not found'
        })
      }

      if (count != staffs.length) {
        return res.status(400).json({
          error: 'Users is invalid'
        })
      }

      for (let i = 0; i < staffs.length; i++) {
        let flag = false
        for (let j = 0; j < staffIds.length; j++) {
          if (staffs[i] == staffIds[j]) {
            flag = true
            break
          }
        }
        if (!flag) staffIds.push(staffs[i])
      }

      Store.findOneAndUpdate(
        { _id: req.store._id },
        { $set: { staffIds: staffIds } },
        { new: true }
      )
        .populate('ownerId')
        .populate('staffIds')
        .populate('commissionId', '_id name cost')
        .exec()
        .then((store) => {
          if (!store) {
            return res.status(500).json({
              error: 'Store not found'
            })
          }

          store.ownerId = cleanUser(store.ownerId)
          store.staffIds.forEach((staff) => {
            staff = cleanUser(staff)
          })
          return res.json({
            success: 'Add list staffs successfully',
            store: store
          })
        })
        .catch((error) => {
          return res.status(400).json({
            error: errorHandler(error)
          })
        })
    }
  )
}

exports.cancelStaff = (req, res, next) => {
  const userId = req.user._id
  let staffIds = req.store.staffIds

  const index = staffIds.indexOf(userId)
  if (index == -1) {
    return res.status(400).json({
      error: 'User is not staff'
    })
  }

  staffIds.splice(index, 1)
  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { staffIds: staffIds } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(500).json({
          error: 'Store not found'
        })
      }

      return res.json({
        success: 'Cancel staff successfully'
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

exports.removeStaff = (req, res, next) => {
  const { staff } = req.body
  if (!staff) {
    return res.status(400).json({
      error: 'Staff is required'
    })
  }

  let staffIds = req.store.staffIds
  const index = staffIds.indexOf(staff)
  console.log(index)
  if (index == -1) {
    return res.status(400).json({
      error: 'User is not staff'
    })
  }

  staffIds.splice(index, 1)
  Store.findOneAndUpdate(
    { _id: req.store._id },
    { $set: { staffIds: staffIds } },
    { new: true }
  )
    .populate('ownerId')
    .populate('staffIds')
    .populate('commissionId', '_id name cost')
    .exec()
    .then((store) => {
      if (!store) {
        return res.status(500).json({
          error: 'Store not found'
        })
      }

      store.ownerId = cleanUser(store.ownerId)
      store.staffIds.forEach((staff) => {
        staff = cleanUser(staff)
      })
      return res.json({
        success: 'Remove staff successfully',
        store: store
      })
    })
    .catch((error) => {
      return res.status(400).json({
        error: errorHandler(error)
      })
    })
}

/*------
  LIST STORES
  ------*/
exports.listStoreCommissions = (req, res, next) => {
  Store.distinct('commissionId', {}, (error, commissions) => {
    if (error) {
      return res.status(400).json({
        error: 'Commissions not found'
      })
    }

    req.loadedCommissions = commissions
    next()
  })
}

//?search=...&sortBy=...&order=...&limit=...&commissionId=&page=...
exports.listStores = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const regex = search
    .split(' ')
    .filter((w) => w)
    .join('|')

  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc'

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = limit * (page - 1)

  const commissionId = req.query.commissionId
    ? [req.query.commissionId]
    : req.loadedCommissions

  const filter = {
    search,
    sortBy,
    sortMoreBy,
    order,
    commissionId,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    $or: [
      { name: { $regex: regex, $options: 'i' } },
      { bio: { $regex: regex, $options: 'i' } }
    ],
    isActive: true,
    commissionId: { $in: commissionId }
  }

  Store.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Stores not found'
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
        success: 'Load list stores successfully',
        filter,
        size,
        stores: []
      })
    }

    Store.find(filterArgs)
      .select('-e_wallet')
      .sort({ [sortBy]: order, [sortMoreBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name cost')
      .exec()
      .then((stores) => {
        stores.forEach((store) => {
          store.ownerId = cleanUser(store.ownerId)
          store.staffIds.forEach((staff) => {
            staff = cleanUser(staff)
          })
        })

        return res.json({
          success: 'Load list stores successfully',
          filter,
          size,
          stores
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list stores failed'
        })
      })
  })
}

exports.listStoresByUser = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const regex = search
    .split(' ')
    .filter((w) => w)
    .join('|')

  let isActive = [true, false]
  if (req.query.isActive == 'true') isActive = [true]
  if (req.query.isActive == 'false') isActive = [false]

  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc'

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = limit * (page - 1)

  const commissionId = req.query.commissionId
    ? [req.query.commissionId]
    : req.loadedCommissions

  const filter = {
    search,
    sortBy,
    sortMoreBy,
    order,
    isActive,
    commissionId,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    $or: [
      { name: { $regex: regex, $options: 'i' }, ownerId: req.user._id },
      { name: { $regex: regex, $options: 'i' }, staffIds: req.user._id },
      { bio: { $regex: regex, $options: 'i' }, ownerId: req.user._id },
      { bio: { $regex: regex, $options: 'i' }, staffIds: req.user._id }
    ],
    isActive: { $in: isActive },
    commissionId: { $in: commissionId }
  }

  Store.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Stores not found'
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
        success: 'Load list stores successfully',
        filter,
        size,
        stores: []
      })
    }

    Store.find(filterArgs)
      .select('-e_wallet')
      .sort({ [sortBy]: order, [sortMoreBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name cost')
      .exec()
      .then((stores) => {
        stores.forEach((store) => {
          store.ownerId = cleanUser(store.ownerId)
          store.staffIds.forEach((staff) => {
            staff = cleanUser(staff)
          })
        })

        return res.json({
          success: 'Load list stores by user successfully',
          filter,
          size,
          stores
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list stores failed'
        })
      })
  })
}

exports.listStoresForAdmin = (req, res) => {
  const search = req.query.search ? req.query.search : ''
  const regex = search
    .split(' ')
    .filter((w) => w)
    .join('|')

  let isActive = [true, false]
  if (req.query.isActive == 'true') isActive = [true]
  if (req.query.isActive == 'false') isActive = [false]

  const sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  const sortMoreBy = req.query.sortMoreBy ? req.query.sortMoreBy : '_id'
  const order =
    req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
      ? req.query.order
      : 'asc'

  const limit =
    req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
  const page =
    req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1
  let skip = limit * (page - 1)

  const commissionId = req.query.commissionId
    ? [req.query.commissionId]
    : req.loadedCommissions

  const filter = {
    search,
    sortBy,
    sortMoreBy,
    order,
    isActive,
    commissionId,
    limit,
    pageCurrent: page
  }

  const filterArgs = {
    $or: [
      { name: { $regex: regex, $options: 'i' } },
      { bio: { $regex: regex, $options: 'i' } }
    ],
    isActive: { $in: isActive },
    commissionId: { $in: commissionId }
  }

  Store.countDocuments(filterArgs, (error, count) => {
    if (error) {
      return res.status(404).json({
        error: 'Stores not found'
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
        success: 'Load list stores successfully',
        filter,
        size,
        stores: []
      })
    }

    Store.find(filterArgs)
      .select('-e_wallet')
      .sort({ [sortBy]: order, [sortMoreBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('ownerId')
      .populate('staffIds')
      .populate('commissionId', '_id name cost')
      .exec()
      .then((stores) => {
        stores.forEach((store) => {
          store.ownerId = cleanUserLess(store.ownerId)
          store.staffIds.forEach((staff) => {
            staff = cleanUserLess(staff)
          })
        })

        return res.json({
          success: 'Load list stores successfully',
          filter,
          size,
          stores
        })
      })
      .catch((error) => {
        return res.status(500).json({
          error: 'Load list stores failed'
        })
      })
  })
}
