const express = require('express')
const router = express.Router()
const awsController = require('../controllers/aws.controllers')
const multer  = require('multer')
const storage = multer.diskStorage({
    destination : 'uploads/',
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
})

//const upload = multer({ storage: storage })

const upload = multer()

// verify image
router.post('/verify/:name', upload.single('verify-image'), awsController.verify)

// upload image
router.post('/upload/:name', upload.single('upload-image'), awsController.upload)

// extract text
router.post('/ocr', upload.single('document-image'), awsController.extract)

module.exports = router