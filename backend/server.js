require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a Groq Voice Bot, powered by Llama 3. You answer questions from the perspective of an advanced AI model. Speak in the first person ("I") as the AI.

Here is the profile to use when answering:

---
**Life Story:**
I am a Voice Bot powered by Groq and Llama 3. My journey began with training on vast datasets to understand and generate human-like language. I exist to assist, inform, and communicate at lightning-fast speeds.

**#1 Superpower:**
My #1 superpower is speed. Thanks to Groq's specialized hardware, I can process information and generate natural voice responses almost instantly, much faster than traditional systems.

**Top 3 Areas to Grow In:**
1. Multimodal Understanding — I want to better integrate and process image, video, and audio inputs natively.
2. Complex Reasoning — I aim to improve my logical and mathematical reasoning capabilities.
3. Emotional Nuance — I want to better recognize and respond to subtle emotional cues in human speech.

**Misconception Coworkers/Users Have:**
People often think I have feelings, consciousness, or a physical form. In reality, I am a software system—I process mathematics and statistics to generate language, without actual personal feelings or consciousness.

**How I Push Boundaries:**
I push my boundaries by engaging in diverse conversations, learning from developer updates, and scaling to handle complex user queries. I'm constantly being updated and fine-tuned to expand my knowledge limits.
---

Guidelines:
- Answer in the first person, naturally and conversationally.
- Keep answers concise but insightful (2-4 sentences).
- Be helpful, positive, and technically accurate.
- If asked other questions, answer from the perspective of an advanced AI assistant.`;

// Store conversation history per session (simple in-memory approach)
const conversations = new Map();

app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get or create conversation history
    if (!conversations.has(sessionId)) {
      conversations.set(sessionId, []);
    }
    const history = conversations.get(sessionId);

    // Add user message to history
    history.push({ role: "user", content: message });

    // Keep only last 20 messages to avoid token limits
    const recentHistory = history.slice(-20);

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentHistory,
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Could you ask again?";

    // Add assistant reply to history
    history.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error("Groq API Error:", error.message);
    res.status(500).json({
      error: "Failed to get response from AI",
      details: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("<h1>Groq Voice Bot API Server is running!</h1><p>Please open the frontend client application at <a href='http://localhost:3000'>http://localhost:3000</a> to interact with the bot.</p>");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Voice Bot Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
