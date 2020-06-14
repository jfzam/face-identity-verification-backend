const aws = require('../service/aws.rekognition.js');

exports.compare = (req, res) => {
    aws.compareFace(req, res)
}

exports.verify = (req, res, next) => {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    const id = req.params.id
    const image = req.file.buffer
    console.log(req)
    aws.verifyFace(id, image, res)
}
