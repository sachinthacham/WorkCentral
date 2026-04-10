export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      

      {/* Hero Section */}
      <main className="flex-1 flex items-center pt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">Now in Public Beta</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-6 leading-tight">
            The modern way to<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              manage your workspace
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-12 leading-relaxed">
            Streamline projects, boost team collaboration, and deliver results faster 
            with an intuitive workspace management platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/register"
              className="group w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg rounded-3xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
            >
              Start Free Trial
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>

            <a
              href="/login"
              className="w-full sm:w-auto px-10 py-4 border-2 border-slate-300 hover:border-slate-400 font-semibold text-lg rounded-3xl transition-all duration-300 hover:bg-slate-50"
            >
              Sign in
            </a>
          </div>

          <div className="mt-10 text-sm text-slate-500 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> No credit card required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">✓</span> 14-day free trial
            </div>
          </div>
        </div>
      </main>

      {/* Trust / Social Proof */}
      <div className="border-t border-slate-100 py-8 bg-white/50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-slate-500 text-sm mb-6">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-2xl font-bold">Notion</span>
            <span className="text-2xl font-bold">Linear</span>
            <span className="text-2xl font-bold">Vercel</span>
            <span className="text-2xl font-bold">Figma</span>
            <span className="text-2xl font-bold">Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}