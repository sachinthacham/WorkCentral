export default function HomePage() {
  return (
    <div className="auth-shell min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm"
            style={{
              background: "rgba(255,255,255,0.65)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <span className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.8)]" />
            WorkCentral — workspace OS for focused teams
          </div>

          <h1 className="font-display text-5xl font-semibold leading-[1.08] tracking-tight text-zinc-900 sm:text-6xl md:text-7xl">
            Clarity for every
            <br />
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-amber-600 bg-clip-text text-transparent">
              project you ship
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-zinc-600">
            Plan work in calm, structured layers — from workspace to sprint to
            task — without the noise of a generic dashboard.
          </p>

          <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href="/register"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl px-10 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:brightness-105 active:scale-[0.99] [background:linear-gradient(145deg,#0d9488_0%,#0f766e_45%,#115e59_100%)] shadow-teal-500/30"
            >
              Start free
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-zinc-300/90 bg-white/70 px-10 py-4 text-lg font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition-all hover:border-teal-400/60 hover:bg-white"
            >
              Sign in
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-zinc-500">
            <span className="flex items-center gap-2">
              <span className="text-teal-600">✓</span> No card to explore
            </span>
            <span className="flex items-center gap-2">
              <span className="text-teal-600">✓</span> Search across tasks &amp;
              projects
            </span>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200/80 bg-white/40 py-6 text-center text-xs font-medium text-zinc-500 backdrop-blur-sm">
        Final-year workspace management system · Built with care
      </footer>
    </div>
  );
}
