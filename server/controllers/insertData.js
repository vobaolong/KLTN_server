const Product = require('../models/product.model')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const data = require('../../data/data')

const fn = async (product) => {
  await Product.create({
    title: product?.name,
    slug: slugify(product?.name),
    description: product?.description,
    brand: product?.brand,
    price: Math.round(Number(product?.price?.match(/\d/g).join('')) / 100),
    category: product?.category[1],
    quantity: Math.round(Math.random() * 1000),
    sold: Math.round(Math.random() * 100),
    images: product?.images,
    color: product?.variants?.find((e) => e.label === 'Color')?.variants[0]
  })
}
const insertProduct = asyncHandler(async (req, res) => {
  const promises = []
  for (let product of data) promises.push(fn(product))
  await Promise.all(promises)
  return res.json('ok')
})

module.exports = { insertProduct }
