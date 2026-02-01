const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Verify API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing from .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- API ROUTES ---
app.post("/decompose", async (req, res) => {
  try {
    const { task } = req.body;
    console.log(`🤖 Received task: "${task}"`);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Using your working model
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    });

    const prompt = `
    You are a helpful AI assistant for neurodivergent users.
    Break this task into 4-6 very small, simple, and clear steps.
    Do not use complex language.
    Return ONLY a list of steps.

    Task: ${task}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const steps = text
      .split("\n")
      .map((s) => s.replace(/^[\d\-\*\•\)]+\.?\s*/, "").trim())
      .filter((s) => s.length > 0);

    res.json({ steps });

  } catch (err) {
    console.error("❌ Gemini API Error:", err.message);
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

// --- SERVE REACT FRONTEND (For Docker/Deployment) ---
// This assumes your frontend build is in a 'dist' folder at the root
app.use(express.static(path.join(__dirname, "../dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
});