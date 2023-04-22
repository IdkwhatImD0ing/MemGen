import axios from "axios";

const inputDocument = (userid, text) => {
  axios
    .post("http://localhost:3000/add", {
      userid: userid,
      text: text,
    })
    .then((res) => {
      return res;
    });
};

const getCoverLetter = async (userid, text) => {
  try {
    const response = await axios.post("http://localhost:3000/query", {
      userid: userid,
      text: text,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const generate = async (description, text) => {
  try {
    const response = await axios.post("http://localhost:3000/generate", {
      description: description,
      text: text,
    });
    return response.data;
  } catch (e) {
    console.log(error);
  }
};

export { inputDocument, getCoverLetter, generate };
