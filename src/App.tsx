import Translator from "./pages/Translator";
import RemoteSpeaker from "./pages/RemoteSpeaker";
import RemoteSpeakerPage from "./pages/RemoteSpeakerPage";
import RemoteListenerPage from "./pages/RemoteListenerPage";
import TextTranslation from "./pages/TextTranslation";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";
import CommunicateRoom from "./pages/CommunicateRoom";
import {
  ArrowRight,
  Globe2,
  Mic,
  Volume2,
  Languages,
  Sparkles,
  BookOpen,
  Play,
  Phone,
  LogIn,
  Users,
} from "lucide-react";


function App() {
  if (window.location.pathname === "/translator") {
  return <Translator />;
}

if (window.location.pathname === "/text-translation") {
  return <TextTranslation />;
}

if (window.location.pathname === "/remote/speaker") {
  return <RemoteSpeakerPage />;
}
if (window.location.pathname === "/remote/listener") {
  return <RemoteListenerPage />;
}
if (window.location.pathname === "/remote/listener") {
  return <RemoteSpeaker />;
}
if (window.location.pathname === "/dashboard") {
  return <Dashboard />;
}
if (window.location.pathname === "/") {
  return <Dashboard />;
}
if (window.location.pathname === "/communicate/room") {
  return <CommunicateRoom />;
}
if (window.location.pathname === "/communicate") {
  return <CommunicateNow />;
}
if (window.location.pathname === "/remote") {
  return <RemoteRole />;
}

  

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Languages className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">VernacAI</h1>
              <p className="text-xs text-slate-400">Learn in your language</p>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#" className="text-sm text-slate-300 hover:text-white">
              Home
            </a>
            <a href="#" className="text-sm text-slate-300 hover:text-white">
              Features
            </a>
            <a href="#" className="text-sm text-slate-300 hover:text-white">
              About
            </a>
          </div>

          <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:scale-105">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute left-1/2 top-0 -z-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
            {/* Left */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                <Sparkles className="h-4 w-4" />
                AI-Powered Vernacular Learning
              </div>

              <h2 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
                Learn Better.
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  In Your Mother Tongue.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
                VernacAI uses AI-powered translation and vernacular pedagogy
                to make primary education easier to understand, more
                accessible, and more engaging.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
  {/* Start Learning */}
  <button
    onClick={() => {
      window.location.href = "/translator";
    }}
    className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3.5 font-semibold shadow-xl shadow-cyan-500/20 transition hover:-translate-y-1"
  >
    Start Learning
    <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
  </button>

  {/* See How It Works */}
  <button
    onClick={() => {
      window.location.href = "/text-translation";
    }}
    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold backdrop-blur transition hover:bg-white/10"
  >
    <Play className="h-5 w-5" />
    See How It Works
  </button>
</div>

{/* Translation Modes */}
<div className="mt-6 grid gap-3 sm:grid-cols-3">
  <button
    onClick={() => {
      window.location.href = "/translator";
    }}
    className="group flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 font-semibold text-cyan-200 transition hover:-translate-y-1 hover:bg-cyan-400/20"
  >
    <Mic className="h-5 w-5" />
    Real-Time
    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
  </button>

  <button
    onClick={() => {
      window.location.href = "/remote";
    }}
    className="group flex items-center justify-center gap-2 rounded-2xl border border-purple-400/20 bg-purple-400/10 px-4 py-3 font-semibold text-purple-200 transition hover:-translate-y-1 hover:bg-purple-400/20"
  >
    <Globe2 className="h-5 w-5" />
    Remote
    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
  </button>

  <button
    onClick={() => {
      window.location.href = "/text-translation";
    }}
    className="group flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold transition hover:-translate-y-1 hover:bg-white/10"
  >
    <Languages className="h-5 w-5" />
    Text
    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
  </button>
</div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-cyan-400" />
                  Multiple Indian Languages
                </span>

                <span className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-blue-400" />
                  Voice Enabled
                </span>
              </div>
            </div>

            {/* Translation Card */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Live Translation</p>
                    <p className="mt-1 text-xs text-slate-500">
                      AI-powered language bridge
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                    <Mic className="h-5 w-5 text-cyan-300" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Teacher
                      </span>
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-400">
                        English
                      </span>
                    </div>

                    <p className="text-lg text-slate-200">
                      “Plants need sunlight to grow.”
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
                      <ArrowRight className="h-5 w-5 rotate-90 text-cyan-300" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-cyan-300">
                        Student
                      </span>
                      <span className="rounded-lg bg-cyan-400/10 px-2 py-1 text-xs text-cyan-300">
                        हिंदी
                      </span>
                    </div>

                    <p className="text-lg text-white">
                      पौधों को बढ़ने के लिए सूर्य के प्रकाश की आवश्यकता होती है।
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                  Translation completed instantly
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-white/10 bg-slate-900/40 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Why VernacAI
              </p>

              <h3 className="mt-4 text-4xl font-bold">
                Education without language barriers.
              </h3>

              <p className="mt-5 text-slate-400">
                A smarter learning experience designed around the student's
                language and understanding.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<Languages />}
                title="Real-Time Translation"
                description="Convert educational content between languages with an AI-powered translation experience."
              />

              <FeatureCard
                icon={<BookOpen />}
                title="Vernacular Pedagogy"
                description="Present concepts in a familiar language so students can understand lessons more naturally."
              />

              <FeatureCard
                icon={<Mic />}
                title="Voice Learning"
                description="Interact through speech and make learning more accessible and engaging."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 VernacAI</p>
          <p>AI-Powered Mother Tongue-Based Education</p>
        </div>
      </footer>
    </div>
  );
}
function RemoteRole() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">

        <div className="w-full text-center">

          {/* Logo */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Languages className="h-8 w-8" />
          </div>

          <h1 className="text-4xl font-black sm:text-5xl">
            VernacAI Remote Translation
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Connect two devices for real-time translated communication.
            Choose your role to continue.
          </p>

          {/* Online Status */}
          <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-sm text-emerald-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Remote Translation Online
          </div>

          {/* Role Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">

            {/* Speaker */}
            <button
              onClick={() => {
                window.location.href = "/remote/speaker";
              }}
              className="group rounded-3xl border border-cyan-400/20 bg-white/[0.05] p-8 text-left transition duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:bg-cyan-400/[0.08]"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
                <Mic className="h-8 w-8 text-cyan-300" />
              </div>

              <h2 className="text-2xl font-bold">
                I am the Speaker
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                Speak or type your message. VernacAI will translate it and
                send the translated message to the listener's device.
              </p>

              <div className="mt-7 flex items-center gap-2 font-semibold text-cyan-300">
                Continue as Speaker
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </div>
            </button>

            {/* Listener */}
            <button
              onClick={() => {
                window.location.href = "/remote/listener";
              }}
              className="group rounded-3xl border border-purple-400/20 bg-white/[0.05] p-8 text-left transition duration-300 hover:-translate-y-2 hover:border-purple-400/50 hover:bg-purple-400/[0.08]"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-400/10">
                <Volume2 className="h-8 w-8 text-purple-300" />
              </div>

              <h2 className="text-2xl font-bold">
                I am the Listener
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                Receive translated messages on this device and listen to
                them through the device speaker.
              </p>

              <div className="mt-7 flex items-center gap-2 font-semibold text-purple-300">
                Continue as Listener
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </div>
            </button>

          </div>

          <button
  onClick={() => {
    window.location.href = "/";
  }}
  className="mt-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
>
  ← Back to Home
</button>

        </div>
      </div>
    </div>
  );
}
function CommunicateNow() {
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* Back */}
        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="mb-12 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Users className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-4xl font-black sm:text-5xl">
            Communicate <span className="text-cyan-400">Now</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Connect with people across languages and communicate
            naturally using real-time AI translation.
          </p>

        </div>

        {/* Call / Join */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">

          {/* CALL */}
          <button
  onClick={async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`}/communicate/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      sessionStorage.setItem(
        "communicate_code",
        data.session_code
      );

      window.location.href = "/communicate/room";
    } else {
      alert(data.error || "Could not create call.");
    }
  } catch (error) {
    console.error(error);
    alert("Backend se connection nahi ho pa raha.");
  }
}}
  className="group rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-8 text-left transition duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:bg-cyan-400/[0.08]"
>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10">
              <Phone className="h-8 w-8 text-cyan-300" />
            </div>

            <h2 className="mt-7 text-2xl font-bold">
              Call
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Create a communication room and invite others
              using a unique session code.
            </p>

            <div className="mt-7 flex items-center gap-2 font-semibold text-cyan-300">
              Create Call
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </div>

          </button>

          {/* JOIN */}
          <button
  onClick={() => setShowJoin(true)}
  className="group rounded-3xl border border-purple-400/20 bg-purple-400/[0.05] p-8 text-left transition duration-300 hover:-translate-y-2 hover:border-purple-400/50 hover:bg-purple-400/[0.08]"
>
  


            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-400/10">
              <LogIn className="h-8 w-8 text-purple-300" />
            </div>

            <h2 className="mt-7 text-2xl font-bold">
              Join
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Enter a communication code and join an existing
              conversation instantly.
            </p>

            <div className="mt-7 flex items-center gap-2 font-semibold text-purple-300">
              Join Call
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </div>

          </button>

        </div>
        {showJoin && (
  <div className="mt-8 rounded-3xl border border-purple-400/20 bg-purple-400/[0.05] p-6">
    <h3 className="text-xl font-bold text-white">
      Join Communication
    </h3>

    <p className="mt-2 text-sm text-slate-400">
      Enter the communication code shared by the caller.
    </p>

    <input
      type="text"
      value={joinCode}
      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
      placeholder="VA-XXXX"
      maxLength={7}
      className="mt-5 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-center text-lg font-bold tracking-widest text-white outline-none focus:border-purple-400"
    />

    <button
      disabled={!joinCode.trim() || joining}
      onClick={async () => {
        setJoining(true);

        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`}/communicate/join`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                session_code: joinCode.trim().toUpperCase(),
              }),
            }
          );

          const data = await response.json();

          if (data.success) {
            sessionStorage.setItem(
              "communicate_code",
              data.session_code
            );

            window.location.href = "/communicate/room";
          } else {
            alert(data.error || "Invalid communication code.");
          }
        } catch (error) {
          console.error(error);
          alert("Backend se connection nahi ho pa raha.");
        } finally {
          setJoining(false);
        }
      }}
      className="mt-4 w-full rounded-xl bg-purple-500 px-5 py-3 font-bold text-white transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {joining ? "Joining..." : "Join Session"}
    </button>

    <button
      onClick={() => {
        setShowJoin(false);
        setJoinCode("");
      }}
      className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
    >
      Cancel
    </button>
  </div>
)}

        {/* Info */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
          <p className="text-sm text-slate-400">
            🎤 Everyone can speak • 🌐 AI translates • 🔊 Everyone can listen
          </p>
        </div>

      </div>
    </div>
  );
}
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-cyan-400/30 hover:bg-white/[0.06]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        {icon}
      </div>

      <h4 className="mt-6 text-xl font-bold text-white">
        {title}
      </h4>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>
    </div>
  );
}
export default App;