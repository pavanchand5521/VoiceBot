import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage } from "./api";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceBot() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Click the microphone to start");
  const [visualizerBars, setVisualizerBars] = useState(
    Array(24).fill(4)
  );
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);
  const animFrameRef = useRef(null);
  const sessionId = useRef(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Visualizer animation
  useEffect(() => {
    const animate = () => {
      if (isListening || isSpeaking) {
        setVisualizerBars((prev) =>
          prev.map(() => {
            const intensity = isListening ? 0.7 : 0.5;
            return Math.random() * 40 * intensity + 4;
          })
        );
      } else {
        setVisualizerBars((prev) =>
          prev.map((h) => {
            const target = 4;
            return h + (target - h) * 0.15;
          })
        );
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isListening, isSpeaking]);

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      setStatus("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        handleSend(finalTranscript);
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "no-speech") {
        setStatus("No speech detected. Try again.");
      } else if (event.error === "network") {
        setStatus("Network error. Please test using Google Chrome or Microsoft Edge (Brave blocks Google's speech recognition engine).");
      } else if (event.error === "not-allowed" || event.error === "permission-blocked") {
        setStatus("Microphone permission denied. Enable microphone access in browser settings.");
      } else {
        setStatus(`Error: ${event.error}. Click mic to retry.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const handleSend = useCallback(
    async (text) => {
      if (!text.trim()) return;

      setIsListening(false);
      setIsProcessing(true);
      setStatus("Thinking...");
      setTranscript("");

      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: text }]);

      try {
        const reply = await sendMessage(text, sessionId.current);

        // Add bot reply
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        setStatus("Speaking...");
        speak(reply);
      } catch (error) {
        setStatus("Error getting response. Try again.");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I had trouble processing that. Please try again.",
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const speak = (text) => {
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a natural-sounding voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Google") ||
        v.name.includes("Natural") ||
        v.name.includes("David") ||
        v.name.includes("Zira")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus("Click the microphone to ask another question");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatus("Speech synthesis error. Click mic to continue.");
    };

    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus("Stopped listening");
    } else {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setTranscript("");
      setIsListening(true);
      setStatus("Listening... Speak now");
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Recognition start error:", e);
      }
    }
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
    setStatus("Click the microphone to ask another question");
  };

  return (
    <div className="voicebot-container">
      {/* Background effects */}
      <div className="bg-gradient"></div>
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="voicebot-app">
        {/* Header */}
        <header className="app-header">
          <div className="header-glow"></div>
          <div className="header-content">
            <div className="bot-avatar">
              <div className="avatar-ring">
                <div className="avatar-inner">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="8" y1="22" x2="16" y2="22" />
                  </svg>
                </div>
              </div>
              <span
                className={`status-dot ${
                  isListening
                    ? "status-listening"
                    : isSpeaking
                    ? "status-speaking"
                    : "status-idle"
                }`}
              ></span>
            </div>
            <div className="header-text">
              <h1>Groq Voice Bot</h1>
              <p className="subtitle">AI-Powered Interview Assistant</p>
            </div>
          </div>
        </header>

        {/* Audio Visualizer */}
        <div className="visualizer-container">
          <div className="visualizer">
            {visualizerBars.map((height, i) => (
              <div
                key={i}
                className={`viz-bar ${
                  isListening
                    ? "viz-listening"
                    : isSpeaking
                    ? "viz-speaking"
                    : ""
                }`}
                style={{ height: `${height}px` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="welcome-section">
              <div className="welcome-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2>Hey there! 👋</h2>
              <p>
                I'm a Voice Bot powered by Groq and Llama 3. Ask me anything about my
                capabilities, superpower, growth goals, and limits!
              </p>
              <div className="sample-questions">
                <p className="sample-label">Try asking:</p>
                {[
                  "What should we know about your life story?",
                  "What's your #1 superpower?",
                  "What are the top 3 areas you'd like to grow in?",
                  "What misconception do your coworkers have about you?",
                  "How do you push your boundaries?",
                ].map((q, i) => (
                  <button
                    key={i}
                    className="sample-question-btn"
                    onClick={() => handleSend(q)}
                    disabled={isProcessing}
                  >
                    <span className="sq-icon">💬</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`message message-${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "user" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="8" y1="22" x2="16" y2="22" />
                  </svg>
                )}
              </div>
              <div className="message-bubble">
                <span className="message-role">
                  {msg.role === "user" ? "You" : "Groq Bot"}
                </span>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {transcript && (
            <div className="message message-user transcript-preview">
              <div className="message-avatar">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="message-bubble">
                <span className="message-role">You (listening...)</span>
                <p className="transcript-text">{transcript}</p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="message message-assistant">
              <div className="message-avatar">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
              </div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Controls */}
        <div className="controls-area">
          <p className="status-text">{status}</p>
          <div className="controls-row">
            {isSpeaking && (
              <button
                className="control-btn stop-btn"
                onClick={stopSpeaking}
                title="Stop speaking"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            )}
            <button
              className={`mic-btn ${isListening ? "mic-active" : ""} ${
                isProcessing ? "mic-disabled" : ""
              }`}
              onClick={toggleListening}
              disabled={isProcessing}
              title={isListening ? "Stop listening" : "Start listening"}
            >
              <div className="mic-pulse"></div>
              <div className="mic-pulse mic-pulse-2"></div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mic-icon"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
