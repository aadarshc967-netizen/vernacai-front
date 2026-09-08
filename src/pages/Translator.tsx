import { fetchLanguages, type Language } from "../data/languages";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  Languages,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Loader2,
} from "lucide-react";



const API_URL = "http://127.0.0.1:8000/translate";
const WS_URL = `ws://${window.location.hostname}:8000/ws/remote`;


function Translator() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
    // Load all languages from VernacAI API
  useEffect(() => {
    const loadLanguages = async () => {
      setLoadingLanguages(true);

      const data = await fetchLanguages();

      setLanguages(data);
      setLoadingLanguages(false);

      // Default languages
      if (data.length > 0) {
        const english = data.find(
          (language) => language.name === "English"
        );

        const hindi = data.find(
          (language) => language.name === "Hindi"
        );

        if (english) {
          setFromLanguage(english.name);
        }

        if (hindi) {
          setToLanguage(hindi.name);
        }
      }
    };

    loadLanguages();
  }, []);
  const [fromLanguage, setFromLanguage] = useState("English");
  const [fromSearch, setFromSearch] = useState("");
  const [toLanguage, setToLanguage] = useState("Hindi");
  const [toSearch, setToSearch] = useState("");

  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const shouldListenRef = useRef(false);
  const finalSpeechRef = useRef("");
  const speechQueueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);
  const lastTranslatedRef = useRef("");
  const filteredFromLanguages = languages.filter((language) =>
  language.name.toLowerCase().includes(fromSearch.toLowerCase())
  
);
const filteredToLanguages = languages.filter((language) =>
  language.name.toLowerCase().includes(toSearch.toLowerCase())
);

  // --------------------------------
  // GET LANGUAGE CODE
  // --------------------------------
  const getLanguageCode = (name: string) => {
  const speechCodes: Record<string, string> = {
    English: "en-IN",
    Hindi: "hi-IN",
    Nepali: "ne-NP",
    Tamil: "ta-IN",
    Telugu: "te-IN",
    Kannada: "kn-IN",
    Malayalam: "ml-IN",
    Bengali: "bn-IN",
    Assamese: "as-IN",
    Marathi: "mr-IN",
    Gujarati: "gu-IN",
    Punjabi: "pa-IN",
    Odia: "or-IN",
    Urdu: "ur-IN",
    Sanskrit: "sa-IN",
    Chinese: "zh-CN",
    "Chinese (Simplified)": "zh-CN",
    "Chinese (Traditional)": "zh-TW",
    Japanese: "ja-JP",
    Korean: "ko-KR",
    Thai: "th-TH",
    Vietnamese: "vi-VN",
    Indonesian: "id-ID",
    Malay: "ms-MY",
    French: "fr-FR",
    German: "de-DE",
    Spanish: "es-ES",
    Portuguese: "pt-PT",
    Italian: "it-IT",
    Dutch: "nl-NL",
    Russian: "ru-RU",
    Ukrainian: "uk-UA",
    Turkish: "tr-TR",
    Arabic: "ar-SA",
    Persian: "fa-IR",
    Hebrew: "he-IL",
    Swahili: "sw-KE",
  };

  return speechCodes[name] || "";
};
// --------------------------------
// CONNECT TO MOBILE REMOTE SPEAKER
// --------------------------------
useEffect(() => {
  const socket = new WebSocket(WS_URL);

  socketRef.current = socket;

  socket.onopen = () => {
    console.log("VernacAI mobile speaker connected");
  };

  socket.onclose = () => {
    console.log("Mobile speaker disconnected");
  };

  socket.onerror = (error) => {
    console.error("Mobile speaker WebSocket error:", error);
  };

  return () => {
    socket.close();
  };
}, []); 
  // --------------------------------
  // SPEAK TRANSLATION QUEUE
  // --------------------------------
  const speakNext = () => {
    if (speakingRef.current) return;

    const nextText = speechQueueRef.current.shift();

    if (!nextText) {
      return;
    }

    speakingRef.current = true;

    const speech = new SpeechSynthesisUtterance(nextText);

    speech.lang = getLanguageCode(toLanguage);

    // Slightly faster for live translation
    speech.rate = 1.05;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onend = () => {
      speakingRef.current = false;

      // Small gap between translated sentences
      setTimeout(() => {
        speakNext();
      }, 700);
    };

    speech.onerror = () => {
      speakingRef.current = false;

      setTimeout(() => {
        speakNext();
      }, 300);
    };

    window.speechSynthesis.speak(speech);
  };

  // --------------------------------
  // REAL API TRANSLATION
  // --------------------------------
  const translateText = async (text: string) => {
    const cleanText = text.trim();

    if (!cleanText) return;

    // Avoid translating exactly the same chunk twice
    if (cleanText === lastTranslatedRef.current) {
      return;
    }

    lastTranslatedRef.current = cleanText;

    setTranslating(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
          source_language: fromLanguage,
          target_language: toLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.translated_text) {
        const translated = data.translated_text.trim();

        // Add translated text to screen
        setTranslatedText((previous) =>
          previous ? `${previous} ${translated}` : translated
        );
        // Automatically speak translated text
const speech = new SpeechSynthesisUtterance(translated);

speech.lang = getLanguageCode(toLanguage);
speech.rate = 1.05;
speech.pitch = 1;
speech.volume = 1;

window.speechSynthesis.speak(speech);

        // Add translation to voice queue
       // Send translated text to mobile remote speaker
if (
  socketRef.current &&
  socketRef.current.readyState === WebSocket.OPEN
) {
  socketRef.current.send(
    JSON.stringify({
      type: "translation",
      text: translated,
      language: toLanguage,
    })
  );
}
      } else {
        setError(
          "Translation response mein translated_text nahi mila."
        );
      }
    } catch (err) {
      console.error("Translation error:", err);

      setError(
        "Translation API se connection nahi ho pa raha. Check karo ki FastAPI server running hai."
      );
    } finally {
      setTranslating(false);
    }
  };

  // --------------------------------
  // START SPEECH RECOGNITION
  // --------------------------------
  const startRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech Recognition supported nahi hai. Google Chrome use karo."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = getLanguageCode(fromLanguage);

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // --------------------------------
    // RECOGNITION START
    // --------------------------------
    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    // --------------------------------
    // SPEECH RESULT
    // --------------------------------
    recognition.onresult = (event: any) => {
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const result = event.results[i];

        const transcript = result[0].transcript.trim();

        if (!transcript) continue;

        // --------------------------------
        // FINAL MEANINGFUL CHUNK
        // --------------------------------
        if (result.isFinal) {
          finalSpeechRef.current +=
            (finalSpeechRef.current ? " " : "") + transcript;

          setSpokenText(finalSpeechRef.current);

          // Send meaningful completed phrase to API
          translateText(transcript);
        } else {
          // --------------------------------
          // LIVE INTERIM SPEECH
          // --------------------------------
          interimText += transcript + " ";
        }
      }

      // Show speech while user is still talking
      if (interimText.trim()) {
        setSpokenText(
          `${finalSpeechRef.current} ${interimText.trim()}`.trim()
        );
      }
    };

    // --------------------------------
    // SPEECH ERROR
    // --------------------------------
    recognition.onerror = (event: any) => {
      console.log(
        "Speech recognition error:",
        event.error
      );

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission allow karo."
        );

        shouldListenRef.current = false;
        setListening(false);
      }

      if (event.error === "audio-capture") {
        setError(
          "Microphone detect nahi ho raha. Check karo microphone connected hai."
        );
      }
    };

    // --------------------------------
    // AUTO RESTART
    // --------------------------------
    recognition.onend = () => {
      if (!shouldListenRef.current) {
        setListening(false);
        return;
      }

      // Create a fresh recognition session
      // instead of restarting the old one
      setTimeout(() => {
        if (!shouldListenRef.current) return;

        startRecognition();
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
  };

  // --------------------------------
  // START LISTENING
  // --------------------------------
  const startListening = () => {
    setSpokenText("");
    setTranslatedText("");
    setError("");

    finalSpeechRef.current = "";
    lastTranslatedRef.current = "";

    speechQueueRef.current = [];

    window.speechSynthesis.cancel();

    speakingRef.current = false;

    shouldListenRef.current = true;

    startRecognition();
  };

  // --------------------------------
  // STOP LISTENING
  // --------------------------------
  const stopListening = () => {
    shouldListenRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Recognition stop:",
          error
        );
      }

      recognitionRef.current = null;
    }

    // Stop any queued voice
    speechQueueRef.current = [];

    window.speechSynthesis.cancel();

    speakingRef.current = false;

    setListening(false);
  };

  // --------------------------------
  // MANUAL TEXT TO SPEECH
  // --------------------------------
  const speakTranslation = () => {
    if (!translatedText.trim()) return;

    window.speechSynthesis.cancel();

    speechQueueRef.current = [];

    speakingRef.current = false;

    const speech =
      new SpeechSynthesisUtterance(
        translatedText
      );

    speech.lang =
      getLanguageCode(toLanguage);

    speech.rate = 1.05;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.speak(speech);
  };

  // --------------------------------
  // UI
  // --------------------------------
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-6 flex justify-start">
  <button
    onClick={() => {
      window.location.href = "/";
    }}
    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
  >
    <ArrowLeft className="h-4 w-4" />
    Back to Home
  </button>
