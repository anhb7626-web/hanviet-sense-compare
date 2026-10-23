import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CorpusPanel } from "../components/CorpusPanel";
import { useLang } from "../lib/lang";
import { clearQuizResults, getQuizResults } from "../lib/storage";

export function StatsPage() {
  const { lang, m } = useLang();
  const vi = lang === "vi";
  const [results, setResults] = useState(getQuizResults);

  const summary = useMemo(() => {
    if (!results.length) return null;
    const sessions = results.length;
    const avg =
      results.reduce((s, r) => s + r.score / r.total, 0) / sessions;
    const traps = results.reduce((s, r) => s + r.traps, 0);
    return { sessions, avg, traps };
  }, [results]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 text-xl font-bold">{m.statsTitle}</h1>
        <p className="mt-2 mb-0 text-[0.92rem] text-[var(--color-muted)]">
          {m.statsLead}
        </p>
      </div>

      <CorpusPanel />

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <h2 className="mt-0 mb-1 text-base font-bold text-[var(--color-brand)]">
          {vi ? "Kết quả kiểm tra trên máy này" : "本机自测结果"}
        </h2>
        <p className="mt-0 mb-4 text-[0.82rem] text-[var(--color-muted)]">
          {vi
            ? "Dùng để tự theo dõi; khảo sát chính thức sẽ gửi ẩn danh (Google Sheets) khi cấu hình URL."
            : "用于自查；正式调查可在配置 URL 后匿名提交至 Google Sheets。"}
        </p>

        {!summary ? (
          <div>
            <p className="m-0 text-[var(--color-muted)]">{m.statsEmpty}</p>
            <Link
              to="/quiz"
              className="mt-3 inline-block font-semibold text-[var(--color-accent)]"
            >
              {m.statsGoQuiz} →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 border-y border-[var(--color-line)] py-4">
              <div>
                <div className="text-[1.6rem] font-bold tabular-nums text-[var(--color-brand)]">
                  {summary.sessions}
                </div>
                <div className="text-[0.78rem] text-[var(--color-muted)]">
                  {m.statsSessions}
                </div>
              </div>
              <div>
                <div className="text-[1.6rem] font-bold tabular-nums text-[var(--color-honey)]">
                  {Math.round(summary.avg * 100)}%
                </div>
                <div className="text-[0.78rem] text-[var(--color-muted)]">
                  {m.statsAvgScore}
                </div>
              </div>
              <div>
                <div className="text-[1.6rem] font-bold tabular-nums text-[var(--color-trap)]">
                  {summary.traps}
                </div>
                <div className="text-[0.78rem] text-[var(--color-muted)]">
                  {m.statsTrapHits}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-[0.75rem] font-semibold text-[var(--color-muted)]">
                {m.statsRecent}
              </div>
              <ul className="m-0 list-none space-y-0 overflow-hidden rounded-xl border border-[var(--color-line)] p-0">
                {results.slice(0, 10).map((r) => (
                  <li
                    key={r.ts}
                    className="flex justify-between gap-3 border-b border-[var(--color-line)] px-3 py-2.5 text-[0.9rem] last:border-b-0"
                  >
                    <span className="tabular-nums text-[var(--color-muted)]">
                      {new Date(r.ts).toLocaleString()}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {r.score}/{r.total}
                      {r.traps > 0 && (
                        <span className="ml-2 font-normal text-[var(--color-trap)]">
                          · {m.tagTrap} {r.traps}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className="mt-4 self-start rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-[0.85rem] font-semibold text-[var(--color-muted)]"
              onClick={() => {
                clearQuizResults();
                setResults([]);
              }}
            >
              {m.statsClear}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
