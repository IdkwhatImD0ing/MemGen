import axios from 'axios'

const url = [
  'https://api.art3m1s.me/memgen/add',
  'https://api.art3m1s.me/memgen/query',
  'https://api.art3m1s.me/memgen/generate',
]
const localhost = [
  'http://localhost:4004/add',
  'http://localhost:4004/query',
  'http://localhost:4004/generate',
]

let local = false

let finalurl = []
if (local) {
  finalurl = localhost
} else {
  finalurl = url
}

const inputDocument = (userid, text) => {
  axios
    .post(finalurl[0], {
      userid: userid,
      text: text,
    })
    .then((res) => {
      return res
    })
}

const getCoverLetter = async (userid, text) => {
  try {
    const response = await axios.post(finalurl[1], {
      userid: userid,
      text: text,
    })
    return response.data
  } catch (error) {
    console.error(error)
  }
}

const generate = async (userid, description, text) => {
  try {
    const response = await axios.post(finalurl[2], {
      userid: userid,
      description: description,
      text: text,
    })
    return response.data
  } catch (e) {
    console.log(e)
  }
}

export {inputDocument, getCoverLetter, generate}
