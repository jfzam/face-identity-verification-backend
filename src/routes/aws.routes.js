const express = require('express')
const router = express.Router()
const awsController = require('../controllers/aws.controllers')
const multer  = require('multer')
const upload = multer()

// compare face from s3
router.get('/compare', awsController.compare)

//verify image
router.post('/verify/:id', upload.single('file'), awsController.verify)

module.exports = router