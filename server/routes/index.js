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
router.get('/', function (req, res) {
  res.render('index', {title: 'Express'})
})

/* POST route to handle JSON input */
router.post('/query', async function (req, res) {
  const {userid, text} = req.body

  if (userid && text) {
    // Process the data as needed
    const embedding = await fetchEmbedding(text)
    const searchResults = await searchTop5ClosestMatches(embedding, userid)
    res.status(200).json({message: 'success', data: searchResults})
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

async function searchTop5ClosestMatches(searchVector, collectionName) {
  try {
    const response = await axios.post('http://localhost:9091/api/v1/search', {
      collection_name: collectionName,
      search: {
        vectors: [searchVector],
        output_fields: 'uuid',
        top_k: 5,
        anns_field: 'embeddings',
      },
    })

    if (response.status === 200) {
      return response.data
    } else {
      console.error('Error:', response.status, response.statusText)
      return null
    }
  } catch (error) {
    console.error('Error:', error.message)
    return null
  }
}
