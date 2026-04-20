const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testAI() {
  const data = {
    category: 'toys',
    description: 'A box of gently used LEGO sets and board games.',
    quantity: '1 large box',
    recipients: ['children'],
    tone: 'warm'
  };

  const prompt = `
    You are a warm, community-driven AI assistant for a donation platform called "Donor".
    Generate a compelling 3-5 sentence donation prompt for the following item:
    Category: ${data.category}
    Description: ${data.description}
    Quantity: ${data.quantity}
    Intended Recipients: ${data.recipients.join(', ')}
    Tone: ${data.tone}

    Return the response in JSON format with two keys: "aiPrompt" and "ngoNote".
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("AI Response Raw:", text);
    const jsonStr = text.replace(/```json|```/g, "").trim();
    console.log("Parsed JSON:", JSON.parse(jsonStr));
  } catch (error) {
    console.error("AI Test Failed:", error);
  }
}

testAI();
