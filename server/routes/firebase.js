const { collection, setDoc, doc } = require("firebase/firestore");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const url = "https://api.art3m1s.me/milvus/api/v1/entities";
const headers = {
  accept: "application/json",
  "Content-Type": "application/json",
};
//dotenv get OpenAI key
require("dotenv").config();
const openai = require("openai");
openai.apiKey = process.env.OPENAI_API_KEY;

var express = require("express");
var router = express.Router();

// Add Text by uuid based on useridCollection
async function addText(userid, uuid, text) {
  const useridCollection = collection(db, userid);

  //Sanitize text
  text = text.replace(/[^a-zA-Z0-9 ]/g, "");

  try {
    const response = await openai.Embed.create({
      model: "text-embedding-ada-002",
      inputs: [text],
    });

    const textDoc = doc(useridCollection, uuid);
    await setDoc(textDoc, { text, embedding: response.data[0].embedding });

    const data = {
      collection_name: userid,
      fields_data: [
        {
          field_name: "type",
          type: 20,
          field: ["resume"],
        },
        {
          field_name: "uuid",
          type: 20,
          field: [uuid],
        },
        {
          field_name: "embedding",
          type: 11,
          field: [response.data[0].embedding],
        },
      ],
      num_rows: 1,
    };
    axios
      .post(url, data, { headers })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    console.log("Document written with UUID: ", uuid, text);
    return uuid;
  } catch (e) {
    console.error("Error adding text:", e);
    throw e;
  }
}

router.post("/firebase/insert", async (req, res) => {
  const { userid, text } = req.body;
  var uuid = uuidv4();
  try {
    const responseData = await addText(userid, uuid, text);
    res.status(201).json({ message: "success", data: responseData });
  } catch (error) {
    res.status(500).json({ message: "error", data: error });
  }
});
