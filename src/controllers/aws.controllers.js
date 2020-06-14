const aws = require('../service/aws.rekognition.js')

exports.verify = (req, res, next) => {
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
    
    aws.verifyFace(req.params.name, req.file.buffer, res)
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
    aws.uploadUser(req.params.name, req.file.buffer, res)
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

    aws.extractText(req.file.buffer, res)
}