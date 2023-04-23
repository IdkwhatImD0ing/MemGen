import axios from 'axios'

const inputDocument = (userid, text) => {
  axios
    .post('https://api.art3m1s.me/memgen/add', {
      userid: userid,
      text: text,
    })
    .then((res) => {
      return res
    })
}

const getCoverLetter = async (userid, text) => {
  try {
    const response = await axios.post('https://api.art3m1s.me/memgen/query', {
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
    const response = await axios.post(
      'https://api.art3m1s.me/memgen/generate',
      {
        userid: userid,
        description: description,
        text: text,
      },
    )
    return response.data
  } catch (e) {
    console.log(error)
  }
}

export {inputDocument, getCoverLetter, generate}
