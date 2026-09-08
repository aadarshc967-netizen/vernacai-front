import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { fetchLanguages, type Language } from "../data/languages";

export default function CommunicateRoom() {
  const [code, setCode] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [fromLanguage, setFromLanguage] = useState("English");
  const [toLanguage, setToLanguage] = useState("Hindi");
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [spokenText, setSpokenText] = useState("");
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [listening, setListening] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);

  // -----------------------------
  // LOAD LANGUAGES
  // -----------------------------

  useEffect(() => {
    const loadLanguages = async () => {
      setLoadingLanguages(true);

      const data = await fetchLanguages();

      setLanguages(data);

      if (data.some((lang) => lang.name === "English")) {
        setFromLanguage("English");
      }

      if (data.some((lang) => lang.name === "Hindi")) {
        setToLanguage("Hindi");
      }

      setLoadingLanguages(false);
    };

    loadLanguages();
  }, []);

  // -----------------------------
  // UPDATE LISTENING LANGUAGE
  // -----------------------------

  useEffect(() => {
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: "set_listen_language",
          language: toLanguage,
        })
      );

      console.log(
        "Listening language changed to:",
        toLanguage
      );
    }
  }, [toLanguage]);

  // -----------------------------
  // WEBSOCKET CONNECTION
  // -----------------------------

  useEffect(() => {
    const savedCode =
      sessionStorage.getItem("communicate_code");

    if (!savedCode) {
      window.location.href = "/communicate";
      return;
    }

    setCode(savedCode);

    const ws = new WebSocket(
      `ws://${window.location.hostname}:8000/ws/communicate?code=${encodeURIComponent(
        savedCode
      )}`
    );

    wsRef.current = ws;

    // -----------------------------
    // WEBSOCKET OPEN
    // -----------------------------

    ws.onopen = () => {
      console.log(
        "Communication WebSocket connected"
      );

      setConnected(true);

      ws.send(
        JSON.stringify({
          type: "set_listen_language",
          language: toLanguage,
        })
      );

      console.log(
        "Initial listening language:",
        toLanguage
      );
    };

    // -----------------------------
    // WEBSOCKET MESSAGE
    // -----------------------------

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log(
          "WebSocket message received:",
          data
        );

        // PARTICIPANT COUNT
        if (data.type === "participant_count") {
          setParticipants(data.count);

          console.log(
            "Participants:",
            data.count
          );
        }

        // TRANSLATION RECEIVED
        if (data.type === "translation") {
          const translatedText =
            data.text?.trim();

          if (!translatedText) {
            return;
          }

          console.log(
            "Received translation:",
            translatedText
          );

          console.log(
            "Translation language:",
            data.language
          );

          setSpokenText(translatedText);

          // -----------------------------
          // TEXT TO SPEECH
          // -----------------------------

          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();

            const speech =
              new SpeechSynthesisUtterance(
                translatedText
              );

            speech.lang =
              getSpeechLanguageCode(
                data.language
              );

            speech.rate = 1;
            speech.pitch = 1;
            speech.volume = 1;

            speech.onstart = () => {
              console.log(
                "Speaking received translation..."
              );
            };

            speech.onend = () => {
              console.log(
                "Finished speaking translation."
              );
            };

            speech.onerror = (error) => {
              console.error(
                "Speech synthesis error:",
                error
              );
            };

            window.speechSynthesis.speak(
              speech
            );
          } else {
            console.log(
              "Speech synthesis is not supported."
            );
          }
        }

        // SERVER ERROR
        if (data.type === "error") {
          console.error(
            "Communication error:",
            data.message
          );

          alert(data.message);

          window.location.href =
            "/communicate";
        }
      } catch (error) {
        console.error(
          "WebSocket message error:",
          error
        );
      }
    };

    // -----------------------------
    // WEBSOCKET CLOSE
    // -----------------------------

    ws.onclose = () => {
      console.log(
        "Communication WebSocket disconnected"
      );

      setConnected(false);
    };

    // -----------------------------
    // WEBSOCKET ERROR
    // -----------------------------

    ws.onerror = (error) => {
      console.error(
        "Communication WebSocket error:",
        error
      );
    };

    // -----------------------------
    // CLEANUP
    // -----------------------------

    return () => {
      ws.close();
    };
  }, []);

  // -----------------------------
  // SPEECH LANGUAGE CODE
  // -----------------------------

  const getSpeechLanguageCode = (
    language: string
  ) => {
    const speechCodes: Record<
      string,
      string
    > = {
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
    };

    return (
      speechCodes[language] ||
      "en-IN"
    );
  };

  // -----------------------------
  // SEND SPEECH TO ROOM
  // -----------------------------

  const sendSpeechToRoom = (
    text: string
  ) => {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    if (
      wsRef.current &&
      wsRef.current.readyState ===
        WebSocket.OPEN
    ) {
      console.log(
        "Sending speech to room:",
        cleanText
      );

      wsRef.current.send(
        JSON.stringify({
          type: "translation",
          text: cleanText,
          source_language: fromLanguage,
        })
      );
    } else {
      console.error(
        "Communication WebSocket is not connected."
      );
    }
  };

  // -----------------------------
  // START LISTENING
  // -----------------------------

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    // CHECK SPEECH RECOGNITION
    if (!SpeechRecognition) {
      alert(
        "Speech Recognition is not supported in this browser. Please use Google Chrome."
      );

      return;
    }

    console.log(
      "Speech Recognition AVAILABLE"
    );

    // CREATE RECOGNITION
    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.lang =
      getSpeechLanguageCode(
        fromLanguage
      );

    // -----------------------------
    // RECOGNITION START
    // -----------------------------

    recognition.onstart = () => {
      console.log(
        "Mobile microphone started."
      );

      setListening(true);
    };

    // -----------------------------
    // SPEECH RESULT
    // -----------------------------

    recognition.onresult = (
      event: any
    ) => {
      const lastResult =
        event.results[
          event.results.length - 1
        ];

      const text =
        lastResult[0].transcript.trim();

      if (!text) {
        return;
      }

      console.log(
        "You said:",
        text
      );

      setSpokenText(text);

      // SEND SPEECH TO OTHER PARTICIPANTS
      sendSpeechToRoom(text);
    };

    // -----------------------------
    // SPEECH ERROR
    // -----------------------------

    recognition.onerror = (
      event: any
    ) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      if (
        event.error ===
        "not-allowed"
      ) {
        alert(
          "Microphone permission was denied. Please allow microphone access in Chrome."
        );

        setListening(false);
      }

      if (
        event.error ===
        "audio-capture"
      ) {
        alert(
          "Microphone could not be accessed. Please check your phone microphone."
        );

        setListening(false);
      }

      if (
        event.error ===
        "network"
      ) {
        alert(
          "Speech recognition network error. Please check your internet connection."
        );

        setListening(false);
      }

      if (
        event.error ===
        "no-speech"
      ) {
        console.log(
          "No speech detected."
        );
      }
    };

    // -----------------------------
    // RECOGNITION END
    // -----------------------------

    recognition.onend = () => {
      console.log(
        "Speech recognition ended."
      );

      setListening(false);
    };

    // SAVE INSTANCE
    recognitionRef.current =
      recognition;

    // -----------------------------
    // START MICROPHONE
    // -----------------------------

    console.log(
      "Starting microphone..."
    );

    try {
      recognition.start();

      console.log(
        "Microphone start command sent."
      );
    } catch (error) {
      console.error(
        "Could not start speech recognition:",
        error
      );

      setListening(false);
    }
  };

  // -----------------------------
  // STOP LISTENING
  // -----------------------------

  const stopListening = () => {
    if (
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Recognition already stopped."
        );
      }

      recognitionRef.current =
        null;
    }

    setListening(false);
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">

        {/* LEAVE ROOM */}

        <button
          onClick={() => {
            if (wsRef.current) {
              wsRef.current.close();
            }

            if (
              recognitionRef.current
            ) {
              try {
                recognitionRef.current.stop();
              } catch {}
            }

            sessionStorage.removeItem(
              "communicate_code"
            );

            window.location.href =
              "/communicate";
          }}
          className="mb-10 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
        >
          ← Leave Room
        </button>

        {/* MAIN CARD */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

          {/* TITLE */}

          <div className="text-center">

            <h1 className="text-4xl font-black">
              Communication Room
            </h1>

            <p className="mt-3 text-slate-400">
              Share this code with the
              people you want to
              communicate with.
            </p>

            {/* SESSION CODE */}

            <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

              <p className="text-sm text-slate-400">
                Session Code
              </p>

              <p className="mt-2 text-4xl font-black tracking-widest text-cyan-300">
                {code}
              </p>

            </div>

            {/* LANGUAGE SELECTORS */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              {/* YOUR LANGUAGE */}

              <div>

                <label className="mb-2 block text-left text-sm font-semibold text-slate-300">
                  Your Language
                </label>

                <select
                  value={fromLanguage}
                  onChange={(e) =>
                    setFromLanguage(
                      e.target.value
                    )
                  }
                  disabled={
                    loadingLanguages
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >

                  {languages.map(
                    (language) => (
                      <option
                        key={
                          language.code
                        }
                        value={
                          language.name
                        }
                      >
                        {language.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* LISTEN LANGUAGE */}

              <div>

                <label className="mb-2 block text-left text-sm font-semibold text-slate-300">
                  Listen In
                </label>

                <select
                  value={toLanguage}
                  onChange={(e) =>
                    setToLanguage(
                      e.target.value
                    )
                  }
                  disabled={
                    loadingLanguages
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >

                  {languages.map(
                    (language) => (
                      <option
                        key={
                          language.code
                        }
                        value={
                          language.name
                        }
                      >
                        {language.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* CONNECTION */}

            <div className="mt-8">

              <div className="text-lg font-semibold">
                {participants}{" "}
                {participants === 1
                  ? "participant"
                  : "participants"}
              </div>

              <div className="mt-2 text-sm">

                {connected ? (
                  <span className="text-emerald-400">
                    ● Connected
                  </span>
                ) : (
                  <span className="text-red-400">
                    ● Disconnected
                  </span>
                )}

              </div>

              {/* MICROPHONE BUTTON */}

              <button
                onClick={() => {
                  if (listening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`mt-8 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-bold transition ${
                  listening
                    ? "border border-red-400/30 bg-red-500/20 text-red-300"
                    : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                }`}
              >

                {listening ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Start Speaking
                  </>
                )}

              </button>

              {/* SPOKEN TEXT */}

              {spokenText && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-left">

                  <p className="text-sm text-slate-400">
                    You said
                  </p>

                  <p className="mt-2 text-lg text-white">
                    {spokenText}
                  </p>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}