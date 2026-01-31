const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Verify API Key is loaded
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing from .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/decompose", async (req, res) => {
  try {
    const { task } = req.body;
    console.log(`🤖 Received task: "${task}"`);

    // ---------------------------------------------------------
    // ✅ FIX: Using the model confirmed in your list
    // ---------------------------------------------------------
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Confirmed available for your key
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    const prompt = `
    You are a helpful AI assistant for neurodivergent users.
    Break this task into 3-5 very small, simple, and clear steps.
    Do not use complex language.
    Return ONLY a list of steps.

    Task: ${task}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ AI Response generated successfully");

    // Clean up the text to get a nice array
    const steps = text
      .split("\n")
      .map((s) => s.replace(/^[\d\-\*\•\)]+\.?\s*/, "").trim()) // Removes numbers/bullets
      .filter((s) => s.length > 0); // Removes empty lines

    res.json({ steps });

  } catch (err) {
    console.error("❌ Gemini API Error:", err.message);

    // Fallback if AI fails (keeps the app working)
    res.json({
      steps: [
        "Take a deep breath 🌿",
        "Put away distractions",
        "Do the first tiny step",
        "Reward yourself! 🎉",
      ],
    });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🔑 Key Status: ${process.env.GEMINI_API_KEY ? "Loaded" : "Missing"}\n`);
});