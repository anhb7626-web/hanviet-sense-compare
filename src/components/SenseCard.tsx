import { SurveyBar } from "./SurveyBar";
import type { Sense, SurveyItem } from "../types";
import { examplesOf, tests } from "../lib/data";
import { useLang } from "../lib/lang";
import { itemByTestId } from "../lib/survey";
import { displayNote } from "../lib/text";

function relMeta(
  relation: Sense["relation"],
  m: ReturnType<typeof useLang>["m"],
) {
  switch (relation) {
    case "same":
      return { label: m.relSame, trap: false };
    case "zh_only":
      return { label: m.relZhOnly, trap: true };
    case "vi_only":
      return { label: m.relViOnly, trap: true };
    case "diff":
      return { label: m.relDiff, trap: true };
  }
}

/** Một thanh / nghĩa: ưu tiên câu bẫy (trapRate cao), rồi câu T-*. */
function pickSurveyItem(items: SurveyItem[]): SurveyItem | null {
  if (!items.length) return null;
  const withTrap = items.filter((i) => i.trapRate != null && i.trapRate > 0);
  if (withTrap.length) {
    return [...withTrap].sort(
      (a, b) => (b.trapRate ?? 0) - (a.trapRate ?? 0),
    )[0];
  }
  const pretest = items.find((i) => i.testId?.startsWith("T"));
  return pretest ?? items[0];
}

export function SenseCard({ sense, index }: { sense: Sense; index: number }) {
  const { m } = useLang();
  const meta = relMeta(sense.relation, m);
  const zhEx = examplesOf(sense.id, "zh");
  const viEx = examplesOf(sense.id, "vi");
  const defZh = displayNote(sense.def_zh);
  const defVi = displayNote(sense.def_vi);
  const surveyItem = pickSurveyItem(
    tests
      .filter((t) => t.senseId === sense.id)
      .map((t) => itemByTestId(t.id))
      .filter((x): x is NonNullable<typeof x> => x != null),
  );

  return (
    <article
      className={`hover-lift overflow-hidden rounded-2xl border bg-[var(--color-panel)] ${
        meta.trap
          ? "border-[var(--color-trap)]/40"
          : "border-[var(--color-line)]"
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 ${
          meta.trap
            ? "border-[var(--color-trap)]/15 bg-[var(--color-trap-soft)]/70"
            : "border-[var(--color-line)] bg-[var(--color-accent-soft)]/45"
        }`}
      >
        <b className="text-[0.95rem]">{m.senseN(index + 1)}</b>
        <span
          className={`max-w-[12rem] rounded-full px-2.5 py-0.5 text-center text-[0.7rem] leading-snug font-semibold sm:max-w-none ${
            meta.trap
              ? "bg-[var(--color-panel)] text-[var(--color-trap)]"
              : "bg-[var(--color-ok-soft)] text-[var(--color-ok)]"
          }`}
        >
          {meta.label}
        </span>
      </div>
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="border-b border-[var(--color-line)] px-4 py-4 sm:border-r sm:border-b-0">
          <div className="mb-1.5 text-[0.68rem] font-semibold tracking-wider text-[var(--color-muted)] uppercase">
            {m.colZh}
          </div>
          {defZh ? (
            <div className="font-han text-[1.05rem] leading-relaxed">{defZh}</div>
          ) : (
            <div className="text-[0.9rem] text-[var(--color-muted)]">—</div>
          )}
          {zhEx.length > 0 && (
            <ul className="mt-3 list-none space-y-1.5 p-0 text-[0.9rem] text-[var(--color-muted)]">
              {zhEx.map((e) => (
                <li key={e.id} className="font-han flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-mist)]" />
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          className={`px-4 py-4 ${
            meta.trap ? "bg-[var(--color-trap-soft)]/40" : ""
          }`}
        >
          <div
            className={`mb-1.5 text-[0.68rem] font-semibold tracking-wider uppercase ${
              meta.trap ? "text-[var(--color-trap)]" : "text-[var(--color-muted)]"
            }`}
          >
            {m.colVi}
          </div>
          {defVi ? (
            <div
              className="text-[1.02rem] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: defVi }}
            />
          ) : (
            <div className="text-[0.9rem] text-[var(--color-muted)]">—</div>
          )}
          {viEx.length > 0 && (
            <ul className="mt-3 list-none space-y-1.5 p-0 text-[0.9rem] text-[var(--color-muted)]">
              {viEx.map((e) => (
                <li key={e.id} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-mist)]" />
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {surveyItem && (
        <div className="border-t border-[var(--color-line)] px-4 py-3">
          <SurveyBar item={surveyItem} />
        </div>
      )}
    </article>
  );
}
