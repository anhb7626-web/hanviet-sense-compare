import { pct1 } from "../lib/survey";

type Row = {
  name: string;
  rate: number;
  color: string;
  caption: string;
};

const BAR_MAX = 168;

export function GroupAccuracyChart({
  title,
  rows,
}: {
  title: string;
  rows: Row[];
}) {
  const max = Math.max(...rows.map((r) => r.rate), 0.01);

  return (
    <section className="chart-card overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[var(--color-line)] px-4 py-3 sm:px-5">
        <h2 className="m-0 text-[0.95rem] font-bold">{title}</h2>
        <span className="text-[0.72rem] text-[var(--color-muted)]">0–100%</span>
      </div>

      <div className="relative px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
        {/* Grid lines */}
        <div
          className="pointer-events-none absolute inset-x-4 top-5 bottom-14 sm:inset-x-6 sm:top-6 sm:bottom-16"
          aria-hidden
        >
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="absolute right-0 left-0 border-t border-dashed border-[var(--color-line)]/80"
              style={{ bottom: `${t * 100}%` }}
            />
          ))}
        </div>

        <div className="relative z-[1] flex items-end justify-around gap-3 sm:gap-6">
          {rows.map((row, i) => {
            const h = Math.max(12, Math.round((row.rate / max) * BAR_MAX));
            return (
              <div
                key={row.name}
                className="flex w-full max-w-[7.5rem] flex-col items-center"
              >
                <div
                  className="mb-2 text-[1.05rem] font-bold tabular-nums tracking-tight text-[var(--color-ink)]"
                  style={{ color: row.color }}
                >
                  {pct1(row.rate)}%
                </div>
                <div
                  className="chart-bar-track flex w-full max-w-[3.25rem] items-end justify-center"
                  style={{ height: BAR_MAX }}
                >
                  <div
                    className="chart-bar w-full rounded-t-xl"
                    style={{
                      height: h,
                      background: `linear-gradient(180deg, ${row.color} 0%, color-mix(in srgb, ${row.color} 72%, #0a2748) 100%)`,
                      animationDelay: `${0.08 + i * 0.1}s`,
                      boxShadow: `0 10px 24px -12px ${row.color}`,
                    }}
                  />
                </div>
                <div className="mt-3 text-center">
                  <div className="text-[0.95rem] font-bold text-[var(--color-ink)]">
                    {row.name}
                  </div>
                  <div className="mt-0.5 text-[0.72rem] leading-snug text-[var(--color-muted)]">
                    {row.caption}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
