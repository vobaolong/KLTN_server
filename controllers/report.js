const Report = require('../models/report')
const Notification = require('../models/notification')
const {
  sendReportStoreEmail,
  sendReportProductEmail,
  sendReportReviewEmail
} = require('../controllers/email')
const Store = require('../models/store')
const Product = require('../models/product')
const Review = require('../models/review')

// Get reports
exports.getReports = async (req, res) => {
  try {
    const {
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
      limit = 6,
      page = 1
    } = req.query
    const skip = limit * (page - 1)
    const isStore = req.query.isStore === 'true'
    const isProduct = req.query.isProduct === 'true'
    const isReview = req.query.isReview === 'true'

    const filter = {
      search,
      isStore,
      isProduct,
      isReview,
      sortBy,
      order,
      limit,
      pageCurrent: page
    }
    const size = await Report.countDocuments({
      isStore,
      isProduct,
      isReview
    })

    const pageCount = Math.ceil(size / limit)
    filter.pageCount = pageCount

    if (size <= 0) {
      return res.json({
        success: 'Load list reports successfully',
        filter,
        size,
        reports: []
      })
    }

    const reports = await Report.find({ isStore, isProduct, isReview })
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
        } else if (report.isProduct) {
          const product = await Product.findById(report.objectId)
          if (!product) return report
          return { ...report._doc, objectId: { ...product._doc } }
        } else if (report.isReview) {
          const review = await Review.findById(report.objectId)
          if (!review) return report
          return { ...report._doc, objectId: { ...review._doc } }
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
    res.status(500).json({ message: 'Server error', error })
  }
}

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    await Report.deleteOne({ _id: req.params.id })
    res.status(200).json({ message: 'Delete successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

// Create report
exports.createReport = async (req, res) => {
  try {
    const { objectId, isStore, isProduct, isReview, reason, reportBy } =
      req.body
    const onModel = isStore
      ? 'Store'
      : isProduct
      ? 'Product'
      : isReview
      ? 'Review'
      : null

    if (!onModel) {
      return res.status(400).json({ message: 'Invalid report type' })
    }

    const report = new Report({
      objectId,
      isStore,
      isProduct,
      isReview,
      reason,
      reportBy,
      onModel
    })

    await report.save()

    const adminId = process.env.ADMIN_ID
    const adminNotification = new Notification({
      message: `${
        isStore
          ? 'Báo cáo shop mới'
          : isProduct
          ? 'Báo cáo sản phẩm mới'
          : 'Báo cáo đánh giá mới'
      }: ${reason}`,
      userId: adminId,
      isRead: false,
      objectId: `Mã đối tượng: ${objectId}`
    })

    await adminNotification.save()

    res.status(201).json({ message: 'Report submitted successfully' })
  } catch (error) {
    console.error('Error in createReport:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}
