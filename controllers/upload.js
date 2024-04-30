const fs = require('fs')
const formidable = require('formidable')
const sharp = require('sharp')

exports.upload = (req, res, next) => {
  let flag = true
  const form = new formidable.IncomingForm()
  form.keepExtensions = true

  form.parse(req, (error, fields, files) => {
    if (error) {
      return res.status(400).json({
        error: 'Photo could not be up load'
      })
    }

    const listFiles = Object.values(files)
    let listFilePaths = []
    if (listFiles.length > 0) {
      listFiles.forEach((file) => {
        const type = file.type
        if (
          type !== 'image/png' &&
          type !== 'image/jpg' &&
          type !== 'image/jpeg' &&
          type !== 'image/webp' &&
          type !== 'image/gif'
        ) {
          flag = false
          return res.status(400).json({
            error:
              'Invalid type. Photo type must be png, jpg, webp, jpeg or gif.'
          })
        }

        const size = file.size
        if (size > 1000000) {
          flag = false
          return res.status(400).json({
            error: 'Image should be less than 1mb in size'
          })
        }
        const newpath =
          'public/uploads/' +
          Date.now() +
          `${req.store && req.store.slug ? `_${req.store.slug}` : ''}` +
          `${req.product && req.product.slug ? `_${req.product.slug}` : ''}` +
          `${
            req.category && req.category.slug ? `_${req.category.slug}` : ''
          }` +
          '.webp'
        try {
          sharp(file.path)
            .webp()
            .toFile(newpath, (err, info) => {
              if (err) throw err
            })
        } catch (e) {
          flag = false
          return res.status(500).json({
            error: 'Photo could not be up load'
          })
        }
        listFilePaths.push(newpath.replace('public', ''))
      })
    }

    req.filepaths = listFilePaths
    req.fields = fields

    if (flag) next()
  })
}
