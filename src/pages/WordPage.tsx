import { Link, useNavigate, useParams } from "react-router-dom";
import { ClassroomBlock } from "../components/ClassroomBlock";
import { SenseCard } from "../components/SenseCard";
import { SurveyPairCard } from "../components/SurveyPairCard";
import { WordTag } from "../components/WordTag";
import {
  isTrapWord,
  relatedWords,
  sensesOf,
  wordById,
} from "../lib/data";
import { dimLearnerLabel } from "../lib/dims";
import { pickLearnWord } from "../lib/learn";
import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";
import { wordHasQuiz } from "../lib/quiz";
import { formatHsk } from "../lib/hskLabel";
import {
  itemsByWord,
  pairsByWord,
  pct,
  quotesByWord,
} from "../lib/survey";
import { displayGistZh, displayNote } from "../lib/text";
import type { Dim } from "../types";

const ALL_DIMS: Dim[] = ["对象指向", "义项范围", "色彩", "搭配", "读音"];

export function WordPage() {
  const { id = "" } = useParams();
  const { lang, m } = useLang();
  const { isSaved, toggleSaved, teacherMode, wrongWordIds } = usePrefs();
  const nav = useNavigate();
  const word = wordById(id);

  if (!word) {
    return (
      <div>
        <Link to="/words" className="font-semibold text-[var(--color-accent)]">
          {m.backToList}
        </Link>
        <p className="mt-4 text-[var(--color-muted)]">{m.emptyList}</p>
      </div>
    );
  }

  const ss = sensesOf(word.id);
  const trap = isTrapWord(word);
  const onDims = new Set(ss.flatMap((s) => s.dims));
  const gist =
    lang === "zh"
      ? displayGistZh(word.id, word.gist_zh) ||
        displayNote(word.gist_vi) ||
        m.gistDefaultSame
      : displayNote(word.gist_vi) ||
        displayGistZh(word.id, word.gist_zh) ||
        m.gistDefaultSame;
  const related = relatedWords(word).filter(
    (w) => teacherMode || w.tier === "tested",
  );
  const saved = isSaved(word.id);
  const canQuiz = wordHasQuiz(word) || word.tier === "tested";
  const pairs = pairsByWord(word.id);
  const quotes = quotesByWord(word.id).slice(0, 2);
  const wordItems = itemsByWord(word.id);

  const tipTone = trap
    ? {
        wrap: "border-[var(--color-trap)]/30 bg-[var(--color-trap-soft)]",
        mark: "bg-[var(--color-trap)] text-white",
        label: "text-[var(--color-trap)]",
        eyebrow: m.gistTipTrap,
      }
    : word.status === "pending"
      ? {
          wrap: "border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)]",
          mark: "bg-[var(--color-accent)] text-white",
          label: "text-[var(--color-accent)]",
          eyebrow: m.gistTipLabel,
        }
      : {
          wrap: "border-[var(--color-ok)]/30 bg-[var(--color-ok-soft)]",
          mark: "bg-[var(--color-ok)] text-white",
          label: "text-[var(--color-ok)]",
          eyebrow: m.gistTipOk,
        };

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print flex flex-wrap items-center gap-2">
        <Link
          to="/words"
          className="text-sm font-semibold text-[var(--color-accent)] no-underline hover:underline"
        >
          {m.backToList}
        </Link>
        <div className="ml-auto flex flex-wrap gap-2">
          {canQuiz && (
            <Link
              to={`/quiz?word=${word.id}&mode=word&go=1`}
              className="pressable rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-[0.82rem] font-semibold text-white no-underline"
            >
              {m.quizThisWord}
            </Link>
          )}
          <button
            type="button"
            className={`pressable rounded-full px-3.5 py-1.5 text-[0.82rem] font-semibold transition-colors ${
              saved
                ? "bg-[var(--color-brand)] text-white"
                : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-ink)] hover:border-[var(--color-accent)]"
            }`}
            onClick={() => toggleSaved(word.id)}
          >
            {saved ? m.unsaveWord : m.saveWord}
          </button>
          {teacherMode && (
            <button
              type="button"
              className="pressable rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3.5 py-1.5 text-[0.82rem] font-semibold hover:border-[var(--color-accent)]"
              onClick={() => window.print()}
            >
              {m.printWord}
            </button>
          )}
        </div>
      </div>

      <header className="relative overflow-hidden rounded-[1.35rem] border border-[var(--color-line)] bg-[var(--color-panel)]">
        <div
          className="pointer-events-none absolute -right-2 top-1/2 font-han -translate-y-1/2 text-[clamp(6rem,22vw,9rem)] leading-none font-bold text-[var(--color-brand)] opacity-[0.05] select-none"
          aria-hidden
        >
          {word.zh.slice(0, 1)}
        </div>

        <div className="relative px-5 pt-7 pb-2 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-han m-0 text-[clamp(3rem,11vw,4.1rem)] leading-none font-bold tracking-tight text-[var(--color-brand)]">
                {word.zh}
              </h1>
              <p className="mt-2.5 mb-0 text-[1.08rem] tracking-wide text-[var(--color-muted)]">
                {word.pinyin}
              </p>
            </div>
            <WordTag word={word} />
          </div>
        </div>

        <div className="word-dual relative mx-5 mb-5 mt-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-accent-soft)]/60 sm:mx-8">
          <div className="px-4 py-4 sm:px-5">
            <div className="text-[0.68rem] font-bold tracking-wider text-[var(--color-muted)] uppercase">
              {m.metaHanviet}
            </div>
            <div className="mt-1 whitespace-nowrap text-[1.25rem] font-bold text-[var(--color-ink)]">
              {word.hanviet}
            </div>
          </div>
          <div className="word-dual-divider hidden sm:block" aria-hidden />
          <div className="border-t border-[var(--color-line)] px-4 py-4 sm:border-t-0 sm:px-5">
            <div className="text-[0.68rem] font-bold tracking-wider text-[var(--color-muted)] uppercase">
              {m.metaHsk}
            </div>
            <div className="mt-1 text-[1.25rem] font-bold text-[var(--color-ink)]">
              {formatHsk(word.hsk, lang)}
            </div>
          </div>
        </div>
      </header>

      {word.tier === "classified" && (
        <p className="m-0 rounded-xl border border-[var(--color-line)] bg-[#f0f2f6] px-4 py-2.5 text-[0.88rem] text-[var(--color-muted)] dark:bg-[var(--color-accent-soft)]">
          {m.tierClassifiedWarn}
        </p>
      )}

      {gist ? (
        <aside
          className={`flex gap-3.5 rounded-2xl border px-4 py-4 sm:px-5 ${tipTone.wrap}`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.85rem] font-bold ${tipTone.mark}`}
            aria-hidden
          >
            !
          </div>
          <div className="min-w-0">
            <div
              className={`text-[0.72rem] font-bold tracking-wider uppercase ${tipTone.label}`}
            >
              {tipTone.eyebrow}
            </div>
            <div
              className="mt-1 text-[1.05rem] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: gist }}
            />
          </div>
        </aside>
      ) : null}

      {teacherMode && <ClassroomBlock word={word} />}

      {!teacherMode && onDims.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[...onDims].map((d) => (
            <span
              key={d}
              className="rounded-full border border-[var(--color-trap)]/30 bg-[var(--color-trap-soft)] px-2.5 py-1 text-[0.75rem] font-semibold text-[var(--color-trap)]"
            >
              {dimLearnerLabel(d, lang)}
            </span>
          ))}
        </div>
      )}

      <div>
        <h2 className="m-0 mb-3 text-[0.95rem] font-bold text-[var(--color-ink)]">
          {m.sensesCount(ss.length)}
        </h2>
        <div className="flex flex-col gap-4">
          {ss.map((s, i) => (
            <SenseCard key={s.id} sense={s} index={i} />
          ))}
        </div>
      </div>

      <div className="no-print flex flex-wrap gap-2">
        {canQuiz && (
          <Link
            to={`/quiz?word=${word.id}&mode=word&go=1`}
            className="pressable rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-[0.9rem] font-semibold text-white no-underline"
          >
            {m.quizThisWord} →
          </Link>
        )}
        <button
          type="button"
          className="pressable rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-[0.9rem] font-semibold"
          onClick={() => {
            const next = pickLearnWord(
              wrongWordIds.filter((id) => id !== word.id),
            );
            nav(`/word/${next.id}`);
          }}
        >
          {m.wordNextLearn}
        </button>
      </div>

      {related.length > 0 && (
        <section className="no-print">
          <div className="mb-2 text-[0.75rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            {m.relatedLabel}
          </div>
          <div className="flex flex-wrap gap-2">
            {related.map((w) => (
              <Link
                key={w.id}
                to={`/word/${w.id}`}
                className="hover-chip rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-[var(--color-ink)] no-underline hover:border-[var(--color-accent)]"
              >
                <span className="font-han font-semibold">{w.zh}</span>{" "}
                <span className="text-[0.85rem] text-[var(--color-muted)]">
                  {w.hanviet}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {teacherMode && (
        <details
          className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-[0.88rem]"
          open
        >
          <summary className="cursor-pointer font-semibold text-[var(--color-muted)]">
            {m.teacherDetails}
          </summary>

          {pairs.length > 0 && (
            <div className="mt-3 flex flex-col gap-3">
              {pairs.map((pair) => (
                <SurveyPairCard
                  key={`${pair.wordId}-${pair.diffQ}`}
                  pair={pair}
                  contextNote={
                    word.id === "W002" && pair.mcnemarP >= 0.05
                      ? m.surveyContextNote
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {quotes.length > 0 && (
            <div className="mt-4">
              <div className="text-[0.72rem] font-semibold text-[var(--color-muted)]">
                {m.surveyQuotesTitle}
              </div>
              <ul className="mt-2 mb-0 list-none space-y-2 p-0">
                {quotes.map((q) => (
                  <li
                    key={`${q.wordId}-${q.q}-${q.text_vi.slice(0, 12)}`}
                    className="text-[0.92rem] italic"
                  >
                    “{lang === "zh" && q.text_zh ? q.text_zh : q.text_vi}”
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 mb-1 text-[0.72rem] font-semibold text-[var(--color-muted)]">
            {m.dimsLabel}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_DIMS.map((d) => (
              <span
                key={d}
                className={`rounded-full border px-2.5 py-0.5 ${
                  onDims.has(d)
                    ? "border-[var(--color-trap)] font-semibold text-[var(--color-trap)]"
                    : "border-[var(--color-line)] text-[var(--color-muted)]"
                }`}
              >
                {dimLearnerLabel(d, lang)}
                <span className="ml-1 text-[0.68rem] opacity-60">· {d}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 mb-0">
            {displayNote(word.shiftType)
              ? `${m.shiftTypeLabel}: ${displayNote(word.shiftType)} · `
              : ""}
            {m.groupLabel} {word.group} · {m.idLabel}: {word.id}
          </p>
          <p className="mt-1 mb-0">
            {m.basisLabel}:{" "}
            {[
              ...new Set(
                ss
                  .map((s) => displayNote(s.basis))
                  .filter(Boolean),
              ),
            ].join("；") || "—"}
          </p>
          <div className="mt-3">
            <div className="text-[0.72rem] font-semibold text-[var(--color-muted)]">
              {m.statsLabel}
            </div>
            {wordItems.length === 0 ? (
              <p className="mt-1 mb-0">{m.statsPending}</p>
            ) : (
              <ul className="mt-1 mb-0 list-disc space-y-1 pl-5 text-[0.85rem]">
                {wordItems.map((it) => (
                  <li key={it.q}>
                    Q{it.q}
                    {it.testId ? ` (${it.testId})` : ""}: {m.surveyOk}{" "}
                    {pct(it.accuracy)}%
                    {it.trapRate != null && (
                      <>
                        ; {m.surveyTrap} {pct(it.trapRate)}%
                      </>
                    )}
                    ; {m.surveyIdk} {pct(it.idkRate)}%
                  </li>
                ))}
                {pairs.map((p) => (
                  <li key={`p-${p.diffQ}`}>
                    So sánh hai nghĩa (Q{p.commonQ}/Q{p.diffQ}): p=
                    {p.mcnemarP < 0.001 ? "<.001" : p.mcnemarP.toFixed(3)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
