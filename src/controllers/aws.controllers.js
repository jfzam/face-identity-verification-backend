const aws = require('../service/aws.rekognition.js')

exports.compare = (req, res, next) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    }
    if (!req.files) {
        res.status(400).send({err: 'No files uploaded.'})
        return;
    }

    let sourceImageBuffer = req.files[0].buffer
    let targetImageBufffer = req.files[1].buffer
    
    aws.compareFace(sourceImageBuffer, targetImageBufffer , res)
}

exports.verify = (req, res, next) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    }
    if (!req.file) {
        res.status(400).send({err: 'No file uploaded.'})
        return;
    } else if (!req.query.fileName) {
        res.status(400).send({err: 'No name found.'})
        return;
    }

    let fileName = req.query.fileName
    let imageBuffer = req.file.buffer
    
    aws.verifyFace(fileName, imageBuffer, res)
}

exports.upload = (req, res, next) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    }
    if (!req.file) {
        res.status(400).send({err: 'No file uploaded.'})
        return;
    } else if (!req.params.name) {
        res.status(400).send({err: 'No name found.'})
        return;
    }
    let fileType = String(req.file.originalname).split('.')
    let fileName = req.params.name + '.' + fileType[fileType.length - 1]
    let imageBuffer = req.file.buffer

    aws.uploadUser(fileName, imageBuffer, res)
}

exports.extract = (req, res, next) => {
    if(req.headers.token != process.env.TOKEN) {
        res.status(403).send({err: 'Invalid token.'})
        return;
    }
    if (!req.file) {
        res.status(400).send({err: 'No file uploaded.'})
        return;
    }

    let imageBuffer = req.file.buffer

    aws.extractText(imageBuffer, res)
}