
import {
  ArrowRight,
  Languages,
  Mic,
  Radio,
  Type,
  Globe2,
  Zap,
  Users,
  MessageCircle,
  GraduationCap,
} from "lucide-react";

function Dashboard() {
  const goTo = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-16">

        <div className="text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Real-Time Vernacular Classroom Assistant
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Learn Without
            <span className="text-cyan-400"> Language Barriers.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            VernacAI helps students understand lessons in their preferred
            vernacular language through real-time speech, text and audio.
          </p>

        </div>

        {/* MODES */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">

          {/* LIVE CLASSROOM */}
          <div className="group rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6 transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.07]">

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <GraduationCap className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold">
              Live Classroom
            </h2>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
              Follow a teacher's lesson in real time using your preferred
              vernacular language.
            </p>

            <button
              onClick={() => goTo("/live-classroom")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start Classroom
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

          {/* LIVE SPEECH */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]">

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
              <Mic className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold">
              Live Speech
            </h2>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
              Speak naturally and translate your voice into another language
              in real time.
            </p>

            <button
              onClick={() => goTo("/listening")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Start Translation
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

          {/* TEXT */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-violet-400/30 hover:bg-violet-400/[0.05]">

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-300">
              <Type className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold">
              Text Translation
            </h2>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
              Type a message or lesson content and translate it instantly.
            </p>

            <button
              onClick={() => goTo("/text-translation")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Translate Text
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

          {/* REMOTE */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.05]">

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Radio className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold">
              Remote Classroom
            </h2>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
              Connect multiple students to one teacher using a shared
              classroom session.
            </p>

            <button
              onClick={() => goTo("/remote")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Create Session
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

          {/* COMMUNICATE NOW */}
          <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-rose-400/30 hover:bg-rose-400/[0.05]">

            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300">
              <MessageCircle className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold">
              Communicate Now
            </h2>

            <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-400">
              Communicate naturally with teachers and students speaking
              different languages.
            </p>

            <button
              onClick={() => goTo("/communicate")}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Start Communicating
              <ArrowRight className="h-4 w-4" />
            </button>

          </div>

        </div>

        {/* QUICK INFO */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Languages className="h-5 w-5 text-cyan-300" />
            <p className="mt-3 text-2xl font-bold">
              Multilingual
            </p>
            <p className="text-sm text-slate-500">
              Vernacular language support
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Zap className="h-5 w-5 text-yellow-300" />
            <p className="mt-3 text-2xl font-bold">
              Real-Time
            </p>
            <p className="text-sm text-slate-500">
              AI-powered lesson translation
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <Users className="h-5 w-5 text-emerald-300" />
            <p className="mt-3 text-2xl font-bold">
              Multi-Student
            </p>
            <p className="text-sm text-slate-500">
              Shared classroom communication
            </p>
          </div>

        </div>

        {/* HOW IT WORKS */}
        <div className="mt-16">

          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              How it works
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              From Teaching to Understanding
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-cyan-300">
                01
              </p>

              <h3 className="mt-3 font-semibold">
                Teacher Speaks
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The teacher explains the lesson naturally through speech.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-cyan-300">
                02
              </p>

              <h3 className="mt-3 font-semibold">
                AI Processes
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                VernacAI processes the spoken lesson and identifies the
                required translation.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-cyan-300">
                03
              </p>

              <h3 className="mt-3 font-semibold">
                Vernacular Translation
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The lesson is translated into the student's preferred
                language.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm font-bold text-cyan-300">
                04
              </p>

              <h3 className="mt-3 font-semibold">
                Read & Listen
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Students can read or listen to the translated lesson.
              </p>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="mt-16 border-t border-white/10 pt-8 text-center">

          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Globe2 className="h-5 w-5 text-cyan-300" />
            <span className="font-semibold">
              VernacAI
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-600">
            Real-time vernacular learning assistant
          </p>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;

