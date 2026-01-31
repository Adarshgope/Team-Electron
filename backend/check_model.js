// check_models.js
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // This fetches the raw list of models available to YOUR specific API key
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const data = await response.json();

    if (data.error) {
      console.error("Error:", data.error.message);
      return;
    }

    console.log("\n=== AVAILABLE MODELS FOR YOUR KEY ===");
    const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    generateModels.forEach(model => {
      console.log(`✅ ${model.name.replace("models/", "")}`);
    });
    console.log("=====================================\n");
    
  } catch (error) {
    console.error("Failed to fetch models:", error);
  }
}

listModels();