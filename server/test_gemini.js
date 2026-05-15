require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const result = await model.generateContent("Give me a JSON object with a test message.");
    console.log("Response:", result.response.text());
  } catch(e) {
    console.error("Error:", e);
  }
}

run();
