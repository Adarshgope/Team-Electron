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
    const task = req.body.task;
    const userPreferences = req.body.userPreferences || {}; 
    const userTriggers = req.body.userTriggers || "";

    console.log(`🤖 Processing: "${task}" using Gemini 2.5 Flash`);

    // Use Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash" 
    });

    const prompt = `
      You are "Neurathon Mate," an expert executive function coach.
      
      TASK: "${task}"
      USER CONTEXT: "${userTriggers}"

      INSTRUCTIONS:
      1. Break the task into 4-6 "Micro-Wins" (tiny, non-intimidating steps).
      2. Assign a time estimate (e.g., "2 mins") to each step.
      3. Calculate the "total_time" for the whole task.
      4. Create a "roadmap" string that is PURE ENCOURAGEMENT (e.g., "You can crush this in 15 mins!").
      
      IMPORTANT: Output strictly valid JSON.
      
      JSON FORMAT:
      {
        "roadmap": "High-energy encouragement summary",
        "total_time": "15 mins", 
        "steps": [
          { "time": "2 mins", "action": "Step action", "tip": "Dopamine tip" }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean Markdown
    text = text.replace(/```json|```/g, "").trim();

    const data = JSON.parse(text);
    res.json(data);

  } catch (err) {
    console.error("❌ API Error:", err.message);
    res.json({
      roadmap: "You can do this in just a few minutes.",
      total_time: "~10 mins",
      steps: [
        { time: "1 min", action: "Breathe & Start", tip: "Just the first step!" },
        { time: "5 mins", action: "Do the main part", tip: "Keep going!" }
      ]
    });
  }
});

// --- SERVE REACT FRONTEND ---
app.use(express.static(path.join(__dirname, "../dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
});