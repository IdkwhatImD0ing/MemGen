var express = require('express')
var router = express.Router()
var serviceAccount = require('../firebase.json')
const {Configuration, OpenAIApi} = require('openai')
const axios = require('axios')
const {MilvusClient, DataType, MetricType} = require('@zilliz/milvus2-sdk-node')
const config = require('../config.js')
const {uri, user, password, secure} = config
const milvusClient = new MilvusClient(uri, secure, user, password, secure)

// Images
const {fromBuffer} = require('pdf2pic')
const Busboy = require('busboy')
const {ImageAnnotatorClient} = require('@google-cloud/vision')
const {PDFDocument} = require('pdf-lib')
const client = new ImageAnnotatorClient()

// Uuid
const {v4: uuidv4} = require('uuid')

// Firebase Setup
const admin = require('firebase-admin')
let defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})
let defaultDatabase = admin.firestore(defaultApp)
let storage = admin.storage(defaultApp)
const bucket = storage.bucket('images')
const tempDir = 'temp-images/'

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
  const {description, text} = req.body

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

router.post('/upload', (req, res) => {
  req.headers['content-type'] =
    req.headers['content-type'] || req.headers['Content-Type']
  const busboy = Busboy({headers: req.headers, autoFields: true})
  console.log('Content-Type:', req.headers['content-type'])

  busboy.on('file', async (name, file, info) => {
    const {filename, encoding, mimeType} = info
    console.log(
      `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
      filename,
      encoding,
      mimeType,
    )
    if (mimeType === 'application/pdf') {
      try {
        const pdfBuffer = await streamToBuffer(file)

        const options = {
          density: 100,
          saveFilename: 'pdf_image',
          savePath: './images',
          format: 'png',
          width: 1024,
          height: 768,
        }

        const pdf2picInstance = fromBuffer(pdfBuffer, options)

        const pdfDoc = await PDFDocument.load(pdfBuffer)
        const totalPages = pdfDoc.getPageCount()
        console.log(`Total pages: ${totalPages}`)
        const uploadedImages = await Promise.all(
          Array.from({length: totalPages}, async (_, index) => {
            const pageNumber = index + 1

            const imageBuffer = await pdf2picInstance.convert(pageNumber)

            const imageFileName = `pdf-images/${Date.now()}_${pageNumber}.png`
            const imageFile = bucket.file(imageFileName)
            await imageFile.save(imageBuffer.buffer, {
              metadata: {contentType: 'image/png'},
            })

            return `gs://${bucket.name}/${imageFileName}`
          }),
        )

        // Prepare the requests for Google Cloud Vision API
        const inputConfig = {
          mimeType: 'image/png',
        }
        const requests = uploadedImages.map((gcsImageUri) => ({
          inputConfig,
          gcsImage: {gcsImageUri},
          features: [{type: 'DOCUMENT_TEXT_DETECTION'}],
        }))

        console.log('Sending requests to Google Cloud Vision API...')

        // Create asyncBatchAnnotateFiles request
        const asyncRequest = {
          requests,
          outputConfig: {
            gcsDestination: {
              uri: `gs://${bucket.name}/text-output/`,
            },
          },
        }

        // Call files:asyncBatchAnnotate function
        const [operation] = await client.asyncBatchAnnotateFiles(asyncRequest)
        const [filesResponse] = await operation.promise()

        console.log('Processing the response...')

        // Get the JSON output file
        const outputUri =
          filesResponse.responses[0].outputConfig.gcsDestination.uri
        const jsonFileName = outputUri.replace('gs://' + bucket.name + '/', '')
        const [jsonFile] = await bucket.file(jsonFileName).download()

        console.log('Extracting text from the response...')

        // Parse the JSON file and extract text
        const jsonContent = JSON.parse(jsonFile.toString())
        const fullText = jsonContent.responses
          .map((response) => response.fullTextAnnotation.text)
          .join('\n')

        console.log('Sending the response...')
        console.log(fullText)

        // Send the extracted text as the response
        res.send(fullText)
      } catch (error) {
        console.error(error)
        res.status(500).send('An error occurred while processing the PDF.')
      }
    } else {
      res.status(400).send('Invalid file type. Please upload a PDF.')
    }
  })

  busboy.on('error', (error) => {
    console.error('Busboy error:', error)
  })

  busboy.on('finish', () => {
    console.log('Busboy finished parsing form')
  })

  req.pipe(busboy)
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

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}
