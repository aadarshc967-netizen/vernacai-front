
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Mic,
  Users,
  Copy,
  Check,
  GraduationCap,
  Languages,
  Volume2,
} from "lucide-react";
import { fetchLanguages, type Language } from "../data/languages";

export default function LiveClassroom() {
  const [role, setRole] = useState<"select" | "teacher" | "student">(
    "select"
  );

  const [languages, setLanguages] = useState<Language[]>([]);
  const [preferredLanguage, setPreferredLanguage] = useState("Hindi");

  const [roomCode] = useState(
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  const [studentRoomCode, setStudentRoomCode] = useState("");

  const [copied, setCopied] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const [lessonText, setLessonText] = useState("");

  const socketRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null);

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

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomCode);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  // ==================================================
  // TEACHER
  // ==================================================

  const startClassroom = () => {
    const apiUrl = "http://127.0.0.1:8000";

    const wsUrl = apiUrl
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    const socket = new WebSocket(
      `${wsUrl}/ws/classroom/${roomCode}`
    );

    socket.onopen = () => {
      console.log(
        "Teacher connected to classroom:",
        roomCode
      );

      socket.send(
        JSON.stringify({
          type: "teacher_join",
        })
      );

      setIsLive(true);
    };

    socket.onmessage = (event) => {
      console.log(
        "Message from classroom:",
        event.data
      );
    };

    socket.onerror = (error) => {
      console.error(
        "Teacher WebSocket error:",
        error
      );

      alert("Could not connect to classroom.");
    };

    socket.onclose = () => {
      console.log(
        "Teacher classroom connection closed."
      );

      setIsLive(false);
    };

    socketRef.current = socket;
  };

  const startTeacherSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    if (
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      alert("Please start the classroom first.");
      return;
    }

    if (recognitionRef.current) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsSpeaking(true);

      console.log(
        "Teacher microphone started."
      );
    };

    recognition.onresult = (event: any) => {
      let text = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        if (event.results[i].isFinal) {
          text +=
            event.results[i][0].transcript + " ";
        }
      }

      text = text.trim();

      if (!text) {
        return;
      }

      console.log(
        "Teacher said:",
        text
      );

      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(
          JSON.stringify({
            type: "lesson",
            text: text,
          })
        );
      }
    };

    recognition.onerror = (event: any) => {
      console.error(
        "Teacher speech recognition error:",
        event.error
      );

      setIsSpeaking(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      console.log(
        "Teacher speech recognition ended."
      );

      setIsSpeaking(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  const stopTeacherSpeech = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsSpeaking(false);
  };

  const stopClassroom = () => {
    stopTeacherSpeech();

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsLive(false);
  };

  const sendTestLesson = () => {
    if (
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      alert("Classroom is not connected.");
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "lesson",
        text:
          "Today we are learning Artificial Intelligence.",
      })
    );
  };

  // ==================================================
  // STUDENT
  // ==================================================

  const joinClassroom = () => {
    if (!studentRoomCode.trim()) {
      alert("Please enter the classroom code.");
      return;
    }

    const apiUrl = "http://127.0.0.1:8000";

    const wsUrl = apiUrl
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    const socket = new WebSocket(
      `${wsUrl}/ws/classroom/${studentRoomCode.trim()}`
    );

    socket.onopen = () => {
      console.log(
        "Student connected to classroom:",
        studentRoomCode
      );

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

      console.log(
        "Message received:",
        message
      );

      if (message.type === "lesson") {
        setLessonText(message.text || "");
      }
    };

    socket.onerror = (error) => {
      console.error(
        "Student WebSocket error:",
        error
      );

      alert("Could not connect to the classroom.");
    };

    socket.onclose = () => {
      console.log(
        "Student classroom connection closed."
      );
    };

    socketRef.current = socket;
  };

  const leaveStudentClassroom = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsJoined(false);
    setLessonText("");
  };

  // ==================================================
  // ROLE SELECTION
  // ==================================================

  if (role === "select") {
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

          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold">
              Live Classroom
            </h1>

            <p className="mt-3 text-slate-400">
              Teach once. Let every student learn in
              their preferred language.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* TEACHER */}
            <button
              onClick={() => setRole("teacher")}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.05]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
                <Users className="h-8 w-8 text-cyan-400" />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Teacher
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                Create a classroom, share the room code,
                and teach students in real time.
              </p>

              <div className="mt-6 font-semibold text-cyan-400">
                Create Classroom →
              </div>
            </button>

            {/* STUDENT */}
            <button
              onClick={() => setRole("student")}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-left transition hover:border-green-400/40 hover:bg-green-400/[0.05]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-400/10">
                <GraduationCap className="h-8 w-8 text-green-400" />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                Student
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                Join your teacher's classroom and learn
                in your preferred language.
              </p>

              <div className="mt-6 font-semibold text-green-400">
                Join Classroom →
              </div>
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // TEACHER PAGE
  // ==================================================

  if (role === "teacher") {
    return (
      <div className="min-h-screen bg-[#020617] p-6 text-white">
        <div className="mx-auto max-w-5xl">

          <button
            onClick={() => {
              stopClassroom();
              setRole("select");
            }}
            className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-300 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold">
              Teacher Classroom
            </h1>

            <p className="mt-3 text-slate-400">
              Create a live classroom and teach your
              students in real time.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* ROOM */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-cyan-400" />

                <div>
                  <h2 className="text-xl font-bold">
                    Classroom
                  </h2>

                  <p className="text-sm text-slate-500">
                    Share this code with your students
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-black/30 p-6 text-center">

                <p className="text-sm text-slate-500">
                  Room Code
                </p>

                <h3 className="mt-3 text-4xl font-bold tracking-[0.3em] text-cyan-400">
                  {roomCode}
                </h3>

                <button
                  onClick={copyRoomCode}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Room Code
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* CLASS CONTROL */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/10">
                <Mic className="h-10 w-10 text-cyan-400" />
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                {isLive
                  ? "Classroom is Live"
                  : "Start Your Class"}
              </h2>

              <p className="mt-3 text-slate-400">
                {isLive
                  ? "Students can now connect to your classroom."
                  : "Start the classroom when you are ready to teach."}
              </p>

              <button
                onClick={() => {
                  if (isLive) {
                    stopClassroom();
                  } else {
                    startClassroom();
                  }
                }}
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                <Mic className="h-5 w-5" />

                {isLive
                  ? "Stop Classroom"
                  : "Start Classroom"}
              </button>

              {isLive && (
                <>
                  <button
                    onClick={sendTestLesson}
                    className="mt-4 inline-flex items-center gap-3 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-8 py-4 font-bold text-cyan-400 transition hover:bg-cyan-400/20"
                  >
                    Send Test Lesson
                  </button>

                  <br />

                  {!isSpeaking ? (
                    <button
                      onClick={startTeacherSpeech}
                      className="mt-4 inline-flex items-center gap-3 rounded-xl bg-green-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-green-300"
                    >
                      <Mic className="h-5 w-5" />
                      Start Teacher Microphone
                    </button>
                  ) : (
                    <button
                      onClick={stopTeacherSpeech}
                      className="mt-4 inline-flex items-center gap-3 rounded-xl bg-red-400 px-8 py-4 font-bold text-slate-950 transition hover:bg-red-300"
                    >
                      <Mic className="h-5 w-5" />
                      Stop Teacher Microphone
                    </button>
                  )}
                </>
              )}

            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8">

            <p className="text-sm text-slate-500">
              Connected Students
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              —
            </h2>

            <p className="mt-2 text-slate-400">
              Student count will be connected to the
              classroom server next.
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ==================================================
  // STUDENT PAGE
  // ==================================================

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mx-auto max-w-5xl">

        <button
          onClick={() => {
            leaveStudentClassroom();
            setRole("select");
          }}
          className="mb-8 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-slate-300 transition hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {!isJoined ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold">
                Join Live Classroom
              </h1>

              <p className="mt-3 text-slate-400">
                Enter your teacher's classroom code and
                choose your preferred language.
              </p>
            </div>

            <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">

              <div className="mb-8 flex items-center gap-3">
                <GraduationCap className="h-7 w-7 text-green-400" />

                <div>
                  <h2 className="text-xl font-bold">
                    Student Details
                  </h2>

                  <p className="text-sm text-slate-500">
                    Connect to your teacher's classroom.
                  </p>
                </div>
              </div>

              <label className="mb-2 block text-sm text-slate-400">
                Classroom Code
              </label>

              <input
                type="text"
                value={studentRoomCode}
                onChange={(e) =>
                  setStudentRoomCode(
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="Enter room code"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white uppercase outline-none focus:border-green-400"
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
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-green-400"
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
                className="mt-8 w-full rounded-xl bg-green-400 px-6 py-4 font-bold text-slate-950 transition hover:bg-green-300"
              >
                Join Classroom
              </button>

            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold">
                Live Classroom
              </h1>

              <p className="mt-3 text-slate-400">
                You are learning in your preferred
                language.
              </p>
            </div>

            <div className="space-y-6">

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-slate-500">
                      Connected Classroom
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      Room {studentRoomCode}
                    </h2>
                  </div>

                  <div className="rounded-full bg-green-400/10 px-4 py-2 text-sm text-green-400">
                    Connected
                  </div>

                </div>

                <p className="mt-4 text-slate-400">
                  Learning in{" "}
                  <span className="font-semibold text-green-400">
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

              <button
                onClick={leaveStudentClassroom}
                className="w-full rounded-xl border border-red-400/30 bg-red-400/10 px-6 py-4 font-bold text-red-400 transition hover:bg-red-400/20"
              >
                Leave Classroom
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

