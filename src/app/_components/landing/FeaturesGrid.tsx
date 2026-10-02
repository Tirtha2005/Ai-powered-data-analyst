import { Upload, Sparkles, BarChart3, Shield, Zap } from "lucide-react";

export function FeaturesGrid() {
  return (
    <div className="relative z-10 mx-auto mt-20 mb-32 max-w-7xl px-4">
      <div className="mb-20 text-center">
        <h2 className="animate-pulse-slow mb-4 text-sm font-bold tracking-[0.2em] text-emerald-500 uppercase">
          Platform Capabilities
        </h2>
        <h3 className="bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text pb-2 text-4xl font-black text-transparent drop-shadow-sm md:text-6xl dark:from-white dark:via-gray-200 dark:to-gray-500">
          Designed for Data Mastery
        </h3>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-slate-600 dark:text-gray-400">
          Unleash the power of AI to transform your raw data into stunning
          visualizations and actionable insights in seconds.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-rows-2">
        {/* Feature 1 - Large spanning card */}
        <div className="group relative col-span-1 overflow-hidden rounded-[2rem] border border-slate-200/50 bg-white/40 p-10 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:bg-white/60 md:col-span-2 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-2xl dark:hover:bg-slate-800/60">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-emerald-500/10" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_30px_rgba(52,211,153,0.2)] transition-transform duration-500 group-hover:scale-110 dark:shadow-[0_0_30px_rgba(52,211,153,0.3)]">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h4 className="mb-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                Smart File Parsing
              </h4>
              <p className="max-w-lg text-lg leading-relaxed font-medium text-slate-600 dark:text-gray-400">
                Drag & drop CSV or Excel files with automatic delimiter
                detection. Seamlessly configure encoding and headers for an
                effortless import experience.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200/50 bg-white/40 p-10 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:bg-white/60 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-2xl dark:hover:bg-slate-800/60">
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-purple-500/10" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-transform duration-500 group-hover:scale-110 dark:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h4 className="mb-4 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              AI Insights
            </h4>
            <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-gray-400">
              Get intelligent summaries and detect anomalies instantly using
              top-tier models like OpenAI, Claude, and Gemini.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200/50 bg-white/40 p-10 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:bg-white/60 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-2xl dark:hover:bg-slate-800/60">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-pink-500/10" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-[0_0_30px_rgba(236,72,153,0.2)] transition-transform duration-500 group-hover:scale-110 dark:shadow-[0_0_30px_rgba(236,72,153,0.3)]">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <h4 className="mb-4 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              Smart Charting
            </h4>
            <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-gray-400">
              AI automatically structures your data and suggests the most
              visually impactful charts for your metrics.
            </p>
          </div>
        </div>

        {/* Feature 4 & 5 - Combined into a double-width card */}
        <div className="group relative col-span-1 overflow-hidden rounded-[2rem] border border-slate-200/50 bg-white/40 p-10 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:bg-white/60 md:col-span-2 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-2xl dark:hover:bg-slate-800/60">
          <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-cyan-500/10" />
          <div className="relative z-10 flex h-full flex-col items-center gap-8 md:flex-row">
            <div className="flex-1">
              <div className="mb-8 flex gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-transform duration-500 group-hover:scale-110 dark:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_30px_rgba(251,191,36,0.2)] transition-transform duration-500 group-hover:scale-110 dark:shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                  <Zap className="h-7 w-7 text-white" />
                </div>
              </div>
              <h4 className="mb-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                Private & One-Click Fast
              </h4>
              <p className="text-lg leading-relaxed font-medium text-slate-600 dark:text-gray-400">
                Run a complete analysis with a single click. Zero data is stored
                on our servers. Configure self-hosted endpoints for absolute
                data privacy and lightning fast execution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
