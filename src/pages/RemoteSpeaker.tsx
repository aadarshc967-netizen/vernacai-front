import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
const WS_URL = `${(import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`).replace(/^http/, "ws")}/ws/remote`;

function RemoteSpeaker() {
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [translation, setTranslation] = useState(
    "Waiting for translation..."
  );
  const [language, setLanguage] = useState("Hindi");

  const socketRef = useRef<WebSocket | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);

  const speakNext = () => {
    if (!enabled || speakingRef.current || speechQueueRef.current.length === 0) {
      return;
    }

    const text = speechQueueRef.current.shift();

    if (!text) return;

    speakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang =
      language === "Hindi"
        ? "hi-IN"
        : language === "Tamil"
        ? "ta-IN"
        : language === "Telugu"
        ? "te-IN"
        : language === "Bengali"
        ? "bn-IN"
        : language === "Marathi"
        ? "mr-IN"
        : language === "Kannada"
        ? "kn-IN"
        : language === "Nepali"
        ? "ne-NP"
        : "en-US";

    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      speakingRef.current = false;

      setTimeout(() => {
        speakNext();
      }, 300);
    };

    utterance.onerror = () => {
      speakingRef.current = false;
      speakNext();
    };

    window.speechSynthesis.speak(utterance);
  };

  const enableSpeaker = () => {
    setEnabled(true);

    // Browser audio permission/unlock
    const test = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(test);

    setTimeout(() => {
      speakNext();
    }, 100);
  };

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to VernacAI server");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "translation") {
          setTranslation(data.text);

          if (data.language) {
            setLanguage(data.language);
          }

          speechQueueRef.current.push(data.text);
          speakNext();
        }
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from server");
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };

    return () => {
      socket.close();
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      speakNext();
    }
  }, [enabled, translation, language]);

  return (
  <div
    style={{
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
      color: "white",
      padding: "30px 20px",
      boxSizing: "border-box",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >

      {/* BACK BUTTON */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => {
            window.location.href = "/remote";
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#cbd5e1",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          <ArrowLeft size={18} />
          Back to Remote
        </button>
      </div>

      <div style={{ fontSize: "50px", marginBottom: "10px" }}>🌐</div>

      <h1
        style={{
          fontSize: "32px",
          margin: "0 0 8px",
        }}
      >
        VernacAI
      </h1>

        <p
          style={{
            color: "#cbd5e1",
            fontSize: "16px",
            marginBottom: "25px",
          }}
        >
          Remote Translation Speaker
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "30px",
            background: connected
              ? "rgba(34,197,94,0.15)"
              : "rgba(239,68,68,0.15)",
            border: `1px solid ${
              connected ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.5)"
            }`,
            marginBottom: "30px",
          }}
        >
          <span>{connected ? "🟢" : "🔴"}</span>
          {connected ? "Connected" : "Connecting..."}
        </div>

        {!enabled && (
          <button
            onClick={enableSpeaker}
            style={{
              width: "100%",
              padding: "18px",
              border: "none",
              borderRadius: "15px",
              background: "#4f46e5",
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "25px",
            }}
          >
            🔊 Enable Phone Speaker
          </button>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "20px",
            padding: "30px 20px",
            minHeight: "250px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            TRANSLATED MESSAGE
          </div>

          <div
            style={{
              fontSize: "28px",
              lineHeight: "1.5",
              fontWeight: "600",
              wordBreak: "break-word",
            }}
          >
            {translation}
          </div>

          <div
            style={{
              marginTop: "20px",
              color: "#a5b4fc",
              fontSize: "14px",
            }}
          >
            🔊 Output Language: {language}
          </div>
        </div>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "13px",
            marginTop: "25px",
          }}
        >
          Keep this page open on your phone. Translated speech will play
          automatically here.
        </p>
      </div>
    </div>
  );
}

export default RemoteSpeaker;