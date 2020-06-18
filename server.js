const express = require('express')
const bodyParser = require('body-parser')
const route = require('./src/routes/router')

// create express app
const app = express()

// Setup server port
const port = process.env.PORT || 4000

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// define a root/default route
app.get('/', (req, res) => {
  res.json({"message": "hello rekognition"})
})

// using as middleware
app.use('/api/', route)

// listen for requests
app.listen(port, () => {
  console.log(`Node server is listening on port ${port}`);
});
