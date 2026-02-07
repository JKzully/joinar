"use client";

const STEPS = ["Welcome", "Account", "Your Ad", "Done"];

export default function ProgressDots({ current }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-0">
      {STEPS.map((label, i) => {
        const isPast = i < current;
        const isActive = i === current;
        const isFuture = i > current;

        return (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div
                className={`h-0.5 w-8 sm:w-12 ${
                  isPast || isActive ? "bg-orange-500" : "bg-border"
                }`}
              />
            )}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isPast
                    ? "bg-orange-500 text-white"
                    : isActive
                      ? "bg-orange-500 text-white ring-4 ring-orange-500/20"
                      : "border-2 border-border bg-surface text-text-muted"
                }`}
              >
                {isPast ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-[11px] font-medium ${
                  isPast || isActive ? "text-orange-400" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
