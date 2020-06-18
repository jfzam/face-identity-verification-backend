const express = require('express')
const router = express.Router()
const controller = require('../controllers/controller')
const multer  = require('multer')
const upload = multer()

//const storage = multer.diskStorage({
//    destination : 'uploads/',
//    filename: function (req, file, cb) {
//      cb(null, file.originalname);
//    }
//})
//const upload = multer({ storage: storage })

// upload image to S3
router.post('/s3/upload', upload.single('image'), controller.uploadImageToS3)

//compare images from file uploads
router.post('/compare', upload.array('image', 2), controller.compareFacesFromUpload)

// verify image from s3 to file uploads
router.post('/verify', upload.single('image'), controller.verifyFaceFromUploadToS3)

// call textTract
router.post('/analyze', upload.single('image'), controller.analyzeDocumentFromUpload)

// compare face from s3
router.post('/s3/compare', controller.compareFacesFromS3)

// analyze document from s3
router.post('/s3/analyze', controller.analyzeDocumentFromS3)

module.exports = router