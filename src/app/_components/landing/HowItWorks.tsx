export function HowItWorks() {
  return (
    <div className="relative z-10 mx-auto mb-32 max-w-7xl px-4">
      <div className="mb-24 text-center">
        <h3 className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text pb-2 text-4xl font-black text-transparent drop-shadow-sm md:text-5xl dark:from-blue-400 dark:to-cyan-300">
          Effortless Workflow
        </h3>
        <p className="mt-6 text-lg font-medium text-slate-600 dark:text-gray-400">
          From raw data to actionable insights in 4 simple steps.
        </p>
      </div>

      <div className="relative">
        {/* Connecting Line (Desktop Only) */}
        <div className="absolute top-12 left-0 hidden h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-40 md:block dark:via-blue-500 dark:opacity-30" />

        <div className="relative z-10 grid gap-16 md:grid-cols-4 md:gap-8">
          {[
            {
              step: "01",
              title: "Upload",
              desc: "Drag & drop your CSV or Excel file.",
              color: "from-blue-500 to-cyan-400",
            },
            {
              step: "02",
              title: "Connect",
              desc: "Add your API key or custom endpoint.",
              color: "from-cyan-500 to-teal-400",
            },
            {
              step: "03",
              title: "Analyze",
              desc: "Click once and let AI do the heavy lifting.",
              color: "from-teal-500 to-emerald-400",
            },
            {
              step: "04",
              title: "Discover",
              desc: "Explore summaries, anomalies, and charts.",
              color: "from-emerald-500 to-green-400",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Node */}
              <div className="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-xl backdrop-blur-xl transition-transform duration-500 group-hover:-translate-y-3 group-hover:border-slate-300 dark:border-white/10 dark:bg-slate-900 dark:shadow-2xl dark:group-hover:border-white/30">
                <div
                  className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${item.color} opacity-[0.08] transition-opacity duration-500 group-hover:opacity-20 dark:opacity-10`}
                />
                <span
                  className={`bg-gradient-to-br bg-clip-text text-4xl font-black text-transparent ${item.color} drop-shadow-sm`}
                >
                  {item.step}
                </span>

                {/* Glow behind the circle */}
                <div
                  className={`absolute -inset-4 bg-gradient-to-br ${item.color} -z-10 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-30 dark:group-hover:opacity-20`}
                />
              </div>

              <h4 className="mb-4 text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                {item.title}
              </h4>
              <p className="max-w-[220px] text-base leading-relaxed font-medium text-slate-600 dark:text-gray-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
