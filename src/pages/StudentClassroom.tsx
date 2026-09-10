import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Languages, Users, Volume2 } from "lucide-react";
import { fetchLanguages, type Language } from "../data/languages";

export default function StudentClassroom() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [roomCode, setRoomCode] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("Hindi");
  const [isJoined, setIsJoined] = useState(false);
  
  const [lessonText, setLessonText] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const loadLanguages = async () => {
      const data = await fetchLanguages();
      setLanguages(data);

      const hindi = data.find(
        (language) => language.name === "Hindi"
      );

      if (hindi) {
        setPreferredLanguage(hindi.name);
      }
    };

    loadLanguages();
  }, []);

  const joinClassroom = () => {
    if (!roomCode.trim()) {
  alert("Please enter the classroom code.");
  return;
}


  const apiUrl = "http://127.0.0.1:8000";

const wsUrl = apiUrl
  .replace("https://", "wss://")
  .replace("http://", "ws://");

const socket = new WebSocket(
  `${wsUrl}/ws/classroom/${roomCode.trim()}`
);

socket.onopen = () => {
  console.log("Connected to classroom:", roomCode);

  socket.send(
    JSON.stringify({
      type: "student_join",
      language: preferredLanguage,
    })
  );

  setIsJoined(true);
  setLessonText(
    "You are now connected to the classroom. Waiting for the teacher..."
  );
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "lesson") {
    setLessonText(message.text || "");
  }
};

socket.onerror = (error) => {
  console.error("Classroom WebSocket error:", error);
  alert("Could not connect to the classroom.");
};

socket.onclose = () => {
  console.log("Classroom connection closed.");
};

socketRef.current = socket;
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mx-auto max-w-5xl">

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-300 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Join Live Classroom
          </h1>

          <p className="mt-3 text-slate-400">
            Listen to your teacher in your preferred language.
          </p>
        </div>

        {!isJoined ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">

            <div className="mb-8 flex items-center gap-3">
              <Users className="h-6 w-6 text-cyan-400" />

              <div>
                <h2 className="text-xl font-bold">
                  Classroom Details
                </h2>

                <p className="text-sm text-slate-500">
                  Enter the code provided by your teacher.
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm text-slate-400">
              Classroom Code
            </label>

            <input
              type="text"
              value={roomCode}
              onChange={(e) =>
                setRoomCode(e.target.value.toUpperCase())
              }
              placeholder="Enter room code"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white uppercase outline-none focus:border-cyan-400"
            />

            <div className="mt-6">
              <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <Languages className="h-4 w-4" />
                Preferred Language
              </label>

              <select
                value={preferredLanguage}
                onChange={(e) =>
                  setPreferredLanguage(e.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400"
              >
                {languages.map((language) => (
                  <option
                    key={language.code}
                    value={language.name}
                  >
                    {language.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={joinClassroom}
              className="mt-8 w-full rounded-xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Join Classroom
            </button>

          </div>
        ) : (
          <div className="space-y-6">

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-slate-500">
                    Connected Classroom
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Room {roomCode}
                  </h2>
                </div>

                <div className="rounded-full bg-green-400/10 px-4 py-2 text-sm text-green-400">
                  Connected
                </div>

              </div>

              <p className="mt-4 text-slate-400">
                Listening in{" "}
                <span className="font-semibold text-cyan-400">
                  {preferredLanguage}
                </span>
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-cyan-400" />

                <div>
                  <p className="text-sm text-slate-500">
                    Live Lesson
                  </p>

                  <h2 className="text-xl font-bold">
                    {preferredLanguage}
                  </h2>
                </div>
              </div>

              <div className="mt-6 min-h-[220px] rounded-2xl bg-black/20 p-6">
                <p className="text-lg leading-8 text-slate-300">
                  {lessonText}
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}