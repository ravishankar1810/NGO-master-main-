const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
     // There isn't a direct "listModels" in the simple SDK, but we can try a known one or check error
     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
     const result = await model.generateContent("hi");
     console.log("Success with gemini-pro!");
  } catch (error) {
     console.error("Failed with gemini-pro:", error.message);
  }
}

listModels();
