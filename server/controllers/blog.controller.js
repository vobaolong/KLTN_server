const Blog = require('../models/blog.model')
const asyncHandler = require('express-async-handler')

const createBlog = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body
  if (!title || !description || !category) throw new Error('Missing value')
  const response = await Blog.create(req.body)
  return res.json({
    success: response ? true : false,
    createdBlog: response ? response : 'Cant create new blog'
  })
})

const updateBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params
  if (Object.keys(res.body).length === 0) throw new Error('Missing input')
  const response = await Blog.findByIdAndUpdate(bid, req.body, { new: true })
  return res.json({
    success: response ? true : false,
    updatedBlog: response ? response : 'Cant update blog'
  })
})

const getBlogs = asyncHandler(async (req, res) => {
  const response = await Blog.find()
  return res.json({
    success: response ? true : false,
    blog: response ? response : 'Cant get blogs'
  })
})

const likeBlog = asyncHandler(async () => {
  const { _id } = req.user
  const { bid } = req.params
  if (!bid) throw new Error('Missing value')
  const blog = await Blog.findById(bid)

  const alreadyDisliked = blog?.dislikes?.find((e) => e.toString() === _id)
  if (alreadyDisliked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { dislikes: _id }, isDisliked: false },
      { new: true }
    )

    return res.json({
      success: response ? true : false,
      rs: response
    })
  }

  const isLiked = blog?.likes?.find((e) => e.toString() === _id)
  if (isLiked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { likes: _id } },
      { new: true }
    )

    return res.json({
      success: response ? true : false,
      rs: response
    })
  } else {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $push: { likes: _id } },
      { new: true }
    )

    return res.json({
      success: response ? true : false,
      rs: response
    })
  }
})

const dislikeBlog = asyncHandler(async () => {
  const { _id } = req.user
  const { bid } = req.params
  if (!bid) throw new Error('Missing value')
  const blog = await Blog.findById(bid)

  const alreadyLiked = blog?.likes?.find((e) => e.toString() === _id)
  if (alreadyLiked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { likes: _id }, isDisliked: false },
      { new: true }
    )

    return res.json({
      success: response ? true : false,
      rs: response
    })
  }

  const isDisliked = blog?.dislikes?.find((e) => e.toString() === _id)
  if (isDisliked) {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { dislikes: _id } },
      { new: true }
    )

    return res.json({
      success: response ? true : false,
      rs: response
    })
  } else {
    const response = await Blog.findByIdAndUpdate(
      bid,
      { $push: { dislikes: _id } },
      { new: true }
    )

    return res.json({
      success: response ? true : false,
      rs: response
    })
  }
})

const getBlog = asyncHandler(async () => {
  const { bid } = req.params
  const blog = await Blog.findByIdAndUpdate(
    bid,
    { $inc: { numberViews: 1 } },
    { new: true }
  )
    .populate('likes', 'name email')
    .populate('dislikes', 'name email')
  return res.json({
    success: blog ? true : false,
    rs: blog
  })
})

const deleteBlog = asyncHandler(async () => {
  const { bid } = req.params
  const blog = await Blog.findByIdAndDelete(bid)
  return res.json({
    success: blog ? true : false,
    deleted: blog || 'Something went wrong'
  })
})

const uploadImgBlog = asyncHandler(async (req, res) => {
  const { bid } = req.params
  if (!req.file) throw new Error('Missing value')
  const response = await Blog.findByIdAndUpdate(
    bid,
    {
      image: req.file.path
    },
    { new: true }
  )
  return res.status(200).json({
    status: response ? true : false,
    updatedBlog: response ? response : 'Cant upload image blog'
  })
})

module.exports = {
  createBlog,
  updateBlog,
  getBlogs,
  getBlog,
  likeBlog,
  dislikeBlog,
  deleteBlog,
  uploadImgBlog
}
