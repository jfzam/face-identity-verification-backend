const aws = require('../services/aws.js')
const bucket = 'jfzam-dev-rekognition'

// upload image to S3
exports.uploadImageToS3 = (req, res, next) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    } else if (!req.file) {
        res.status(400).send({err: 'No file uploaded.'})
        return;
    } else if (!req.headers.filename) {
        res.status(400).send({err: 'No name found.'})
        return;
    }
    let fileType = String(req.file.originalname).split('.')
    let fileName = req.headers.filename + '.' + fileType[fileType.length - 1]
    let imageBuffer = req.file.buffer

    let params = {
        Bucket: bucket,
        Key: fileName,
        Body: imageBuffer
    }

    aws.putObject(params, res)
}

exports.compareFacesFromUpload = (req, res, next) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    } else if (!req.files) {
        res.status(400).send({err: 'No files uploaded.'})
        return;
    } else if (req.files.length != 2) {
        res.status(400).send({err: '2 file uploads is needed.'})
        return;
    }

    let sourceImageBuffer = req.files[0].buffer
    let targetImageBufffer = req.files[1].buffer
    let threshold = !!req.headers.threshold ? req.headers.threshold < 80  ? 80 : req.headers.threshold > 100 ? 100 : req.headers.threshold : 90

    const params = {
        SourceImage: {
            Bytes: sourceImageBuffer
        },
        TargetImage: {
            Bytes: targetImageBufffer
        },
        SimilarityThreshold: threshold
    }
    
    aws.compareFaces(params , res)
}

exports.verifyFaceFromUploadToS3 = (req, res, next) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    } else if (!req.file) {
        res.status(400).send({err: 'No file uploaded.'})
        return;
    } else if (!req.headers.filename) {
        res.status(400).send({err: 'No name found.'})
        return;
    }

    let fileName = req.headers.filename
    let imageBuffer = req.file.buffer
    let threshold = !!req.headers.threshold ? req.headers.threshold < 80  ? 80 : req.headers.threshold > 100 ? 100 : req.headers.threshold : 90

    const params = {
        SourceImage: {
            Bytes: imageBuffer
        },
        TargetImage: {
            S3Object: {
                Bucket: bucket,
                Name: fileName
            }
        },
        SimilarityThreshold: threshold
    }
    
    aws.compareFaces(params , res)
}

exports.analyzeDocumentFromUpload = (req, res, next) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    }
    if (!req.file) {
        res.status(400).send({err: 'No file uploaded.'})
        return;
    }

    let imageBuffer = req.file.buffer
    let params = {
        Document: {
            Bytes: imageBuffer
        },
        FeatureTypes: ["FORMS"]
    }

    aws.analyzeDocument(params, res)
}

exports.compareFacesFromS3 = (req, res) => {
    console.log(req.body)
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    } else if (!req.body.fileName1 || !req.body.fileName2) {
        res.status(400).send({err: 'Invalid parameters.'})
        return;
    }

    let fileName1 = req.body.fileName1
    let fileName2 = req.body.fileName2
    let threshold = !!req.headers.threshold ? req.headers.threshold < 80  ? 80 : req.headers.threshold > 100 ? 100 : req.headers.threshold : 90

    const params = {
        SourceImage: {
            S3Object: {
                Bucket: bucket,
                Name: fileName1
            }
        },
        TargetImage: {
            S3Object: {
                Bucket: bucket,
                Name: fileName2
            }
        },
        SimilarityThreshold: threshold
    }
    
    aws.compareFaces(params , res)
}

exports.analyzeDocumentFromS3 = (req, res) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    }
    if (!req.body.fileName) {
        res.status(400).send({err: 'File name is missing.'})
        return;
    }

    let fileName = req.body.fileName
    let params = {
        Document: {
            S3Object: {
                Bucket: bucket,
                Name: fileName
              }
        },
        FeatureTypes: ["FORMS"]
    }

    aws.analyzeDocument(params, res)
}