</div>
        <div className="mb-10 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10">
            <Languages className="h-7 w-7 text-cyan-400" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            VernacAI Live
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Real-Time Speech Translation
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Speak continuously. VernacAI automatically
            converts your speech into your preferred
            language.
          </p>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">

          {/* FROM LANGUAGE */}
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Speaking Language
            </label>
            <input
              type="text"
              placeholder="Search language..."
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
              disabled={listening || loadingLanguages}
            />
            <select
              value={fromLanguage}
              disabled={listening}
              onChange={(e) =>
                setFromLanguage(e.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-cyan-400"
            >
              {filteredFromLanguages.map((language) => (
                <option
                  key={language.name}
                  value={language.name}
                  className="bg-slate-900"
                >
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          {/* ARROW */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
            <ArrowDown className="h-5 w-5 text-cyan-400 md:rotate-[-90deg]" />
          </div>

          {/* TO LANGUAGE */}
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Translate To
            </label>
          <input
            type="text"
            placeholder="Search language..."
            value={toSearch}
            onChange={(e) => setToSearch(e.target.value)}
            disabled={listening || loadingLanguages}
            />
            <select
              value={toLanguage}
              disabled={listening || loadingLanguages}
              onChange={(e) =>
                setToLanguage(e.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none focus:border-cyan-400"
            >
              {loadingLanguages ? (
  <option className="bg-slate-900">
    Loading languages...
  </option>
) : (
  filteredToLanguages.map((language) => (
    <option
      key={language.code}
      value={language.name}
      className="bg-slate-900"
    >
      {language.name}
    </option>
  ))
)}
            </select>
          </div>
        </div>

        {/* TRANSLATION BOXES */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* SPOKEN TEXT */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Live Speech
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {fromLanguage}
                </h2>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  listening
                    ? "bg-red-400/10 text-red-400"
                    : "bg-cyan-400/10 text-cyan-400"
                }`}
              >
                <Mic
                  className={`h-5 w-5 ${
                    listening
                      ? "animate-pulse"
                      : ""
                  }`}
                />
              </div>
            </div>

            <div className="min-h-[250px] rounded-2xl border border-white/10 bg-slate-900/70 p-6">

              {spokenText ? (
                <p className="text-xl leading-8 text-slate-200">
                  {spokenText}
                </p>
              ) : (
                <p className="text-slate-600">
                  Start speaking and your words
                  will appear here...
                </p>
              )}

              {listening && (
                <div className="mt-8 flex items-center gap-2 text-sm text-red-400">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

                  Listening continuously...
                </div>
              )}
            </div>
          </div>

          {/* TRANSLATED TEXT */}
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6 backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Automatic AI Translation
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {toLanguage}
                </h2>
              </div>

              <button
                onClick={speakTranslation}
                disabled={listening || loadingLanguages}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-[250px] rounded-2xl border border-cyan-400/10 bg-slate-900/70 p-6">

              {translatedText ? (
                <p className="text-xl leading-8 text-white">
                  {translatedText}
                </p>
              ) : (
                <p className="text-slate-600">
                  Translation will appear automatically...
                </p>
              )}

              {translating && (
                <div className="mt-8 flex items-center gap-2 text-sm text-cyan-400">

                  <Loader2 className="h-4 w-4 animate-spin" />

                  Translating...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MICROPHONE BUTTON */}
        <div className="mt-10 flex flex-col items-center">

          <button
            onClick={
              listening
                ? stopListening
                : startListening
            }
            className={`flex h-24 w-24 items-center justify-center rounded-full transition duration-300 ${
              listening
                ? "bg-red-500 shadow-2xl shadow-red-500/30"
                : "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-cyan-500/30 hover:scale-110"
            }`}
          >
            {listening ? (
              <MicOff className="h-9 w-9" />
            ) : (
              <Mic className="h-9 w-9" />
            )}
          </button>

          <p className="mt-5 font-semibold">
            {listening
              ? "Stop Listening"
              : "Start Speaking"}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {listening
              ? "Keep speaking — translation is automatic"
              : "Tap once and start speaking"}
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* FLOW */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">

          <Mic className="h-4 w-4 text-cyan-400" />

          Speech

          <span>→</span>

          <Sparkles className="h-4 w-4 text-cyan-400" />

          AI

          <span>→</span>

          Languages

          <span>→</span>

          <Volume2 className="h-4 w-4 text-cyan-400" />

          Voice
        </div>
      </div>
    </div>
  );
}

export default Translator;