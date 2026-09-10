import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Languages,
  Mic,
  MicOff,
  Volume2,
  Loader2,
} from "lucide-react";
import { fetchLanguages, type Language } from "../data/languages";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

  return speechCodes[name] || "en-IN";
};

export default function Listening() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  const [fromLanguage, setFromLanguage] = useState("English");
  const [toLanguage, setToLanguage] = useState("Hindi");

  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  const recognitionRef = useRef<any>(null);

  // Load languages
  useEffect(() => {
    const loadLanguages = async () => {
      setLoadingLanguages(true);

      const data = await fetchLanguages();

      setLanguages(data);
      setLoadingLanguages(false);

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

  const filteredFromLanguages = languages.filter((language) =>
    language.name
      .toLowerCase()
      .includes(fromSearch.toLowerCase())
  );

  const filteredToLanguages = languages.filter((language) =>
    language.name
      .toLowerCase()
      .includes(toSearch.toLowerCase())
  );

  // Translate text
  const translateText = async (text: string) => {
    if (!text.trim()) return;

    setIsTranslating(true);

    try {
      const response = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          source_language: fromLanguage,
          target_language: toLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();

      const result =
        data.translated_text ||
        data.translation ||
        data.text ||
        "";

      setTranslatedText(result);

      // Speak translated result
      if (result && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        const speech = new SpeechSynthesisUtterance(result);
        speech.lang = getLanguageCode(toLanguage);
        speech.rate = 0.95;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText(
        "Translation failed. Please try again."
      );
    } finally {
      setIsTranslating(false);
    }
  };

  // Start listening
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    setOriginalText("");
    setTranslatedText("");

    const recognition = new SpeechRecognition();

    recognition.lang = getLanguageCode(fromLanguage);
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event: any) => {
      let text = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        if (event.results[i].isFinal) {
          text += event.results[i][0].transcript + " ";
        }
      }

      text = text.trim();

      if (!text) return;

      setOriginalText((previous) =>
        previous ? `${previous} ${text}` : text
      );

      await translateText(text);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    window.speechSynthesis.cancel();
    setIsListening(false);
  };

  const handleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-white">
      {/* HEADER */}
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => {
            stopListening();
            window.location.href = "/";
          }}
          className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-300 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Listening Practice
          </h1>

          <p className="mt-3 text-slate-400">
            Listen to a lesson in your preferred language.
          </p>
        </div>

        {/* LANGUAGE SELECTOR */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-5 flex items-center gap-3">
            <Languages className="h-5 w-5 text-cyan-400" />

            <div>
              <h2 className="font-bold">
                Language Preferences
              </h2>

              <p className="text-sm text-slate-500">
                Select the language being spoken and the
                language you want to hear.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* FROM */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Teacher Speaking Language
              </label>

              <input
                type="text"
                placeholder="Search language..."
                value={fromSearch}
                onChange={(e) =>
                  setFromSearch(e.target.value)
                }
                disabled={
                  isListening || loadingLanguages
                }
                className="mb-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              />

              <select
                value={fromLanguage}
                disabled={
                  isListening || loadingLanguages
                }
                onChange={(e) =>
                  setFromLanguage(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400"
              >
                {loadingLanguages ? (
                  <option>
                    Loading languages...
                  </option>
                ) : (
                  filteredFromLanguages.map(
                    (language) => (
                      <option
                        key={language.code}
                        value={language.name}
                      >
                        {language.name}
                      </option>
                    )
                  )
                )}
              </select>
            </div>

            {/* TO */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Listen / Translate To
              </label>

              <input
                type="text"
                placeholder="Search language..."
                value={toSearch}
                onChange={(e) =>
                  setToSearch(e.target.value)
                }
                disabled={
                  isListening || loadingLanguages
                }
                className="mb-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              />

              <select
                value={toLanguage}
                disabled={
                  isListening || loadingLanguages
                }
                onChange={(e) =>
                  setToLanguage(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400"
              >
                {loadingLanguages ? (
                  <option>
                    Loading languages...
                  </option>
                ) : (
                  filteredToLanguages.map(
                    (language) => (
                      <option
                        key={language.code}
                        value={language.name}
                      >
                        {language.name}
                      </option>
                    )
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* LISTENING CONTROL */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10">
            {isListening ? (
              <Mic className="h-10 w-10 text-cyan-400" />
            ) : (
              <Volume2 className="h-10 w-10 text-cyan-400" />
            )}
          </div>

          <h2 className="mt-6 text-2xl font-bold">
            {isListening
              ? "Listening..."
              : "Listening Mode"}
          </h2>

          <p className="mt-3 text-slate-400">
            {isListening
              ? `Listening to ${fromLanguage} and translating to ${toLanguage}`
              : "Start listening to translate the lesson."}
          </p>

          <button
            onClick={handleListening}
            disabled={loadingLanguages}
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Start Listening
              </>
            )}
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* ORIGINAL */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm text-slate-500">
              Teacher Speech
            </p>

            <h3 className="mt-2 text-xl font-bold">
              {fromLanguage}
            </h3>

            <div className="mt-5 min-h-[180px] rounded-2xl bg-black/20 p-5">
              {originalText ? (
                <p className="text-lg leading-8 text-slate-200">
                  {originalText}
                </p>
              ) : (
                <p className="text-slate-600">
                  Teacher speech will appear here...
                </p>
              )}
            </div>
          </div>

          {/* TRANSLATED */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Translated & Audio
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  {toLanguage}
                </h3>
              </div>

              {isTranslating && (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              )}
            </div>

            <div className="mt-5 min-h-[180px] rounded-2xl bg-black/20 p-5">
              {translatedText ? (
                <p className="text-lg leading-8 text-cyan-100">
                  {translatedText}
                </p>
              ) : (
                <p className="text-slate-600">
                  Translation will appear here...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}