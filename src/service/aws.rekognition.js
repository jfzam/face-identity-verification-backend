require('dotenv').config()
const AWS = require('aws-sdk')
const fs = require('fs')

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const bucket = 'jfzam-dev-rekognition'

const rekognition = new AWS.Rekognition()
const s3 = new AWS.S3()

exports.verifyFace = (name, image, res) => {
    const params = {
        SourceImage: {
            Bytes: image
        },
        TargetImage: {
            S3Object: {
                Bucket: bucket,
                Name: name + '.jpg'
            }
        },
        SimilarityThreshold: 90
    }

    rekognition.compareFaces(params, (err, data) => {
        if (err) {
            return res.status(400).send({ success: false, err: err });
        } else {
            if (data.FaceMatches[0]) {
                return res.send({
                    success: true,
                    verify: {
                        isMatch: true,
                        similarity: data.FaceMatches[0].Similarity
                    },
                    data
                });
            } else {
                return res.send({
                    success: true,
                    verify: {
                        isMatch: false
                    },
                    data
                });
            }
        }
    })
}


exports.uploadUser = (name, file, res) => {
    console.log('preparing to upload...')
    const putParams = {
        Bucket: bucket,
        Key: name + '.jpg',
        Body: file
    }

    s3.putObject(putParams, (err, data) => {
        if (err) {
          console.log('Could nor upload the file. Error :',err)
          return res.send({ 
              success: false,
             data
            });
        } 
        else{
          //fs.unlink(path);// Deleting the file from uploads folder(Optional).Do Whatever you prefer.
          console.log('Successfully uploaded the file')
          return res.send({ 
              success: true,
              data
            });
        }
      })
}