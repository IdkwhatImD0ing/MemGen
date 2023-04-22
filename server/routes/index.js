var express = require('express')
var router = express.Router()
var serviceAccount = require('../firebase.json')
const {Configuration, OpenAIApi} = require('openai')
const axios = require('axios')

let defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
let defaultDatabase = admin.firestore(defaultApp)

// Openai Setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'})
})

/* POST route to handle JSON input */
router.post('/query', async function (req, res, next) {
  const {userid, text} = req.body

  if (userid && text) {
    // Process the data as needed
    const embedding = await fetchEmbedding(text)  
  } else {
    res.status(400).json({
      message: 'Bad request. Please provide both userid and text fields.',
    })
  }
})

module.exports = router

async function fetchEmbedding(text) {
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    })

    return response.data
  } catch (error) {
    console.error('Error fetching embedding:', error)
    throw error
  }
}
