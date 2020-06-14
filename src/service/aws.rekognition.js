require('dotenv').config()
const AWS = require('aws-sdk')
const fs = require('fs')
const _ = require("lodash")

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const bucket = 'jfzam-dev-rekognition'

const rekognition = new AWS.Rekognition()
const s3 = new AWS.S3()
const textract = new AWS.Textract()

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
        SimilarityThreshold: 80
    }

    rekognition.compareFaces(params, (err, data) => {
        if (err) {
            return res.status(400).send({ success: false, err: err })
        } else {
            if (data.FaceMatches[0]) {
                return res.send({
                    success: true,
                    verify: {
                        isMatch: true,
                        similarity: data.FaceMatches[0].Similarity
                    },
                    data
                })
            } else {
                return res.send({
                    success: true,
                    verify: {
                        isMatch: false
                    },
                    data
                })
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
            console.log('Could nor upload the file. Error :', err)
            return res.send({
                success: false,
                data
            })
        }
        else {
            console.log('Successfully uploaded the file')
            return res.send({
                success: true,
                data
            })
        }
    })
}

exports.extractText = (file, res) => {
    const params = {
        Document: {
            Bytes: file
        },
        FeatureTypes: ["FORMS"]
    }

    textract.analyzeDocument(params, (err, data) => {
        if (err) {
            console.log(err)
            return res.send({ success: false })
        } else {
            const getText = (result, blocksMap) => {
                let text = ""

                if (_.has(result, "Relationships")) {
                    result.Relationships.forEach(relationship => {
                        if (relationship.Type === "CHILD") {
                            relationship.Ids.forEach(childId => {
                                const word = blocksMap[childId]
                                if (word.BlockType === "WORD") {
                                    text += `${word.Text} `
                                }
                                if (word.BlockType === "SELECTION_ELEMENT") {
                                    if (word.SelectionStatus === "SELECTED") {
                                        text += `X `
                                    }
                                }
                            })
                        }
                    })
                }

                return text.trim()
            }

            const findValueBlock = (keyBlock, valueMap) => {
                let valueBlock
                keyBlock.Relationships.forEach(relationship => {
                    if (relationship.Type === "VALUE") {
                        // eslint-disable-next-line array-callback-return
                        relationship.Ids.every(valueId => {
                            if (_.has(valueMap, valueId)) {
                                valueBlock = valueMap[valueId]
                                return false
                            }
                        })
                    }
                })

                return valueBlock
            }

            const getKeyValueRelationship = (keyMap, valueMap, blockMap) => {
                const keyValues = {}

                const keyMapValues = _.values(keyMap)

                keyMapValues.forEach(keyMapValue => {
                    const valueBlock = findValueBlock(keyMapValue, valueMap)
                    const key = getText(keyMapValue, blockMap)
                    const value = getText(valueBlock, blockMap)
                    keyValues[key] = value
                })

                return keyValues
            }

            const getKeyValueMap = blocks => {
                const keyMap = {}
                const valueMap = {}
                const blockMap = {}

                let blockId
                blocks.forEach(block => {
                    blockId = block.Id
                    blockMap[blockId] = block

                    if (block.BlockType === "KEY_VALUE_SET") {
                        if (_.includes(block.EntityTypes, "KEY")) {
                            keyMap[blockId] = block
                        } else {
                            valueMap[blockId] = block
                        }
                    }
                })

                return { keyMap, valueMap, blockMap }
            }

            if (data && data.Blocks) {
                const { keyMap, valueMap, blockMap } = getKeyValueMap(data.Blocks);
                const keyValues = getKeyValueRelationship(keyMap, valueMap, blockMap);
            
                return res.send({
                    success: true,
                    data: keyValues
                })
              }

            return res.send({
                success: true,
                data
            })
        }
    })
}