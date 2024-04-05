const fs = require('fs')
const formidable = require('formidable')

exports.upload = (req, res, next) => {
  // console.log('---UPLOAD IMAGE---');
  let flag = true
  const form = new formidable.IncomingForm()
  form.keepExtensions = true

  form.parse(req, (error, fields, files) => {
    if (error) {
      // console.log('---UPLOAD IMAGE FAILED---');
      return res.status(400).json({
        error: 'Photo could not be up load'
      })
    }

    const listFiles = Object.values(files)
    // console.log('---upload---', fields, listFiles);
    let listFilePaths = []
    if (listFiles.length > 0) {
      listFiles.forEach((file) => {
        //check type
        const type = file.type
        if (
          type !== 'image/png' &&
          type !== 'image/jpg' &&
          type !== 'image/jpeg' &&
          type !== 'image/webp' &&
          type !== 'image/gif'
        ) {
          // console.log('---UPLOAD IMAGE FAILED---');
          flag = false
          return res.status(400).json({
            error:
              'Invalid type. Photo type must be png, jpg, webp, jpeg or gif.'
          })
        }

        //check size
        const size = file.size
        if (size > 1000000) {
          // console.log('---UPLOAD IMAGE FAILED---');
          flag = false
          return res.status(400).json({
            error: 'Image should be less than 1mb in size'
          })
        }

        const path = file.path
        let data
        try {
          data = fs.readFileSync(path)
        } catch (e) {
          // console.log('---UPLOAD IMAGE FAILED---');
          flag = false
          return res.status(500).json({
            error: 'Can not read photo file'
          })
        }

        const newpath =
          'public/uploads/' +
          Date.now() +
          `${req.store && req.store.slug ? req.store.slug : ''}` +
          `${req.product && req.product.slug ? req.product.slug : ''}` +
          file.name

        try {
          fs.writeFileSync(newpath, data)
        } catch (e) {
          // console.log('---UPLOAD IMAGE FAILED---');
          flag = false
          return res.status(500).json({
            error: 'Photo could not be up load'
          })
        }

        // console.log('---UPLOAD IMAGE SUCCESSFULLY---');
        listFilePaths.push(newpath.replace('public', ''))
      })
    }

    req.filepaths = listFilePaths
    req.fields = fields

    if (flag) next()
  })
}
