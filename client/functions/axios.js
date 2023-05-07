import axios from 'axios'

const url = [
  'https://api.art3m1s.me/memgen/add',
  'https://api.art3m1s.me/memgen/query',
  'https://api.art3m1s.me/memgen/generate',
  'https://api.art3m1s.me/memgen/upload',
]
const localhost = [
  'http://localhost:4004/add',
  'http://localhost:4004/query',
  'http://localhost:4004/generate',
  'http://localhost:4004/upload',
]

let local = false

let finalurl = []
if (local) {
  finalurl = localhost
} else {
  finalurl = url
}

const inputDocument = async (userid, text) => {
  try {
    const res = await axios.post(finalurl[0], {
      userid: userid,
      text: text,
    })
    return res
  } catch (error) {
    return error.response
  }
}

const getCoverLetter = async (userid, text) => {
  try {
    const response = await axios.post(finalurl[1], {
      userid: userid,
      text: text,
    })
    return response
  } catch (error) {
    return error.response
  }
}

const generate = async (userid, description, text) => {
  try {
    const response = await axios.post(finalurl[2], {
      userid: userid,
      description: description,
      text: text,
    })
    return response
  } catch (e) {
    return e.response
  }
}

const convertPDF = async (file) => {
  try {
    const response = await axios.post(finalurl[3], file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (e) {
    return e.response
  }
}

export {inputDocument, getCoverLetter, generate, convertPDF}
