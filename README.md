# 🚀 PitchNest: Your AI Boardroom

PitchNest is a real-time, multimodal AI agent platform designed to help startup founders practice, refine, and perfect their pitches. Built for the **Gemini Live Agent Challenge**, PitchNest simulates a high-stakes venture capital boardroom or a supportive pitch coaching session using real-time audio, vision, and screen-sharing capabilities.

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%202.0%20Flash-blue)](https://deepmind.google/technologies/gemini/)
[![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20Node.js%20%7C%20WebSockets-success)](#)

---

## 💡 The Problem & Solution
Founders often struggle to get high-quality, realistic feedback on their pitches before facing real investors. 

**PitchNest solves this by providing a living, breathing AI panel.** Instead of a basic text chatbot, PitchNest uses the Gemini Live API to create an interactive voice agent that watches your pitch deck, monitors your body language through your webcam, and converses with you in real-time.

## ✨ Key Features (Live Agent Track)
* **🎙️ Real-Time Conversational AI:** Talk naturally with your AI panel. The agent handles interruptions gracefully and responds with ultra-low latency.
* **👁️ Multimodal Vision (Face & Deck):** Gemini actively processes a live 4fps feed of your webcam and screen share. It can read your slides, catch you if you read from a script, and tell you to move to the next slide if you take too long.
* **🧠 Dynamic Personas:** * **Marcus (The VC):** A ruthless, fast-paced lead investor who demands hard numbers and fact-checks your market claims live using Google Search.
  * **Riley (The Coach):** A supportive strategist who helps you refine your value proposition.
* **📊 Post-Pitch Analytics:** Once the session ends, Gemini evaluates the transcript to generate a comprehensive JSON report, scoring your delivery, clarity, scalability, and investor readiness.

---

## 🏗️ System Architecture
* **Frontend:** React (Vite), TailwindCSS, Recharts, Framer Motion.
* **Backend:** Node.js, Express, Better-SQLite3.
* **Real-Time Engine:** WebSockets (`ws`) bridging the frontend audio/video stream directly to the `BidiGenerateContent` Gemini API.
* **Cloud Storage:** Google Cloud Storage (GCS) for secure video recording and pitch deck hosting.
* **AI Models:** * `gemini-2.5-flash-native-audio-preview-12-2025` (For the Live WebSocket Agent)
  * `gemini-2.0-flash` (For the REST API post-pitch JSON evaluation)

---

## 🛠️ Local Spin-Up Instructions (For Judges)

To run PitchNest locally and test the live multimodal agent features:

### 1. Prerequisites
* Node.js (v18 or higher)
* A Gemini API Key
* A Google Cloud Storage Bucket (optional, for video uploads)

### 2. Clone the Repository
\`\`\`bash
git clone https://github.com/immanex/PitchNest-Live-Agent.git
cd PitchNest-Live-Agent
\`\`\`

### 3. Install Dependencies
You need to install dependencies for both the frontend and backend.
\`\`\`bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
\`\`\`

### 4. Environment Variables
Create a `.env` file in the `backend` directory and add the following keys:
\`\`\`env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
GCS_BUCKET_NAME=your_gcs_bucket_name_here
\`\`\`

### 5. Start the Application
Open two terminal windows.

**Terminal 1 (Backend):**
\`\`\`bash
cd backend
npm start
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

### 6. Pitch!
Open `http://localhost:5173` in your browser. Allow camera and microphone permissions, select a pitch mode, and step into the boardroom!

---

## 🏆 Hackathon Learnings
Building PitchNest taught us the incredible power of state-machine prompting for Live Agents. Transitioning from a turn-based chatbot to an interruptible, vision-enabled WebRTC agent required deep optimizations in buffer management and prompt engineering to keep the AI from sounding "robotic." We learned how to give the AI true agency by allowing it to use Google Search tools dynamically while holding a conversation.
