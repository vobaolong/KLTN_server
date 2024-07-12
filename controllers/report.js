const Report = require('../models/report')
const Notification = require('../models/notification')
const {
  sendReportStoreEmail,
  sendReportProductEmail
} = require('../controllers/email')
const Store = require('../models/store')
const Product = require('../models/product')

exports.getReport = async (req, res) => {
  try {
    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt'
    const order =
      req.query.order && (req.query.order == 'asc' || req.query.order == 'desc')
        ? req.query.order
        : 'desc'

    const limit =
      req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6
    const page =
      req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1

    const isStore = req.query.isStore
    let skip = limit * (page - 1)

    const filter = {
      isStore,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }

    const size = await Report.countDocuments({
      isStore: isStore
    })

    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (page > pageCount) {
      skip = (pageCount - 1) * limit
    }

    if (size <= 0) {
      return res.json({
        success: 'Load list reports successfully',
        filter,
        size,
        reports: []
      })
    }

    const reports = await Report.find({
      isStore: isStore
    })
      .sort({ [sortBy]: order, _id: 1 })
      .skip(skip)
      .limit(limit)
      .populate('reportBy', '_id firstName lastName email')

    const newReports = await Promise.all(
      reports.map(async (report) => {
        if (report.isStore) {
          const store = await Store.findById(report.objectId)
          if (!store) return report
          return { ...report._doc, objectId: { ...store._doc } }
        } else {
          const product = await Product.findById(report.objectId)
          if (!product) return report
          return { ...report._doc, objectId: { ...product._doc } }
        }
      })
    )

    res.status(200).json({
      success: 'Load list reports successfully',
      filter,
      size,
      reports: newReports
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Lỗi server', error })
  }
}

exports.deleteReport = async (req, res) => {
  try {
    await Report.deleteOne({ _id: req.params.id })

    res.status(200).json({ message: 'Delete successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error })
  }
}

exports.report = async (req, res) => {
  try {
    const { objectId, isStore, reason, reportBy } = req.body
    const report = new Report({
      objectId,
      isStore,
      reason,
      reportBy
    })

    await report.save()

    // Gửi thông báo cho admin
    const adminId = process.env.ADMIN_ID
    const adminNotification = new Notification({
      message: `${
        isStore ? 'Có báo cáo cửa hàng mới' : 'Có báo cáo sản phẩm mới'
      }: ${reason}`,
      userId: adminId,
      isRead: false,
      objectId: `Mã đối tượng: ${objectId}`
    })

    await adminNotification.save()

    // if (isStore) {
    //   const store = await Store.findById(objectId);

    //   if (store) {
    //     await sendReportStoreEmail(
    //       {
    //         params: {
    //           userId: store.ownerId,
    //         },
    //       },
    //       res
    //     );
    //   }
    // } else {
    //   const product = await Product.findById(objectId);

    //   if (product) {
    //     const store = await Store.findById(product.storeId);

    //     if (store) {
    //       await sendReportProductEmail(
    //         {
    //           params: {
    //             userId: store.ownerId,
    //           },
    //         },
    //         res
    //       );
    //     }
    //   }
    // }

    res.status(201).json({ message: 'Báo cáo đã được gửi' })
  } catch (error) {
    console.error('Error in reportShop:', error)
    res.status(500).json({ message: 'Lỗi server', error })
  }
}
