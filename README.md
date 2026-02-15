# 🚀 Neurathon Mate – AI Micro-Win Task Decomposer

An AI-powered executive function coach that helps users break down complex tasks into small, manageable “micro-wins” using Generative AI and voice input.

Built for Neurathon 2026.

---

## 📌 Problem Statement

Many students and professionals struggle with task paralysis and overwhelm when facing large or complex tasks. This leads to reduced productivity and poor time management.

Our goal is to provide an intelligent assistant that simplifies tasks into actionable steps with motivation and realistic time estimates.

---

## 💡 Solution Overview

Neurathon Mate is an AI-powered system that:

- Accepts tasks via text or voice
- Uses Generative AI to decompose tasks
- Generates 4–6 small actionable steps
- Provides time estimates and encouragement
- Helps users build momentum

The system focuses on reducing cognitive load and improving task initiation.

---

## 🏗 System Architecture

### Text Input Flow

---

## ⚙ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Gemini API (@google/generative-ai)

### Voice Service
- FastAPI
- Faster-Whisper (int8)

### Deployment
- Docker
- Docker Compose

---

## 🌟 Core Innovation

- AI-based executive function coaching
- Micro-Win productivity model
- Dual input: Text + Voice
- Structured JSON responses
- Encouragement-based workflow

Unlike traditional to-do apps, Neurathon Mate understands context and generates personalized task roadmaps.

---

## 📊 Constraints Achieved
```
| Parameter        | Achieved Status |
|------------------|-----------------|
| Response Time    | Low latency using Gemini Flash |
| Step Limit       | 4–6 structured steps |
| Memory Usage     | Optimized Whisper int8 model |
| Security         | Environment variables for API keys |
| Deployment       | Dockerized setup |
```
---

## 🖥 Implementation Snapshot

Features implemented:

- Task input interface
- Voice recording and transcription
- AI-generated roadmap display
- Time estimation
- Motivational tips

(Screenshots can be added here)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Docker (optional)
- Gemini API Key

---

### 1️⃣ Clone the Repository
```bash

git clone <your-repo-link>
cd neurathon-mate

## 🔧 How to Run the Project

## Best:
You can run the entire project using Docker by executing `docker-compose up --build` from the main
project directory. This will automatically build and start all services.

Alternative option:
First, open the `backend` folder and create a file named `.env`. Inside this file, add your Gemini API key
in the following format:

GEMINI_API_KEY=your_api_key_here

Next, go to the `frontend` folder and install the required packages by running `npm install`. After installation,
start the frontend using `npm run dev`. This will launch the web interface in your browser.

Then, move to the `backend` folder and install the backend dependencies using `npm install`. Start the backend
server by running `node index.js`.

To enable voice input, go to the `voice` folder and install the required Python libraries using `pip install -r
requirements.txt`. After that, start the voice service by running `python main.py`.


```

📁 Project Structure
```
Neurathon-Mate/
│
├── frontend/
├── backend/
├── voice/
├── docker-compose.yml
├── README.md
└── .env.example
```
