import { useEffect, useRef, useState } from "react";
const WS_URL = `ws://${window.location.hostname}:8000/ws/remote`;


import {
  ArrowLeft,
  Languages,
  Mic,
  MicOff,
  Send,
  Loader2,
  Copy,
} from "lucide-react";

const languages = [
  // 🇮🇳 Indian Languages
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
  "Nepali",
  "Sanskrit",
  "Santali",
  "Sindhi",
  "Kashmiri (Arabic)",
  "Kashmiri (Devanagari)",
  "Manipuri",
  "Magahi",
  "Awadhi",
  "Chhattisgarhi",
  "Bhojpuri",
  "Maithili",

  // 🌍 European Languages
  "French",
  "German",
  "Spanish",
  "Portuguese",
  "Italian",
  "Dutch",
  "Russian",
  "Ukrainian",
  "Polish",
  "Czech",
  "Danish",
  "Finnish",
  "Swedish",
  "Norwegian Bokmål",
  "Norwegian Nynorsk",
  "Greek",

  // 🌏 Asian Languages
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Japanese",
  "Korean",
  "Thai",
  "Vietnamese",
  "Indonesian",

  // 🌎 Middle Eastern Languages
  "Arabic",
  "Hebrew",
  "Turkish",
];

const API_URL = `http://${window.location.hostname}:8000/translate`;

function RemoteSpeakerPage() {
  const [fromLanguage, setFromLanguage] = useState("English");
  const [toLanguage, setToLanguage] = useState("Hindi");
  const [sessionCode, setSessionCode] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const [connectedDevices, setConnectedDevices] = useState(0);

    const createRemoteSession = async () => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:8000/remote/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        console.error(data.error);
        return null;
      }

      setSessionCode(data.session_code);

      console.log("Remote Session:", data.session_code);

      return data.session_code;
    } catch (error) {
      console.error("Session create error:", error);
      return null;
    }
  };
  const [speakerLanguageSearch, setSpeakerLanguageSearch] = useState("");
  const [listenerLanguageSearch, setListenerLanguageSearch] = useState("");
  const filteredSpeakerLanguages = languages.filter((language) =>
  language
    .toLowerCase()
    .includes(speakerLanguageSearch.toLowerCase())
);

