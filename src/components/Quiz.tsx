import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { senseById, submitResult, wordById } from "../lib/data";
import { testGlossVi, testOptionsPy } from "../lib/gloss";
import { HSK_BUCKETS, type HskBucketId } from "../lib/hsk";
import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";
import { buildQuizPool, type QuizPoolMode } from "../lib/quiz";
import {
  cohortExpectedScore,
  itemByTestId,
  pct,
} from "../lib/survey";
import { displayNote, displayWarnZh } from "../lib/text";
import type { TestItem } from "../types";

type LogEntry = {
  id: string;
  choice: number;
  ok: boolean;
  trap: boolean;
  wordId: string;
  warn?: string;
};

function parseMode(raw: string | null, hasWord: boolean): QuizPoolMode {
  if (
    raw === "wrong" ||
    raw === "saved" ||
    raw === "word" ||
    raw === "hsk" ||
    raw === "themeA" ||
    raw === "quick"
  )
    return raw;
  if (raw === "all") return "quick";
  if (hasWord && !raw) return "word";
  return "quick";
}

function parseHsk(raw: string | null): HskBucketId {
  if (
    raw === "1-3" ||
    raw === "4" ||
    raw === "5" ||
    raw === "6" ||
    raw === "7-9" ||
    raw === "unknown"
  )
    return raw;
  return "4";
}

