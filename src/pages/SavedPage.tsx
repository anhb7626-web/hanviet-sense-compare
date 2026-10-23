import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { examplesOf, isTrapWord, sensesOf, wordById } from "../lib/data";
import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";
import {
  getDueReviews,
  markForgot,
  markRemembered,
  type ReviewEntry,
} from "../lib/review";
import { clearQuizResults, getQuizResults } from "../lib/storage";
import { displayGistZh, displayNote } from "../lib/text";
import type { Word } from "../types";

function frontExample(word: Word): string {
  const ss = sensesOf(word.id);
  for (const s of ss) {
    if (s.relation !== "same") {
      const ex = examplesOf(s.id, "zh")[0];
      if (ex) return ex.text;
    }
  }
  for (const s of ss) {
    const ex = examplesOf(s.id, "zh")[0];
    if (ex) return ex.text;
  }
  return word.zh;
}

function tipHtml(word: Word, lang: "vi" | "zh"): string {
  if (lang === "zh") {
    return (
      displayGistZh(word.id, word.gist_zh) ||
      displayNote(word.gist_vi) ||
      ""
    );
  }
  return displayNote(word.gist_vi) || displayGistZh(word.id, word.gist_zh) || "";
}

function trapSenseNote(word: Word, lang: "vi" | "zh"): string {
  const trap = sensesOf(word.id).find((s) => s.relation !== "same");
  if (!trap) return "";
  if (lang === "zh") {
    return displayNote(trap.def_zh) || "";
  }
  return displayNote(trap.def_vi) || "";
}

export function SavedPage() {
  const { lang, m } = useLang();
  const { refreshDueCount } = usePrefs();
  const [due, setDue] = useState<ReviewEntry[]>(() => getDueReviews());
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [localResults, setLocalResults] = useState(getQuizResults);

  const card = due[idx];
  const word = card ? wordById(card.wordId) : undefined;

  const localSummary = useMemo(() => {
    if (!localResults.length) return null;
    const sessions = localResults.length;
    const avg =
      localResults.reduce((s, r) => s + r.score / r.total, 0) / sessions;
    const traps = localResults.reduce((s, r) => s + r.traps, 0);
    return { sessions, avg, traps };
  }, [localResults]);

  const advance = (remember: boolean) => {
    if (!card) return;
    if (remember) markRemembered(card.wordId);
    else markForgot(card.wordId);
    const next = getDueReviews();
    setDue(next);
    setFlipped(false);
    setIdx(0);
    refreshDueCount();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 text-xl font-bold">{m.reviewTitle}</h1>
        <p className="mt-1 mb-0 text-[0.88rem] text-[var(--color-muted)]">
          {due.length
            ? m.homeDueLine(due.length)
            : m.reviewEmpty}
        </p>
      </div>

      {!word ? (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-8 text-center">
          <p className="m-0 text-[var(--color-muted)]">{m.reviewEmpty}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              to="/quiz"
              className="pressable rounded-full bg-[var(--color-accent)] px-4 py-2 text-[0.88rem] font-semibold text-white no-underline"
            >
              {m.homeCtaQuiz}
            </Link>
            <Link
              to="/words"
              className="pressable rounded-full border border-[var(--color-line)] px-4 py-2 text-[0.88rem] font-semibold no-underline"
            >
              {m.navLookup}
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="pressable min-h-[11rem] rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-5 text-left"
            onClick={() => setFlipped((v) => !v)}
          >
            {!flipped ? (
              <>
                <div className="font-han text-[2.2rem] font-bold text-[var(--color-brand)]">
                  {word.zh}
                </div>
                <p className="font-han mt-3 mb-0 text-[1.02rem] leading-relaxed text-[var(--color-ink)]">
                  {frontExample(word)}
                </p>
              </>
            ) : (
              <>
                <div className="text-[0.72rem] font-bold text-[var(--color-trap)]">
                  {isTrapWord(word) ? m.gistTipTrap : m.gistTipOk}
                </div>
                <div
                  className="mt-2 text-[1.02rem] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tipHtml(word, lang) }}
                />
                {trapSenseNote(word, lang) && (
                  <p className="mt-3 mb-0 text-[0.9rem] text-[var(--color-muted)]">
                    {trapSenseNote(word, lang)}
                  </p>
                )}
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="pressable rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 font-semibold"
              onClick={() => advance(false)}
            >
              {m.reviewForgot}
            </button>
            <button
              type="button"
              className="pressable rounded-2xl bg-[var(--color-ok)] px-4 py-3 font-semibold text-white"
              onClick={() => advance(true)}
            >
              {m.reviewRemember}
            </button>
          </div>

          <Link
            to={`/word/${word.id}`}
            className="text-center text-[0.88rem] font-semibold text-[var(--color-accent)] no-underline hover:underline"
          >
            {m.openWordEntry} →
          </Link>
        </div>
      )}

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <h2 className="mt-0 mb-1 text-base font-bold">{m.reviewLocalStats}</h2>
        <p className="mt-0 mb-4 text-[0.82rem] text-[var(--color-muted)]">
          {m.statsLead}
        </p>
        {!localSummary ? (
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
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-bold">{localSummary.sessions}</div>
                <div className="text-[0.75rem] text-[var(--color-muted)]">
                  {m.statsSessions}
                </div>
              </div>
              <div>
                <div className="text-xl font-bold">
                  {Math.round(localSummary.avg * 100)}%
                </div>
                <div className="text-[0.75rem] text-[var(--color-muted)]">
                  {m.statsAvgScore}
                </div>
              </div>
              <div>
                <div className="text-xl font-bold">{localSummary.traps}</div>
                <div className="text-[0.75rem] text-[var(--color-muted)]">
                  {m.statsTrapHits}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 text-[0.82rem] font-semibold text-[var(--color-muted)] hover:text-[var(--color-trap)]"
              onClick={() => {
                clearQuizResults();
                setLocalResults([]);
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
