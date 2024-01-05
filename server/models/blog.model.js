const mongoose = require('mongoose')

var blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    numberViews: {
      type: Number,
      default: 0
    },
    likes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      }
    ],
    dislikes: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User'
      }
    ],
    images: {
      type: String,
      default:
        'https://boyo.l8t.top/wp-content/uploads/2020/08/beauty_blogs.jpg'
    },
    author: {
      type: String,
      default: 'Admin'
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

module.exports = mongoose.model('Blog', blogSchema)
