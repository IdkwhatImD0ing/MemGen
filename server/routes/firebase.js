const { collection, setDoc, doc } = require('firebase/firestore');
const { v4: uuidv4 } = require('uuid');
//dotenv get OpenAI key
require('dotenv').config();
const openai = require("openai");
openai.apiKey = process.env.OPENAI_API_KEY;

var express = require('express');
var router = express.Router();

// Add Text by uuid based on useridCollection
async function addText(useridCollection, uuid, text) {
    //Sanitize text
    text = text.replace(/[^a-zA-Z0-9 ]/g, "");

    try {
        const response = await openai.Embed.create({
            model: "text-embedding-ada-002",
            inputs: [text],
        });

        const textDoc = doc(useridCollection, uuid);
        await setDoc(textDoc, { text, embedding: response.data[0].embedding });
        console.log('Document written with UUID: ', uuid, text);
        return uuid;
    } catch (e) {
        console.error('Error adding text:', e);
        throw e;
    }
}

router.post('/firebase/insert', async (req, res) => {
    const { userid, text } = req.body;
    var uuid = uuidv4();

    try {
        const useridCollection = collection(db, userid);
        const responseData = await addText(useridCollection, uuid, text);
        res.status(201).json({ message: 'success', data: responseData });
    } catch (error) {
        res.status(500).json({ message: 'error', data: error });
    }
});
