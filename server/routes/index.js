var express = require('express')
var router = express.Router()
var serviceAccount = require('../firebase.json')
const {Configuration, OpenAIApi} = require('openai')
const axios = require('axios')
const {MilvusClient} = require('@zilliz/milvus2-sdk-node')
const milvusClient = new MilvusClient(MILUVS_ADDRESS)

// Uuid
const {v4: uuidv4} = require('uuid')

// Firebase Setup
const admin = require('firebase-admin')
let defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
let defaultDatabase = admin.firestore(defaultApp)

// Openai Setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

// Cohere Setup
const cohere = require('cohere-ai')
cohere.init(process.env.COHERE_API_KEY)

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', {title: 'Express'})
})

router.post('/add', async function (req, res) {
  const {userid, text} = req.body
  const embedding = await fetchEmbedding(text)
  const uuid = uuidv4()

  // Add the text and embedding to Firebase
  const userCollection = defaultDatabase.collection(userid)
  const document = userCollection.doc(uuid)

  try {
    await document.set({
      text: text,
      embedding: embedding,
    })

    const data = {
      collection_name: 'resume',
      fields_data: [
        {
          uuid: uuid,
          vector: [embedding],
          userid: userid,
        },
      ],
    }

    const res = await milvusClient.insert(data)

    res.status(200).json({message: 'success', res})
  } catch (error) {
    // Rollback: delete the document in Firebase if it was added
    const docSnapshot = await document.get()
    if (docSnapshot.exists) {
      await document.delete()
    }

    res.status(500).json({
      message: 'An error occurred while processing the transaction.',
      error: error.message,
    })
  }
})

/* POST route to handle JSON input */
router.post('/query', async function (req, res) {
  const {userid, text} = req.body

  if (userid && text) {
    // Reload collection
    await milvusClient.loadCollection({
      collection_name: 'resume',
    })

    // Process the data as needed
    const embedding = await fetchEmbedding(text)
    const searchParams = {
      anns_field: 'vector',
      topk: 3,
      metric_type: 'L2',
    }
    const searchReq = {
      collectionName: 'resume',
      vectors: [embedding],
      params: searchParams,
      vector_type: 'float',
      expr: 'userid == ' + userid,
      output_fields: ['uuid'],
    }

    const searchResults = await milvusClient.search(searchReq)
    res.status(200).json({message: 'success', data: searchResults})
  } else {
    res.status(400).json({
      message: 'Bad request. Please provide both userid and text fields.',
    })
  }
})

router.post('/generate', async function (req, res) {
  const {description, text} = req.body

  if (text && description) {
    try {
      const prompt =
        'Generate a cover letter explaining why I would be a good fit for the company for the following job description: ' +
        description +
        ' Use the following information in the cover letter: ' +
        text +
        ' Do not make up any information.'
      const response = await cohere.generate({
        model: 'command-xlarge-nightly',
        prompt: prompt,
        maxTokens: 5000,
        temperature: 1.5,
        k: 5,
        stop_sequences: [],
        return_likelihoods: 'NONE',
      })
      res.status(200).json({message: 'success', data: response})
    } catch (error) {
      res.status(500).json({
        message: 'An error occurred while processing your request.',
        error: error.message,
      })
    }
  } else {
    res.status(400).json({
      message:
        'Bad request. Please provide a JSON string in the "jsonPrompt" field.',
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

    return response.data.data[0].embedding
  } catch (error) {
    console.error('Error fetching embedding:', error)
    throw error
  }
}
