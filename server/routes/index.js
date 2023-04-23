var express = require('express')
var router = express.Router()
const firebaseConfig = require('/usr/src/app/firebase.json')
const {Configuration, OpenAIApi} = require('openai')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const upload = multer({storage: multer.memoryStorage()})
const axios = require('axios')
const {MilvusClient, DataType, MetricType} = require('@zilliz/milvus2-sdk-node')
const config = require('/usr/src/app/config.js')
const {uri, user, password, secure} = config
const path = require('path')
const milvusClient = new MilvusClient(uri, secure, user, password, secure)

// Uuid
const {v4: uuidv4} = require('uuid')

// Firebase Setup
const admin = require('firebase-admin')
let defaultApp = admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
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

// Authentication
const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')

const jwt = require('express-jwt')
const jwksRsa = require('jwks-rsa')

// Middleware for validating access tokens
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}.well-known/jwks.json`,
  }),

  audience: process.env.AUTH0_SECRET,
  issuer: process.env.AUTH0_ISSUER_BASE_URL,
  algorithms: ['RS256'],
})

router.use('/signup', checkJwt)

/* GET home page. */
router.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'file.html'))
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
      collection_name: 'Resume',
      fields_data: [
        {
          uuid: uuid,
          vector: embedding,
          userid: userid,
        },
      ],
    }

    const ret = await milvusClient.insert(data)

    res.status(200).json({message: 'success', ret})
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

/* POST delete text. */
router.post('/delete', async function (req, res) {
  const {userid, uuid} = req.body

  // Get the text and embedding from Firebase
  const userCollection = defaultDatabase.collection(userid)
  const document = userCollection.doc(uuid)

  try {
    const docSnapshot = await document.get()

    if (!docSnapshot.exists) {
      res.status(404).json({message: 'Text not found'})
      return
    }

    // Delete the text and embedding in Firebase
    await document.delete()

    const data = {
      collection_name: 'Resume',
      expr: `uuid in [${uuid}]`,
    }

    // Delete the record in Milvus
    const ret = await milvusClient.deleteEntityByExpression(data)

    res.status(200).json({message: 'success', ret})
  } catch (error) {
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
      collection_name: 'Resume',
    })

    // Process the data as needed
    const embedding = await fetchEmbedding(text)
    const searchParams = {
      anns_field: 'vector',
      topk: 3,
      metric_type: MetricType.L2,
      params: JSON.stringify({nprobe: 1024}),
    }
    const searchReq = {
      collection_name: 'Resume',
      vectors: [embedding],
      search_params: searchParams,
      vector_type: DataType.FloatVector,
      expr: `userid == "${userid}"`,
      output_fields: ['uuid'],
    }

    const searchResults = await milvusClient.search(searchReq)
    // Process the search results
    const messagePromises = searchResults.results.map(async (result) => {
      // Find the corresponding document in firebase
      const id = result.id
      const docRef = defaultDatabase.collection(userid).doc(id)
      const doc = await docRef.get()

      const data = doc.data()
      const text = data.text
      console.log(text)
      return text
    })

    // Wait for all promises to resolve
    const messageArray = await Promise.all(messagePromises)

    // Send the response
    res.status(200).json({message: 'success', data: messageArray})
  } else {
    res.status(400).json({
      message: 'Bad request. Please provide both userid and text fields.',
    })
  }
})

router.post('/generate', async function (req, res) {
  const {userid, description, text} = req.body

  //Search user collection, "Account" docs, credits to see if they have enough credits
  const userCollection = defaultDatabase.collection(userid)
  const document = userCollection.doc('Account')
  const doc = await document.get()
  const data = doc.data()
  const credits = data.credits
  const tier = data.tier

  if (credits < 1 && tier != 'Admin') {
    res.status(400).json({
      message:
        'Bad request. You do not have enough credits to generate a cover letter.',
    })
  }

  if (text && description) {
    try {
      const prompt = `Job description: ${description}
Previous experiences: ${text}

Write a cover letter that matches the job description and utilizes the previous experiences provided:
`
      const response = await cohere.generate({
        model: 'command-xlarge-nightly',
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.8,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE',
      })
      //Decrease credits by 1
      if (tier != 'Admin') {
        await document.update({
          credits: credits - 1,
          tier: tier,
        })
      }
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

router.post('/upload', upload.single('pdf'), async (req, res) => {
  //PDF to text
  if (!req.file) {
    console.error('No file received')
    return res.status(400).send('No file received')
  }
  try {
    const pdfBuffer = req.file.buffer
    const pdfData = await pdfParse(pdfBuffer)
    res.send(pdfData.text)
  } catch (error) {
    console.error('Error processing PDF:', error)
    res.status(500).send('Error processing PDF')
  }
})

router.post('/signup', async (req, res) => {
  const {userid} = req.body

  // Input validation
  if (!userid || typeof userid !== 'string') {
    return res.status(400).send('Invalid user ID')
  }

  const userCollection = defaultDatabase.collection(userid)
  const document = userCollection.doc('Account')

  try {
    await document.set({
      tier: 'User',
      credits: 5,
    })

    res.status(200).send('User successfully created')
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).send('Error creating user')
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
