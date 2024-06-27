const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const reportSchema = new mongoose.Schema(
  {
    objectId: {
      // ID của product hoặc store bị báo cáo
      type: String,
      required: true
    },
    isStore: {
      // nếu là true thì là báo cáo shop, còn false là báo cáo product
      type: Boolean,
      required: true
    },
    reason: {
      // lý do báo cáo
      type: String,
      required: true
    },
    reportBy: {
      // id của người báo cáo
      type: ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('Report', reportSchema)
