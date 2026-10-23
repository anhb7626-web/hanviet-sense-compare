import { getCorpusSnapshot } from "../lib/corpus";
import { useLang } from "../lib/lang";

function Bar({
  label,
  n,
  max,
  color,
}: {
  label: string;
  n: number;
  max: number;
  color: string;
}) {
  const pct = max ? Math.round((n / max) * 100) : 0;
  return (
    <div className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-2 text-[0.82rem]">
      <span className="truncate text-[var(--color-muted)]">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-right font-semibold tabular-nums">{n}</span>
    </div>
  );
}

export function CorpusPanel() {
  const { lang, m } = useLang();
  const c = getCorpusSnapshot();
  const vi = lang === "vi";

  const relLabels: Record<string, string> = {
    same: m.relSame,
    zh_only: m.relZhOnly,
    vi_only: m.relViOnly,
    diff: m.relDiff,
  };

  const relMax = Math.max(...Object.values(c.byRelation), 1);
  const dimEntries = Object.entries(c.byDim).sort((a, b) => b[1] - a[1]);
  const dimMax = Math.max(...dimEntries.map(([, n]) => n), 1);

  return (
    <section className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h2 className="m-0 text-[0.95rem] font-bold">
        {vi ? "Số liệu bản này" : "本版数据"}
      </h2>
      <p className="mt-1 mb-0 text-[0.8rem] text-[var(--color-muted)]">
        {vi
          ? "Đếm từ dữ liệu đối chiếu — chưa phải khảo sát người học."
          : "来自对照数据——尚非学习者调查。"}
      </p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { n: c.wordCount, label: vi ? "từ" : "词" },
          { n: c.trapWords, label: vi ? "bẫy" : "易混", trap: true },
          { n: c.senseCount, label: vi ? "nghĩa" : "义项" },
          { n: c.testCount, label: vi ? "câu hỏi" : "测题" },
        ].map((x) => (
          <div
            key={x.label}
            className="rounded-lg bg-[var(--color-bg)] px-2 py-2.5 text-center"
          >
            <div
              className={`text-[1.35rem] font-bold tabular-nums ${
                x.trap ? "text-[var(--color-trap)]" : "text-[var(--color-brand)]"
              }`}
            >
              {x.n}
            </div>
            <div className="text-[0.7rem] text-[var(--color-muted)]">{x.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-[0.72rem] font-semibold text-[var(--color-muted)]">
            {vi ? "Quan hệ nghĩa" : "义项关系"}
          </div>
          <div className="flex flex-col gap-2">
            {(["same", "zh_only", "diff", "vi_only"] as const).map((k) =>
              c.byRelation[k] > 0 ? (
                <Bar
                  key={k}
                  label={relLabels[k]}
                  n={c.byRelation[k]}
                  max={relMax}
                  color={
                    k === "same"
                      ? "var(--color-ok)"
                      : k === "diff"
                        ? "var(--color-accent)"
                        : "var(--color-trap)"
                  }
                />
              ) : null,
            )}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[0.72rem] font-semibold text-[var(--color-muted)]">
            {vi ? "Chiều lệch" : "偏移维度"}
          </div>
          <div className="flex flex-col gap-2">
            {dimEntries.map(([d, n]) => (
              <Bar
                key={d}
                label={d}
                n={n}
                max={dimMax}
                color="var(--color-brand-mid)"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
