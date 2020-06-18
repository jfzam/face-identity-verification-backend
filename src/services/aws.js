require('dotenv').config()
const AWS = require('aws-sdk')
const fs = require('fs')
const _ = require("lodash")

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const rekognition = new AWS.Rekognition()
const s3 = new AWS.S3()
const textract = new AWS.Textract()


exports.putObject = (params, res) => {
    s3.putObject(params, (err, data) => {
        if (err) {
            return res.send({
                success: false,
                err,
                data
            })
        }
        else {
            return res.send({
                success: true,
                fileName: params.Key,
                data
            })
        }
    })
}

exports.compareFaces = (params, res) => {
    rekognition.compareFaces(params, (err, data) => {
        if (err) {
            return res.status(400).send({ success: false, err })
        } else {
            if (data.FaceMatches[0]) {
                return res.send({
                    success: true,
                    result: {
                        isMatch: true,
                        similarity: data.FaceMatches[0].Similarity
                    },
                    data
                })
            } else {
                return res.send({
                    success: true,
                    result: {
                        isMatch: false
                    },
                    data
                })
            }
        }
    })
}

exports.analyzeDocument = (params, res) => {
    textract.analyzeDocument(params, (err, data) => {
        if (err) {
            return res.send({ success: false, err })
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
                    result: keyValues,
                    data
                })
              }

            return res.send({
                success: true,
                data
            })
        }
    })
}