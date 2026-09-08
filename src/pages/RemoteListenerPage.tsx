import { useEffect, useRef, useState } from "react";

const API_BASE = `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`}`;
const WS_BASE = `${API_BASE.replace(/^http/, "ws")}/ws/remote`;

function RemoteListenerPage() {
  const [sessionCode, setSessionCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [error, setError] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  const joinSession = async () => {
    const code = sessionCode.trim().toUpperCase();

    if (!code) {
      setError("Please enter the session code.");
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_BASE}/remote/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_code: code,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Invalid session code.");
        return;
      }

      const ws = new WebSocket(
        `${WS_BASE}?code=${encodeURIComponent(code)}&role=listener`
      );

      ws.onopen = () => {
        console.log("Listener WebSocket connected");
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "translation") {
            setTranslatedText(message.text || "");

            if ("speechSynthesis" in window && message.text) {
              window.speechSynthesis.cancel();

              const speech = new SpeechSynthesisUtterance(
                message.text
              );

              const languageVoiceMap: Record<string, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Nepali: "ne-NP",
  Bengali: "bn-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Marathi: "mr-IN",
  Gujarati: "gu-IN",
  Kannada: "kn-IN",
  Malayalam: "ml-IN",
  Punjabi: "pa-IN",
  Odia: "or-IN",
  Assamese: "as-IN",
  Urdu: "ur-IN",
};

speech.lang = languageVoiceMap[message.language] || "en-IN";

              window.speechSynthesis.speak(speech);
            }
          }
        } catch (error) {
          console.error("Message error:", error);
        }
      };

      ws.onclose = () => {
        console.log("Listener WebSocket disconnected");
        setConnected(false);
      };

      ws.onerror = (error) => {
        console.error("Listener WebSocket error:", error);
        setError("WebSocket connection failed.");
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Join error:", error);
      setError("Cannot connect to the backend.");
    }
  };

  useEffect(() => {
  return () => {
    if (wsRef.current) {
      wsRef.current.close(1000, "Listener left session");
      wsRef.current = null;
    }
  };
}, []);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl">

        <button
  onClick={() => {
    if (wsRef.current) {
      wsRef.current.close(1000, "Listener left session");
      wsRef.current = null;
    }

    window.location.href = "/remote";
  }}
  className="mb-8 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
>
          ← Back
        </button>

        <h1 className="mb-2 text-3xl font-bold">
          Remote Listener
        </h1>

        <p className="mb-8 text-slate-400">
          Enter the Speaker's session code to join.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

          <label className="mb-2 block text-sm text-slate-400">
            Session Code
          </label>

          <input
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
            placeholder="VA-XXXX"
            className="mb-4 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <button
            onClick={joinSession}
            disabled={connected}
            className="w-full rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            {connected ? "Connected" : "Join Session"}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          {connected && (
            <div className="mt-6 rounded-xl bg-black/30 p-5">
              <p className="mb-2 text-sm text-slate-400">
                Live Translation
              </p>

              <p className="text-xl">
                {translatedText || "Waiting for speaker..."}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default RemoteListenerPage;