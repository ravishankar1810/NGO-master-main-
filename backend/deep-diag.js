const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function deepDiag() {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
  console.log("API Key Length:", apiKey ? apiKey.length : 0);
  
  if (!apiKey) {
    console.error("No API Key found in process.env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent("test");
    const response = await result.response;
    console.log("Success!", response.text());
  } catch (error) {
    console.error("Detailed Error:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    if (error.response) {
       console.error("Response Status:", error.response.status);
       console.error("Response Text:", error.response.statusText);
    }
    // Check if it's a fetch error
    if (error.cause) {
       console.error("Cause:", error.cause);
    }
  }
}

deepDiag();