export function Quiz() {
  const { lang, m } = useLang();
  const { savedIds, wrongWordIds, recordWrongWords } = usePrefs();
  const [params, setParams] = useSearchParams();
  const focusWordId = params.get("word");
  const focusWord = focusWordId ? wordById(focusWordId) : undefined;
  const mode = parseMode(params.get("mode"), !!focusWordId);
  const hskLevel = parseHsk(params.get("hsk"));
  const autoGo = params.get("go") === "1";

  const [phase, setPhase] = useState<"pick" | "run" | "done">(
    autoGo ? "run" : "pick",
  );
  const [items, setItems] = useState<TestItem[]>([]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [showGloss, setShowGloss] = useState(false);
  const [showPy, setShowPy] = useState(false);

  const poolOpts = useMemo(
    () => ({ hskBucket: mode === "hsk" ? hskLevel : null, limit: 10 }),
    [mode, hskLevel],
  );

  const pool = useMemo(
    () =>
      buildQuizPool(mode, wrongWordIds, savedIds, focusWordId, poolOpts),
    [mode, wrongWordIds, savedIds, focusWordId, poolOpts],
  );

  const emptyMsg =
    mode === "wrong"
      ? m.quizModeEmptyWrong
      : mode === "saved"
        ? m.quizModeEmptySaved
        : mode === "word"
          ? m.quizModeEmptyWord
          : mode === "hsk"
            ? m.quizModeEmptyHsk
            : "";

  const writeParams = (
    nextMode: QuizPoolMode,
    opts?: { go?: boolean; keepWord?: boolean; hsk?: HskBucketId },
  ) => {
    const sp = new URLSearchParams();
    if (nextMode === "word" && (opts?.keepWord !== false) && focusWordId) {
      sp.set("mode", "word");
      sp.set("word", focusWordId);
    } else if (nextMode !== "quick" && nextMode !== "all") {
      sp.set("mode", nextMode);
    }
    if (nextMode === "hsk") {
      sp.set("hsk", opts?.hsk ?? hskLevel);
    }
    if (opts?.go) sp.set("go", "1");
    setParams(sp, { replace: true });
  };

  const begin = (nextMode: QuizPoolMode = mode) => {
    const nextPool = buildQuizPool(
      nextMode,
      wrongWordIds,
      savedIds,
      nextMode === "word" ? focusWordId : null,
      {
        hskBucket: nextMode === "hsk" ? hskLevel : null,
        limit: 10,
      },
    );
    if (!nextPool.length) {
      setPhase("pick");
      return;
    }
    setItems(nextPool);
    setQi(0);
    setScore(0);
    setLog([]);
    setPicked(null);
    setPhase("run");
    writeParams(nextMode, { go: true });
  };

  useEffect(() => {
    if (phase === "run" && items.length === 0 && pool.length > 0) {
      setItems(pool);
    }
  }, [phase, items.length, pool]);

  const selectMode = (next: QuizPoolMode) => {
    writeParams(next, { keepWord: next === "word" });
    setPhase("pick");
    setItems([]);
  };

  const it = items[qi];
  const sense = it ? senseById(it.senseId) : undefined;
  const tipWordId = sense?.wordId ?? "";
  const rawWarn =
    lang === "zh"
      ? displayWarnZh(sense?.id ?? "", sense?.warn_zh)
      : displayNote(sense?.warn_vi);
  const warn = rawWarn;

  const answer = (i: number) => {
    if (picked != null || !it) return;
    const ok = i === it.answer;
    const trapHit = !ok && it.trap != null && i === it.trap;
    if (ok) setScore((s) => s + 1);
    setLog((prev) => [
      ...prev,
      {
        id: it.id,
        choice: i,
        ok,
        trap: trapHit,
        wordId: sense?.wordId ?? "",
        warn: rawWarn || undefined,
      },
    ]);
    setPicked(i);
    setShowGloss(false);
  };

  const finish = (finalLog: LogEntry[], finalScore: number) => {
    recordWrongWords(finalLog.filter((l) => !l.ok).map((l) => l.wordId));
    submitResult({
      score: finalScore,
      total: items.length,
      traps: finalLog.filter((l) => l.trap).length,
      answers: finalLog.map(({ id, choice, ok, trap }) => ({
        id,
        choice,
        ok,
        trap,
      })),
      lang,
      ts: new Date().toISOString(),
    });
    setPhase("done");
  };

  const next = () => {
    if (qi + 1 >= items.length) {
      finish(log, score);
      return;
    }
    setQi((x) => x + 1);
    setPicked(null);
    setShowGloss(false);
    setShowPy(false);
  };

  if (phase === "pick") {
    const modes: { key: QuizPoolMode; label: string; show: boolean }[] = [
      { key: "quick", label: m.quizModeQuick, show: true },
      { key: "hsk", label: m.quizModeHsk, show: true },
      { key: "themeA", label: m.quizModeThemeA, show: true },
      { key: "wrong", label: m.quizModeWrong, show: true },
      { key: "saved", label: m.quizModeSaved, show: true },
      {
        key: "word",
        label: focusWord ? m.quizModeWord(focusWord.zh) : "",
        show: !!focusWord,
      },
    ];

    const preview = pool[0];

    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="m-0 text-xl font-bold">{m.navQuiz}</h1>
          <p className="mt-1 mb-0 text-[0.9rem] text-[var(--color-muted)]">
            {m.quizIntro}
          </p>
          {focusWord && (
            <p className="mt-2 mb-0 text-[0.88rem] text-[var(--color-muted)]">
              <span className="font-han font-semibold text-[var(--color-ink)]">
                {focusWord.zh}
              </span>{" "}
              {focusWord.hanviet}
              {" · "}
              <Link
                to={`/word/${focusWord.id}`}
                className="font-semibold text-[var(--color-accent)] no-underline hover:underline"
              >
                {m.openWordEntry}
              </Link>
            </p>
          )}
        </div>

        {preview && (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3.5">
            <div className="text-[0.7rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase">
              {m.quizPreviewLabel}
            </div>
            <p
              className="quiz-stem font-han mt-2 mb-0 text-[1.08rem] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: preview.stem }}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {modes
            .filter((x) => x.show)
            .map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`pressable rounded-full border px-3.5 py-2 text-[0.85rem] font-semibold ${
                  mode === key
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-line)] bg-[var(--color-panel)]"
                }`}
                onClick={() => selectMode(key)}
              >
                {label}
              </button>
            ))}
        </div>

        {mode === "hsk" && (
          <div>
            <div className="mb-2 text-[0.82rem] font-semibold text-[var(--color-muted)]">
              {m.quizHskPick}
            </div>
            <div className="flex flex-wrap gap-2">
              {HSK_BUCKETS.filter((b) => b.id !== "unknown").map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`pressable rounded-full border px-3.5 py-1.5 text-[0.85rem] font-semibold ${
                    hskLevel === b.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                      : "border-[var(--color-line)] bg-[var(--color-panel)]"
                  }`}
                  onClick={() =>
                    writeParams("hsk", { hsk: b.id, keepWord: false })
                  }
                >
                  {lang === "vi" ? b.labelVi : b.labelZh}
                </button>
              ))}
            </div>
          </div>
        )}

        {pool.length === 0 ? (
          <p className="m-0 text-[0.9rem] text-[var(--color-muted)]">
            {emptyMsg || m.quizModeEmptyHsk}
          </p>
        ) : (
          <button
            type="button"
            className="pressable self-start rounded-full bg-[var(--color-accent)] px-5 py-2.5 font-semibold text-white"
            onClick={() => begin(mode)}
          >
            {m.wayQuizGo} · {pool.length}
          </button>
        )}
      </div>
    );
  }

  if (phase === "done") {
    const traps = log.filter((l) => l.trap).length;
    const reviewIds = [
      ...new Set(log.filter((l) => !l.ok).map((l) => l.wordId).filter(Boolean)),
    ];
    const rules = [
      ...new Set(
        log.filter((l) => !l.ok && l.warn).map((l) => l.warn as string),
      ),
    ];
    const cohort = cohortExpectedScore(items.map((x) => x.id));
    const cohortLabel =
      cohort != null
        ? m.quizCohortAvg(cohort.toFixed(1), items.length)
        : null;

    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="text-[0.75rem] font-semibold text-[var(--color-muted)]">
          {m.resultLabel}
        </div>
        <div className="mt-2 text-[2.8rem] font-bold tabular-nums leading-none text-[var(--color-brand)]">
          {score}
          <span className="text-xl text-[var(--color-muted)]">
            /{items.length}
          </span>
        </div>
        {cohortLabel && (
          <p className="mt-3 mb-0 text-[0.92rem] text-[var(--color-muted)]">
            {cohortLabel}
          </p>
        )}
        <p
          className="mt-4 mb-0"
          dangerouslySetInnerHTML={{
            __html: traps ? m.resultTrapCount(traps) : m.resultNoTrap,
          }}
        />
        {rules.length > 0 && (
          <div className="mt-4">
            <div className="text-[0.75rem] font-semibold text-[var(--color-muted)]">
              {m.quizRulesLabel}
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.92rem]">
              {rules.map((r) => (
                <li key={r} dangerouslySetInnerHTML={{ __html: r }} />
              ))}
            </ul>
          </div>
        )}
        {reviewIds.length > 0 && (
          <div className="mt-4">
            <div className="text-[0.75rem] font-semibold text-[var(--color-muted)]">
              {m.resultReview}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {reviewIds.map((wid) => {
                const w = wordById(wid);
                if (!w) return null;
                return (
                  <Link
                    key={wid}
                    to={`/word/${wid}`}
                    className="rounded-full border border-[var(--color-trap)]/25 bg-[var(--color-trap-soft)] px-3 py-1.5 text-[0.9rem] text-[var(--color-trap)] no-underline hover:border-[var(--color-trap)]"
                  >
                    <span className="font-han font-semibold">{w.zh}</span>{" "}
                    {w.hanviet}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => begin(mode)}
            className="pressable rounded-full border border-[var(--color-line)] px-4 py-2 font-semibold"
          >
            {m.resultAgain}
          </button>
          {reviewIds.length > 0 && (
            <button
              type="button"
              className="pressable rounded-full bg-[var(--color-trap)] px-4 py-2 font-semibold text-white"
              onClick={() => {
                recordWrongWords(reviewIds);
                const nextPool = buildQuizPool("wrong", reviewIds, savedIds);
                setItems(nextPool);
                setQi(0);
                setScore(0);
                setLog([]);
                setPicked(null);
                setPhase("run");
                setParams(new URLSearchParams({ mode: "wrong", go: "1" }), {
                  replace: true,
                });
              }}
            >
              {m.resultRetryWrong}
            </button>
          )}
          {focusWord && (
            <Link
              to={`/word/${focusWord.id}`}
              className="rounded-full px-4 py-2 font-semibold text-[var(--color-accent)] no-underline hover:underline"
            >
              {m.openWordEntry} →
            </Link>
          )}
          <Link
            to="/words"
            className="rounded-full px-4 py-2 font-semibold text-[var(--color-muted)] no-underline hover:text-[var(--color-accent)]"
          >
            {m.resultBackWords}
          </Link>
        </div>
      </div>
    );
  }

  if (!it) {
    return (
      <div className="text-[var(--color-muted)]">
        {emptyMsg}
        <button
          type="button"
          className="mt-3 block font-semibold text-[var(--color-accent)]"
          onClick={() => selectMode("quick")}
        >
          {m.quizModeQuick}
        </button>
      </div>
    );
  }

  const showFb = picked != null;
  const ok = picked === it.answer;
  const trapHit =
    picked != null && !ok && it.trap != null && picked === it.trap;
  const surveyItem = itemByTestId(it.id);
  const glossVi = testGlossVi(it.id);
  const optionsPy = testOptionsPy(it.id);
  const peerLine =
    showFb && surveyItem
      ? ok
        ? m.quizPeerLikeOk(pct(surveyItem.accuracy))
        : trapHit && surveyItem.trapRate != null
          ? m.quizPeerLikeTrap(pct(surveyItem.trapRate))
          : null
      : null;

  return (
    <div
      key={it.id}
      className={`rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 ${
        showFb && trapHit ? "shake-trap" : ""
      }`}
    >
      <div className="flex justify-between text-[0.75rem] font-semibold text-[var(--color-muted)]">
        <span>{m.quizProgress(qi + 1, items.length)}</span>
        <span>{m.quizHint}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg)]">
        <div
          className="quiz-bar h-full rounded-full bg-[var(--color-accent)]"
          style={{
            width: `${((qi + (showFb ? 1 : 0)) / items.length) * 100}%`,
          }}
        />
      </div>
      <p
        className="quiz-stem font-han mt-5 mb-0 text-[1.35rem] leading-snug"
        dangerouslySetInnerHTML={{ __html: it.stem }}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {glossVi && (
          <button
            type="button"
            className="rounded-full border border-[var(--color-line)] px-3 py-1 text-[0.78rem] font-semibold"
            onClick={() => setShowGloss((v) => !v)}
          >
            {showGloss ? m.quizHideGloss : m.quizShowGloss}
          </button>
        )}
        {optionsPy && (
          <button
            type="button"
            className="rounded-full border border-[var(--color-line)] px-3 py-1 text-[0.78rem] font-semibold"
            onClick={() => setShowPy((v) => !v)}
          >
            {showPy ? m.quizHidePinyin : m.quizShowPinyin}
          </button>
        )}
      </div>
      {showGloss && glossVi && (
        <p className="mt-2 mb-0 rounded-xl bg-[var(--color-accent-soft)]/60 px-3 py-2 text-[0.92rem] text-[var(--color-ink)]">
          {glossVi}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {it.options.map((opt, i) => {
          let cls =
            "pressable min-h-[44px] rounded-xl border px-3 py-3 text-left text-[var(--color-ink)] transition-[border-color,background-color,opacity,transform] duration-200";
          if (showFb) {
            if (i === it.answer)
              cls +=
                " quiz-opt-ok border-[var(--color-ok)] bg-[var(--color-ok-soft)]";
            else if (i === picked)
              cls += " border-[var(--color-trap)] bg-[var(--color-trap-soft)]";
            else cls += " border-[var(--color-line)] opacity-45";
          } else {
            cls +=
              " cursor-pointer border-[var(--color-line)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/50 hover:translate-x-0.5";
          }
          return (
            <button
              key={i}
              type="button"
              disabled={showFb}
              className={cls}
              onClick={() => answer(i)}
            >
              <span className="mr-2 text-[0.8rem] font-semibold text-[var(--color-muted)]">
                {String.fromCharCode(65 + i)}.
              </span>
              <span className="inline-flex flex-col items-start gap-0.5">
                <span className="font-han">{opt}</span>
                {showPy && optionsPy?.[i] && (
                  <span className="text-[0.75rem] font-normal text-[var(--color-muted)]">
                    {optionsPy[i]}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {showFb && (
        <div className="quiz-fb mt-4">
          <div
            className={`rounded-xl border-l-4 px-3 py-2.5 ${
              ok
                ? "border-[var(--color-ok)] bg-[var(--color-ok-soft)]"
                : "border-[var(--color-trap)] bg-[var(--color-trap-soft)]"
            }`}
          >
            <b>{ok ? m.quizCorrect : trapHit ? m.quizTrap : m.quizWrong} </b>
            {warn && <span dangerouslySetInnerHTML={{ __html: warn }} />}
            {peerLine && (
              <p className="mt-2 mb-0 text-[0.9rem] font-normal text-[var(--color-muted)]">
                {peerLine}
              </p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            {!ok && tipWordId && (
              <Link
                to={`/word/${tipWordId}`}
                className="pressable rounded-full border border-[var(--color-trap)]/30 bg-[var(--color-trap-soft)] px-4 py-2 text-[0.88rem] font-semibold text-[var(--color-trap)] no-underline"
              >
                {m.quizOpenTip}
              </Link>
            )}
            <button
              type="button"
              onClick={next}
              className="pressable min-h-[44px] rounded-full bg-[var(--color-accent)] px-5 py-2.5 font-semibold text-white"
            >
              {qi + 1 < items.length ? m.quizNext : m.quizSeeResult}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
