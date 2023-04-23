var express = require('express')
var cors = require('cors')
var router = express.Router()
router.use(cors())
const firebaseConfig = require('../firebase.json')
const {Configuration, OpenAIApi} = require('openai')
const multer = require('multer')
const pdfParse = require('pdf-parse')
const upload = multer({storage: multer.memoryStorage()})
const axios = require('axios')
const {MilvusClient, DataType, MetricType} = require('@zilliz/milvus2-sdk-node')
const config = require('../config.js')
const {uri, user, password, secure} = config
const path = require('path')
const milvusClient = new MilvusClient(uri, secure, user, password, secure)
const fetch = require('node-fetch')

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

    // Delete the record in Milvus
    const ret = await milvusClient.deleteEntities({
      collection_name: 'Resume',
      expr: `uuid in ["${uuid}"]`,
    })

    res.status(200).json({message: 'success', ret})
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while processing the transaction.',
      error: error.message,
    })
  }
})

router.get('/documents', async function (req, res) {
  const {userid} = req.query

  // Get the user's collection
  const userCollection = defaultDatabase.collection(userid)

  // Get all the documents in the collection
  const querySnapshot = await userCollection.get()

  // Convert the QuerySnapshot to an array of documents
  const documents = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  // Filter the documents to remove the one with name Account
  const filteredDocuments = documents.filter((doc) => doc.id !== 'Account')
  // Return the filtered documents
  res.status(200).json(filteredDocuments)
})

/* POST route to handle JSON input */
router.post('/query', async function (req, res) {
  const {userid, text} = req.body

  if (userid && text) {
    try {
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

      // Reverse search results
      searchResults.results.reverse()
      // Process the search results
      const messagePromises = searchResults.results.map(async (result) => {
        // Find the corresponding document in firebase
        const id = result.id
        const docRef = defaultDatabase.collection(userid).doc(id)
        const doc = await docRef.get()

        const data = doc.data()
        const text = data.text
        return text
      })

      // Wait for all promises to resolve
      const messageArray = await Promise.all(messagePromises)

      // Send the response
      res.status(200).json({message: 'success', data: messageArray})
    } catch (error) {
      res.status(500).json({
        message: 'An error occurred while processing the request.',
        error: error.message,
      })
    }
  } else {
    res.status(400).json({
      message: 'Bad request. Please provide both userid and text fields.',
    })
  }
})

router.post('/generate', async function (req, res) {
  try {
    const {userid, description, text} = req.body

    // Search user collection, "Account" docs, credits to see if they have enough credits
    const userCollection = defaultDatabase.collection(userid)
    const document = userCollection.doc('Account')
    const doc = await document.get()
    const data = doc.data()
    const credits = data.credits
    const tier = data.tier

    if (credits < 1 && tier != 'Admin') {
      res.status(402).json({
        message: 'You do not have enough credits to generate a cover letter.',
      })
      return
    }

    if (text && description) {
      const prompt = `
      Write a cover letter that matches the job description and utilizes the previous experiences provided.
      [Start Previous Experiences]
      ${text}
      [End Previous Experiences]
      [Start Job Description]
      ${description}
      [End Job Description]`

      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.8,
        top_p: 1,
        frequency_penalty: 0.0,
      })
      // const response = await cohere.generate({
      //   model: 'command-xlarge-nightly',
      //   prompt: prompt,
      //   max_tokens: 4090,
      //   temperature: 0.8,
      //   k: 0,
      //   stop_sequences: [],
      //   return_likelihoods: 'NONE',
      //   truncate: 'END',
      // })
      // const response = await fetch('https://api.cohere.ai/v1/generate', {
      //   method: 'POST',
      //   headers: {
      //     Accept: 'application/json',
      //     Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     model: 'command-xlarge-nightly',
      //     prompt: prompt,
      //     max_tokens: 4090,
      //     temperature: 0.8,
      //     k: 0,
      //     stop_sequences: [],
      //     return_likelihoods: 'NONE',
      //     truncate: 'START',
      //   }),
      // })

      // const data = await response.json()
      // Decrease credits by 1
      if (tier != 'Admin') {
        await document.update({
          credits: credits - 1,
          tier: tier,
        })
      }
      res
        .status(200)
        .json({message: 'success', data: response.data.choices[0].text})
    } else {
      res.status(400).json({
        message:
          'Bad request. Please provide a JSON string in the "jsonPrompt" field.',
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'An error occurred while processing your request.',
      error: error.message,
    })
  }
})

router.post('/summarize', async function (req, res) {
  try {
    const {userid, text} = req.body
    if (text && userid) {
      const prompt = `Summarize the following project in three detailed paragraphs, emphasizing the technical and programming skills used.
      
       ${text}`
      const response = await cohere.generate({
        model: 'command-xlarge-nightly',
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.9,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE',
        truncate: 'END',
      })

      res.status(200).json({message: 'success', data: response})
    } else {
      res.status(400).json({
        message:
          'Bad request. Please provide a JSON string in the "jsonPrompt" field.',
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'An error occurred while processing your request.',
      error: error.message,
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
    //console.error('Error processing PDF:', error)
    res.status(500).send('Error processing PDF')
  }
})

router.post('/signup', async (req, res) => {
  const {userid, secretkey, email} = req.body

  if (secretkey != process.env.SECRET_KEY) {
    return res.status(401).send('Unauthorized')
  }

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
      email: email,
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
