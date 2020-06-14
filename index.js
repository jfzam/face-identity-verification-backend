require('dotenv').config()
const AWS = require('aws-sdk')
AWS.config.update({region:'ap-southeast-1'})

const bucket = 'jfzam-dev-rekognition'
const photo_source  = 'frank.png'
const photo_target  = 'jamsfree.jpg'



const config = new AWS.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})



const client = new AWS.Rekognition()

const params = {
  SourceImage: {
    S3Object: {
      Bucket: bucket,
      Name: photo_source
    },
  },
  TargetImage: {
    S3Object: {
      Bucket: bucket,
      Name: photo_target
    },
  },
  SimilarityThreshold: 80
}

client.compareFaces(params, function(err, response) {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    response.FaceMatches.forEach(data => {
      let position   = data.Face.BoundingBox
      let similarity = data.Similarity
      console.log(`The face at: ${position.Left}, ${position.Top} matches with ${similarity} % confidence`)
    }) // for response.faceDetails
  } // if
})