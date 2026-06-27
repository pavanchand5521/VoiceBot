# Groq Voice Bot (AI Interview Assistant)

An interactive voice-enabled AI assistant built using the browser's native **Web Speech API** for voice-to-text (Speech Recognition) and text-to-voice (Speech Synthesis), powered by **Groq's Llama 3.1** model.

The bot answers questions from the perspective of an advanced AI system, responding conversationally to sample interview-style questions about its superpower, growth goals, boundaries, and life story.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), JavaScript, Vanilla CSS (Premium Glassmorphic Theme with custom audio visualizer animations).
- **Backend:** Node.js + Express (Groq SDK).
- **Voice Capabilities:**
  - **Speech to Text:** Web Speech API (`SpeechRecognition`)
  - **Text to Speech:** Web Speech API (`SpeechSynthesis`)
- **Deployment:** Vercel (Front-end static build & Back-end Serverless Functions).

---

## 📂 Project Structure

```text
VoiceBot/
├── api/                    # Vercel Serverless Function entry point
│   └── index.js            # Routes Vercel requests to the Express app
├── backend/                # Express API server
│   ├── .env                # Local environmental variables
│   ├── server.js           # Server logic and Groq model prompt config
│   └── package.json        
├── frontend/               # React client
│   ├── src/
│   │   ├── App.jsx         # App component
│   │   ├── VoiceBot.jsx    # Audio visualizer, Speech API, and Chat logic
│   │   ├── api.js          # API service caller
│   │   └── index.css       # Premium styles and animations
│   ├── vite.config.js      # Vite proxy configurations
│   └── package.json
├── package.json            # Root package.json orchestrating build
└── vercel.json             # Vercel routing configurations
```

---

## 🚀 Setup & Running Locally

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Set Up Environment Variables
Create a file named `.env` in the `backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

### 3. Install Dependencies
Run npm install in both directories:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Run the Servers
Open two separate terminal windows:

* **Terminal 1: Start Backend**
  ```bash
  cd backend
  node server.js
  ```
  *(Server runs on http://localhost:5000)*

* **Terminal 2: Start Frontend**
  ```bash
  cd frontend
  npm run dev
  ```
  *(Vite development client runs on http://localhost:3000)*

---

## ☁️ Vercel Deployment

This project is configured as a monorepo that deploys the React frontend and Node.js Express backend together under a single Vercel project for free.

1. Import this repository in the **Vercel Dashboard**.
2. Keep the **Application Preset** as **Other** (default).
3. In **Project Settings**, scroll to **Environment Variables** and add:
   - **Key:** `GROQ_API_KEY`
   - **Value:** *Your Groq API Key*
4. Click **Deploy**.
   - Vercel will automatically compile the React assets into the root `/public` folder and wrap the Express app as a Serverless function at `/api`.
