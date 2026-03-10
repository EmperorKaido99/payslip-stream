interface ProcessingStepProps {
  progress: number;
  total: number;
  message: string;
}

export function ProcessingStep({ progress, total, message }: ProcessingStepProps) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-10">
      {/* Animated ring */}
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{pct}%</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-white/80 font-medium">{message}</p>
        {total > 1 && (
          <p className="text-white/35 text-sm">
            Page {Math.min(progress, total)} of {total}
          </p>
        )}
      </div>

      {/* Step indicators */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {[
          { label: 'Loading documents', done: pct > 5 },
          { label: 'Extracting text from pages', done: pct > 20 },
          { label: 'Matching names to employees', done: pct > 80 },
          { label: 'Splitting PDF pages', done: pct >= 100 },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
              step.done
                ? 'bg-emerald-500 text-black'
                : pct > i * 25
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                : 'bg-white/6 text-white/20 border border-white/10'
            }`}>
              {step.done ? '✓' : i + 1}
            </div>
            <span className={`text-sm transition-colors ${step.done ? 'text-white/60' : pct > i * 25 ? 'text-white/80' : 'text-white/25'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