const filteredListenerLanguages = languages.filter((language) =>
  language
    .toLowerCase()
    .includes(listenerLanguageSearch.toLowerCase())
);
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const [listening, setListening] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  

  const recognitionRef = useRef<any>(null);

  // Speech collected since the last translation
  const speechBufferRef = useRef("");

  // Prevent multiple translation requests at the same time
  const translatingRef = useRef(false);

  // Keep recognition alive
  const shouldListenRef = useRef(false);

  // --------------------------------
  // LANGUAGE CODE
  // --------------------------------
  const getSpeechLanguage = (language: string) => {
  const speechLanguages: Record<string, string> = {
    English: "en-IN",

    Hindi: "hi-IN",
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
    Nepali: "ne-NP",
    Sanskrit: "sa-IN",

    French: "fr-FR",
    German: "de-DE",
    Spanish: "es-ES",
    Portuguese: "pt-PT",
    Italian: "it-IT",
    Dutch: "nl-NL",

    Russian: "ru-RU",
    Ukrainian: "uk-UA",
    Polish: "pl-PL",
    Czech: "cs-CZ",
    Danish: "da-DK",
    Finnish: "fi-FI",
    Swedish: "sv-SE",
    Greek: "el-GR",

    Japanese: "ja-JP",
    Korean: "ko-KR",
    Thai: "th-TH",
    Vietnamese: "vi-VN",
    Indonesian: "id-ID",

    Arabic: "ar-SA",
    Hebrew: "he-IL",
    Turkish: "tr-TR",

    "Chinese (Simplified)": "zh-CN",
    "Chinese (Traditional)": "zh-TW",
  };

  return speechLanguages[language] || "en-IN";
};
useEffect(() => {
  if (!listening) return;

  speechBufferRef.current = "";
  setTranslatedText("");
  setText("");
}, [fromLanguage, toLanguage]);
  // --------------------------------
  // TRANSLATE ONE SPEECH CHUNK
  // --------------------------------
  const translateChunk = async (chunk: string) => {
    const cleanText = chunk.trim();

    if (!cleanText || translatingRef.current) {
      return;
    }

    translatingRef.current = true;
    setTranslating(true);
    setError("");

    try {
      console.log("TARGET LANGUAGE:", toLanguage);  
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
         text: cleanText,
         source_language: fromLanguage,
         target_language: toLanguage,
         session_code: sessionCode || null,
     }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const translated = data.translated_text?.trim();

      if (!translated) {
        setError("Translation response nahi mila.");
        return;
      }

      // Show translation on speaker screen
      setTranslatedText((previous) =>
        previous
          ? `${previous} ${translated}`
          : translated
      );

      // Translation is already broadcast by FastAPI
      // to connected remote listeners.

      setSent(true);

      setTimeout(() => {
        setSent(false);
      }, 2000);
    } catch (error) {
      console.error("Translation error:", error);

      setError(
        "Translation API se connection nahi ho pa raha. Check karo ki FastAPI server running hai."
      );
    } finally {
      translatingRef.current = false;
      setTranslating(false);
    }
  };

  // --------------------------------
  // AUTOMATIC 4.5 SECOND TRANSLATION
  // --------------------------------
  useEffect(() => {
  if (!shouldListenRef.current) {
    return;
  }

  const chunk = speechBufferRef.current.trim();

  if (!chunk || translatingRef.current) {
    return;
  }

  speechBufferRef.current = "";

  translateChunk(chunk);
}, [speechBufferRef.current]);

  // --------------------------------
  // START CONTINUOUS SPEECH
  // --------------------------------
 const startSpeaking = async () => {
  try {
    // 🎤 Ask for microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    // Permission milne ke baad temporary stream release
    stream.getTracks().forEach((track) => track.stop());

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input supported nahi hai. Google Chrome use karo."
      );
      return;
    }

    setError("");
    setText("");
    setTranslatedText("");

    speechBufferRef.current = "";
    shouldListenRef.current = true;

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = getSpeechLanguage(fromLanguage);
    console.log("Current Speech Language:", fromLanguage);
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    recognition.onresult = (event: any) => {
  let finalText = "";
  let interimText = "";

  for (
    let i = event.resultIndex;
    i < event.results.length;
    i++
  ) {
    const result = event.results[i];

    const transcript = result[0].transcript.trim();

    if (!transcript) continue;

    if (result.isFinal) {
      finalText += transcript;

      speechBufferRef.current +=
        (speechBufferRef.current ? " " : "") +
        transcript;
    } else {
      interimText += transcript;
    }
  }

  const currentBuffer = speechBufferRef.current;

  const displayText =
    `${currentBuffer} ${interimText}`.trim();

  if (displayText) {
    setText(displayText);
  }

  // Final speech milte hi turant translation
  if (finalText.trim() && !translatingRef.current) {
    const chunk = finalText.trim();

    speechBufferRef.current = "";

    translateChunk(chunk);
  }
};

    recognition.onerror = (event: any) => {
      console.log(
        "Speech recognition error:",
        event.error
      );

      if (event.error === "not-allowed") {
        shouldListenRef.current = false;
        setListening(false);

        setError(
          "Microphone permission allow karo."
        );

        return;
      }

      if (event.error === "audio-capture") {
        setError(
          "Microphone detect nahi ho raha."
        );
      }
    };

    recognition.onend = () => {
      if (!shouldListenRef.current) {
        setListening(false);
        return;
      }

      setTimeout(() => {
        if (!shouldListenRef.current) {
          return;
        }

        
      }, 200);
    };

    try {
      recognition.start();
    } catch (error) {
      console.log(
        "Recognition start error:",
        error
      );
    }

  } catch (error) {
    console.error("Microphone permission error:", error);

    shouldListenRef.current = false;
    setListening(false);

    setError(
      "Microphone permission required hai. Please Allow karo."
    );
  }
};

    
  // --------------------------------
  // STOP SPEAKING
  // --------------------------------
  const stopSpeaking = async () => {
  shouldListenRef.current = false;

  if (recognitionRef.current) {
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.log(error);
    }

    recognitionRef.current = null;
  }

  setListening(false);

  // Close speaker WebSocket
  

  // Translate remaining speech immediately
  const remainingText =
    speechBufferRef.current.trim();

  if (remainingText && !translatingRef.current) {
    speechBufferRef.current = "";

    await translateChunk(remainingText);
  }
};

  // --------------------------------
  // MANUAL TEXT TRANSLATION
  // --------------------------------
  const translateTypedText = async () => {
    if (!text.trim()) {
      setError(
        "Please type or speak something first."
      );
      return;
    }

    await translateChunk(text);
  };

  // --------------------------------
  // CLEANUP
  // --------------------------------
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log(error);
        }
      }
    };
  }, []);

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600">
              <Languages className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold">
                VernacAI
              </h1>

              <p className="text-xs text-slate-400">
                Remote Speaker
              </p>
            </div>

          </div>

         <button
            onClick={() => {
              if (wsRef.current) {
                 wsRef.current.close(1000, "Listener left session");
                 wsRef.current = null;
            }

            
             window.location.href = "/remote";
      }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

        </div>
      </nav>

      {/* MAIN */}
      <main className="mx-auto max-w-5xl px-6 py-12">

        {/* HEADER */}
        {/* HEADER */}
<div className="text-center">

  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
            {listening ? (
              <Mic className="h-8 w-8 animate-pulse text-cyan-300" />
            ) : (
              <Mic className="h-8 w-8 text-cyan-300" />
            )}
          </div>

          <h2 className="mt-6 text-4xl font-black">
            You are the Speaker
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Speak continuously. VernacAI automatically
            translates your speech every few seconds
            and sends it to the listener.
          </p>
         <div
  className={`mt-6 inline-flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium ${
    listening
      ? "border-red-400/30 bg-red-400/10 text-red-300"
      : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
  }`}
>
  <span
    className={`h-2.5 w-2.5 rounded-full ${
      listening
        ? "animate-pulse bg-red-400"
        : "bg-emerald-400"
    }`}
  />

  <span>
    {listening ? "LIVE • Listening" : "READY • Speaker Online"}
  </span>

  {sessionCode && (
    <>
      <span className="text-slate-600">|</span>

      <span className="text-slate-300">
        👥 {connectedDevices} Connected
      </span>
    </>
  )}
</div>
</div>
         

        {/* LANGUAGE SELECTION */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                SPEAKING LANGUAGE
              </label>
               <input
  type="text"
  value={speakerLanguageSearch}
onChange={(e) => setSpeakerLanguageSearch(e.target.value)}
  placeholder="🔎 Search language..."
  className="mb-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
/>
              <select
                value={fromLanguage}
                disabled={listening}
                onChange={(e) =>
                  setFromLanguage(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                {filteredSpeakerLanguages.map((language) => (
                  <option
                    key={language}
                    value={language}
                  >
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                LISTENER LANGUAGE
              </label>
<input
  type="text"
  value={listenerLanguageSearch}
  onChange={(e) => setListenerLanguageSearch(e.target.value)}
  placeholder="🔎 Search language..."
  className="mb-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
/>
              <select
                value={toLanguage}
                onChange={(e) =>
                  setToLanguage(e.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              >
                {filteredListenerLanguages.map((language) => (
                  <option
                    key={language}
                    value={language}
                  >
                    {language}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* MESSAGE AREA */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* SPEAKER INPUT */}
<div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">

  {/* HEADER */}
  <div className="mb-4 flex items-center justify-between">

    <div>
      <h3 className="font-semibold">
        Live Speech Input
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Speaking in {fromLanguage}
      </p>
    </div>

    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
        listening
          ? "border-red-400/20 bg-red-400/10 text-red-300"
          : "border-white/10 bg-white/5 text-slate-500"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          listening
            ? "animate-pulse bg-red-400"
            : "bg-slate-500"
        }`}
      />

      {listening ? "Listening" : "Ready"}
    </div>

  </div>

  {/* INPUT BOX */}
  <div className="relative">

    <textarea
      value={text}
      onChange={(e) =>
        setText(e.target.value)
      }
      placeholder={`Type or speak in ${fromLanguage}...`}
      className="min-h-[230px] w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
    />

    {/* INPUT LANGUAGE */}
    <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-400 backdrop-blur">
      🎤 {fromLanguage}
    </div>

  </div>
{/* SESSION CODE */}
{sessionCode && (
  <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">

    <div className="flex items-center justify-between gap-4">

      <div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Live Session
          </p>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Share this code with listeners
        </p>
      </div>

      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-center">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Listeners
        </p>

        <p className="mt-1 text-lg font-bold text-emerald-300">
          👥 {connectedDevices}
        </p>
      </div>

    </div>

    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">

      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Session Code
        </p>

        <p className="mt-1 text-2xl font-black tracking-[0.25em] text-cyan-300">
          {sessionCode}
        </p>
      </div>

      <button
        onClick={() => {
          navigator.clipboard.writeText(sessionCode);
        }}
        className="rounded-xl border border-white/10 bg-white/5 p-3 text-cyan-300 transition hover:bg-cyan-400/10"
        title="Copy Session Code"
      >
        <Copy className="h-5 w-5" />
      </button>

    </div>

    <p className="mt-3 text-xs text-slate-500">
      🔗 Listeners can enter this code on the Listener page.
    </p>

  </div>
)}
  {/* START / STOP */}
  <button
    onClick={async () => {
      if (listening) {
        stopSpeaking();
        return;
      }

      let code = sessionCode;

      if (!code) {
        code = await createRemoteSession();

        if (!code) {
          return;
        }
      }

      const ws = new WebSocket(
        `${WS_URL}?code=${encodeURIComponent(code)}&role=speaker`
      );

      ws.onopen = () => {
        console.log("Speaker WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "listener_count") {
            setConnectedDevices(message.count);
            console.log(
              "Connected devices:",
              message.count
            );
          }
        } catch (error) {
          console.error(
            "WebSocket message error:",
            error
          );
        }
      };

      ws.onclose = () => {
        console.log(
          "Speaker WebSocket disconnected"
        );
      };

      ws.onerror = (error) => {
        console.error(
          "WebSocket error:",
          error
        );
      };

      wsRef.current = ws;

      startSpeaking();
    }}
    className={`mt-4 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 font-semibold transition ${
      listening
        ? "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-400"
        : "bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20"
    }`}
  >
    {listening ? (
      <>
        <MicOff className="h-5 w-5" />
        Stop Speaking
      </>
    ) : (
      <>
        <Mic className="h-5 w-5" />
        Start Speaking
      </>
    )}
  </button>

  {/* LIVE MESSAGE */}
  {listening && (
    <div className="mt-3 flex items-center justify-center gap-2 text-sm text-cyan-300">
      <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
      Keep speaking — VernacAI is listening
    </div>
  )}

  {/* TYPED MESSAGE */}
  {!listening && (
    <button
      onClick={translateTypedText}
      disabled={
        translating || !text.trim()
      }
      className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Send className="h-4 w-4" />
      Translate Typed Message
    </button>
  )}

</div>

         {/* TRANSLATION */}
<div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6">

  {/* HEADER */}
  <div className="mb-4 flex items-center justify-between">

    <div>
      <h3 className="font-semibold">
        AI Translation
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {fromLanguage} → {toLanguage}
      </p>
    </div>

    {/* STATUS */}
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">

      <span
        className={`h-2 w-2 rounded-full ${
          translating
            ? "animate-pulse bg-cyan-400"
            : sent
            ? "bg-emerald-400"
            : "bg-slate-500"
        }`}
      />

      <span className="text-slate-400">
        {translating
          ? "Translating..."
          : sent
          ? "Complete"
          : "Ready"}
      </span>

    </div>

  </div>

  {/* TRANSLATION BOX */}
  <div className="min-h-[230px] rounded-2xl border border-white/10 bg-slate-900/80 p-5">

    {translatedText ? (
      <div>

        <p className="text-xs uppercase tracking-wider text-slate-500">
          Translated Output
        </p>

        <p className="mt-3 text-lg leading-8 text-white">
          {translatedText}
        </p>

      </div>
    ) : (
      <div className="flex min-h-[190px] flex-col items-center justify-center text-center">

        <Languages className="h-9 w-9 text-cyan-400/50" />

        <p className="mt-3 text-sm text-slate-500">
          Translation will appear here
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Speak or type a message to begin
        </p>

      </div>
    )}

    {/* TRANSLATING */}
    {translating && (
      <div className="mt-5 flex items-center gap-2 text-sm text-cyan-300">

        <Loader2 className="h-4 w-4 animate-spin" />

        AI is processing your speech...

      </div>
    )}

    {/* COMPLETE */}
    {!translating && sent && (
      <div className="mt-5 flex items-center gap-2 text-sm text-emerald-300">

        <span>✓</span>

        Translation sent to connected listeners

      </div>
    )}

  </div>

</div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* SUCCESS */}
        {sent && (
          <div className="mt-5 text-center text-emerald-300">
            ✓ Translation sent to listener
          </div>
        )}

        {/* FLOW */}
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">

          <Mic className="h-4 w-4 text-cyan-400" />

          Speak

          <span>→</span>

          <span>1 sec</span>

          <span>→</span>

          <Languages className="h-4 w-4 text-cyan-400" />

          AI Translate

          <span>→</span>

          <Send className="h-4 w-4 text-cyan-400" />

          Listener

        </div>

      </main>
    </div>
  );
}

export default RemoteSpeakerPage;



