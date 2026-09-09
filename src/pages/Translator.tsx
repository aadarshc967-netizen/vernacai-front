
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
  GraduationCap,
  BookOpen,
  Users,
  Radio,
  CheckCircle2,
  Circle,
} from "lucide-react";

const API_URL = `${
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
}/translate`;

const WS_URL = `${(
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`
).replace(/^http/, "ws")}/ws/remote`;

function Translator() {
  // --------------------------------
  // LANGUAGES
  // --------------------------------
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  // --------------------------------
  // CLASSROOM INFORMATION
  // --------------------------------
  const [subject, setSubject] = useState("General");
  const [lessonTopic, setLessonTopic] = useState("");

  // --------------------------------
  // LANGUAGE STATE
  // --------------------------------
  const [fromLanguage, setFromLanguage] = useState("English");
  const [fromSearch, setFromSearch] = useState("");

  const [toLanguage, setToLanguage] = useState("Hindi");
  const [toSearch, setToSearch] = useState("");

  // --------------------------------
  // TRANSLATION STATE
  // --------------------------------
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------
  // SESSION STATE
  // --------------------------------
  const [lessonStarted, setLessonStarted] = useState(false);
  const [translationCount, setTranslationCount] = useState(0);

  // --------------------------------
  // REFS
  // --------------------------------
  const recognitionRef = useRef<any>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const shouldListenRef = useRef(false);
  const finalSpeechRef = useRef("");
  const speechQueueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);
  const lastTranslatedRef = useRef("");

  // --------------------------------
  // LOAD LANGUAGES
  // --------------------------------
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

  // --------------------------------
  // FILTER LANGUAGES
  // --------------------------------
  const filteredFromLanguages = languages.filter((language) =>
    language.name.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToLanguages = languages.filter((language) =>
    language.name.toLowerCase().includes(toSearch.toLowerCase())
  );

  // --------------------------------
  // SPEECH LANGUAGE CODES
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
  // MOBILE REMOTE SPEAKER
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

    socket.onerror = (socketError) => {
      console.error(
        "Mobile speaker WebSocket error:",
        socketError
      );
    };

    return () => {
      socket.close();
    };
  }, []);

  // --------------------------------
  // SPEECH QUEUE
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
    speech.rate = 1.05;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onend = () => {
      speakingRef.current = false;

      setTimeout(() => {
        speakNext();
      }, 500);
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
  // TRANSLATE TEXT USING API
  // --------------------------------
  const translateText = async (text: string) => {
    const cleanText = text.trim();

    if (!cleanText) return;

    // Prevent duplicate translation
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

        // Add translated text
        setTranslatedText((previous) =>
          previous
            ? `${previous} ${translated}`
            : translated
        );

        setTranslationCount((previous) => previous + 1);

        // --------------------------------
        // TEXT TO SPEECH
        // --------------------------------
        const speech = new SpeechSynthesisUtterance(
          translated
        );

        speech.lang = getLanguageCode(toLanguage);
        speech.rate = 1.05;
        speech.pitch = 1;
        speech.volume = 1;

        window.speechSynthesis.speak(speech);

        // --------------------------------
        // REMOTE SPEAKER
        // --------------------------------
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
      setLessonStarted(true);
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

        const transcript =
          result[0].transcript.trim();

        if (!transcript) continue;

        // --------------------------------
        // FINAL SPEECH
        // --------------------------------
        if (result.isFinal) {
          finalSpeechRef.current +=
            (finalSpeechRef.current ? " " : "") +
            transcript;

          setSpokenText(finalSpeechRef.current);

          // Translate completed phrase
          translateText(transcript);
        } else {
          // --------------------------------
          // INTERIM SPEECH
          // --------------------------------
          interimText += transcript + " ";
        }
      }

      // Show live speech
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
  // START CLASSROOM
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

    setTranslationCount(0);
    setLessonStarted(true);

    shouldListenRef.current = true;

    startRecognition();
  };

  // --------------------------------
  // STOP CLASSROOM
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

    speechQueueRef.current = [];

    window.speechSynthesis.cancel();

    speakingRef.current = false;

    setListening(false);
  };

  // --------------------------------
  // END LESSON
  // --------------------------------
  const endLesson = () => {
    stopListening();

    setLessonStarted(false);

    setSpokenText("");
    setTranslatedText("");

    finalSpeechRef.current = "";
    lastTranslatedRef.current = "";

    setTranslationCount(0);
  };

  // --------------------------------
  // MANUAL TRANSLATION SPEECH
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
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">

      <div className="mx-auto max-w-7xl">

        {/* --------------------------------
            BACK BUTTON
        -------------------------------- */}
        <div className="mb-6">
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

        {/* --------------------------------
            HEADER
        -------------------------------- */}
        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
            <GraduationCap className="h-8 w-8 text-cyan-400" />
          </div>

          <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            <Radio className="h-4 w-4" />
            VernacAI Live Classroom
          </div>

          <h1 className="text-4xl font-black sm:text-5xl">
            Learn Without
            <span className="text-cyan-400">
              {" "}Language Barriers
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Teacher speaks naturally. VernacAI converts the lesson
            into the student's preferred vernacular language in real time.
          </p>

        </div>

        {/* --------------------------------
            CLASSROOM SETUP
        -------------------------------- */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/10">
              <BookOpen className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <h2 className="font-bold">
                Classroom Setup
              </h2>

              <p className="text-sm text-slate-500">
                Add basic lesson information before starting.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* SUBJECT */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value)
                }
                disabled={listening}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
              >
                <option className="bg-slate-900">
                  General
                </option>

                <option className="bg-slate-900">
                  Mathematics
                </option>

                <option className="bg-slate-900">
                  Science
                </option>

                <option className="bg-slate-900">
                  Computer Science
                </option>

                <option className="bg-slate-900">
                  Social Science
                </option>

                <option className="bg-slate-900">
                  English
                </option>

                <option className="bg-slate-900">
                  Other
                </option>
              </select>
            </div>

            {/* TOPIC */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-400">
                Lesson Topic
              </label>

              <input
                type="text"
                value={lessonTopic}
                onChange={(e) =>
                  setLessonTopic(e.target.value)
                }
                disabled={listening}
                placeholder="Example: Photosynthesis"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 disabled:opacity-50"
              />
            </div>

          </div>

        </div>

        {/* --------------------------------
            CLASSROOM STATUS
        -------------------------------- */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

            <div className="flex items-center gap-3">

              {listening ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <Circle className="h-5 w-5 text-slate-600" />
              )}

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Classroom
                </p>

                <p className="mt-1 font-semibold">
                  {listening ? "Live" : "Ready"}
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

            <div className="flex items-center gap-3">

              <Languages className="h-5 w-5 text-cyan-400" />

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Student Language
                </p>

                <p className="mt-1 font-semibold">
                  {toLanguage}
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

            <div className="flex items-center gap-3">

              <Users className="h-5 w-5 text-emerald-400" />

              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Translations
                </p>

                <p className="mt-1 font-semibold">
                  {translationCount}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* --------------------------------
            LANGUAGE SELECTOR
        -------------------------------- */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">

          <div className="mb-5 flex items-center gap-3">
            <Languages className="h-5 w-5 text-cyan-400" />

            <div>
              <h2 className="font-bold">
                Language Preferences
              </h2>

              <p className="text-sm text-slate-500">
                Choose the language spoken by the teacher and the
                language preferred by the student.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">

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
                disabled={listening || loadingLanguages}
                className="mb-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
              />

              <select
                value={fromLanguage}
                disabled={listening || loadingLanguages}
                onChange={(e) =>
                  setFromLanguage(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400"
              >
                {loadingLanguages ? (
                  <option className="bg-slate-900">
                    Loading languages...
                  </option>
                ) : (
                  filteredFromLanguages.map(
                    (language) => (
                      <option
                        key={language.code}
                        value={language.name}
                        className="bg-slate-900"
                      >
                        {language.name}
                      </option>
                    )
                  )
                )}
              </select>

            </div>

            {/* ARROW */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
              <ArrowDown className="h-5 w-5 text-cyan-400 md:rotate-[-90deg]" />
            </div>

            {/* TO */}
            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Student Preferred Language
              </label>

              <input
                type="text"
                placeholder="Search language..."
                value={toSearch}
                onChange={(e) =>
                  setToSearch(e.target.value)
                }
                disabled={listening || loadingLanguages}
                className="mb-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-cyan-400"
              />

              <select
                value={toLanguage}
                disabled={listening || loadingLanguages}
                onChange={(e) =>
                  setToLanguage(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400"
              >
                {loadingLanguages ? (
                  <option className="bg-slate-900">
                    Loading languages...
                  </option>
                ) : (
                  filteredToLanguages.map(
                    (language) => (
                      <option
                        key={language.code}
                        value={language.name}
                        className="bg-slate-900"
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

        {/* --------------------------------
            TRANSLATION AREA
        -------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* TEACHER SPEECH */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-cyan-400" />

                  <p className="text-sm text-slate-500">
                    Teacher's Lesson
                  </p>
                </div>

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

            <div className="min-h-[300px] rounded-2xl border border-white/10 bg-slate-900/70 p-6">

              {spokenText ? (
                <p className="text-xl leading-8 text-slate-200">
                  {spokenText}
                </p>
              ) : (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

                  <Mic className="mb-4 h-10 w-10 text-slate-700" />

                  <p className="text-slate-600">
                    Teacher's speech will appear here...
                  </p>

                </div>
              )}

              {listening && (
                <div className="mt-8 flex items-center gap-2 text-sm text-red-400">

                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

                  Listening to the lesson...

                </div>
              )}

            </div>

          </div>

          {/* STUDENT TRANSLATION */}
          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6 backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <Sparkles className="h-4 w-4 text-cyan-400" />

                  <p className="text-sm text-slate-500">
                    VernacAI Translation
                  </p>

                </div>

                <h2 className="mt-1 text-xl font-bold">
                  {toLanguage}
                </h2>

              </div>

              <button
                onClick={speakTranslation}
                disabled={!translatedText.trim() || translating}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-30"
                title="Listen to translation"
              >
                <Volume2 className="h-5 w-5" />
              </button>

            </div>

            <div className="min-h-[300px] rounded-2xl border border-cyan-400/10 bg-slate-900/70 p-6">

              {translatedText ? (
                <p className="text-xl leading-8 text-white">
                  {translatedText}
                </p>
              ) : (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

                  <Languages className="mb-4 h-10 w-10 text-cyan-400/20" />

                  <p className="text-slate-600">
                    Vernacular translation will appear here...
                  </p>

                </div>
              )}

              {translating && (
                <div className="mt-8 flex items-center gap-2 text-sm text-cyan-400">

                  <Loader2 className="h-4 w-4 animate-spin" />

                  VernacAI is translating the lesson...

                </div>
              )}

            </div>

          </div>

        </div>

        {/* --------------------------------
            MAIN MICROPHONE BUTTON
        -------------------------------- */}
        <div className="mt-10 flex flex-col items-center">

          <button
            onClick={
              listening
                ? stopListening
                : startListening
            }
            disabled={loadingLanguages}
            className={`flex h-24 w-24 items-center justify-center rounded-full transition duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
              listening
                ? "bg-red-500 shadow-2xl shadow-red-500/30 hover:bg-red-400"
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
              ? "Stop Classroom"
              : "Start Live Classroom"}
          </p>

          <p className="mt-2 text-center text-sm text-slate-500">
            {listening
              ? "Teacher can keep speaking — translation is automatic"
              : "Tap once to begin the live lesson"}
          </p>

        </div>

        {/* --------------------------------
            END LESSON
        -------------------------------- */}
        {lessonStarted && !listening && (
          <div className="mt-6 flex justify-center">

            <button
              onClick={endLesson}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Reset Classroom
            </button>

          </div>
        )}

        {/* --------------------------------
            ERROR
        -------------------------------- */}
        {error && (
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {/* --------------------------------
            LIVE FLOW
        -------------------------------- */}
        <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03] p-5">

          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-300">
            <GraduationCap className="h-4 w-4 text-cyan-400" />
            Live Classroom Flow
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">

            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">
              <Mic className="h-4 w-4 text-cyan-400" />
              Teacher Speech
            </div>

            <span>→</span>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              AI Processing
            </div>

            <span>→</span>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">
              <Languages className="h-4 w-4 text-cyan-400" />
              {toLanguage}
            </div>

            <span>→</span>

            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              Student Audio
            </div>

          </div>

        </div>

        {/* --------------------------------
            LESSON INFO
        -------------------------------- */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <BookOpen className="h-5 w-5 text-violet-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">
              Subject
            </p>

            <p className="mt-1 font-semibold">
              {subject}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <GraduationCap className="h-5 w-5 text-cyan-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">
              Lesson
            </p>

            <p className="mt-1 font-semibold">
              {lessonTopic || "Not specified"}
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

            <Users className="h-5 w-5 text-emerald-400" />

            <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">
              Classroom Mode
            </p>

            <p className="mt-1 font-semibold">
              Real-Time Translation
            </p>

          </div>

        </div>

        {/* --------------------------------
            FOOTER
        -------------------------------- */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center">

          <div className="flex items-center justify-center gap-2 text-slate-400">

            <GlobeIcon />

            <span className="font-semibold">
              VernacAI
            </span>

          </div>

          <p className="mt-2 text-xs text-slate-600">
            Real-time vernacular classroom assistant
          </p>

        </div>

      </div>

    </div>
  );
}

// --------------------------------
// SIMPLE FOOTER ICON
// --------------------------------
function GlobeIcon() {
  return (
    <Languages className="h-5 w-5 text-cyan-300" />
  );
}

export default Translator;

