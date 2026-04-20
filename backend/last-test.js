const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function lastTest() {
  const apiKey = process.env.GEMINI_API_KEY.trim();
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try different model variations
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  
  for (const modelName of models) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("hello");
      const response = await result.response;
      console.log(`✅ Success with ${modelName}:`, response.text().substring(0, 50));
      process.exit(0);
    } catch (err) {
      console.log(`❌ Failed ${modelName}:`, err.message);
    }
  }
}

lastTest();
