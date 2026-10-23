import type { SurveyPair } from "../types";
import { useLang } from "../lib/lang";
import { itemByQ, mcnemarLabel, pct } from "../lib/survey";

function shortStem(stem: string | undefined): string {
  if (!stem) return "";
  const t = stem.replace(/<[^>]+>/g, "");
  return t.length > 28 ? `${t.slice(0, 28)}…` : t;
}

export function SurveyPairCard({
  pair,
  contextNote,
}: {
  pair: SurveyPair;
  /** Ghi chú thêm (vd. 忠实: ngữ cảnh giúp đoán) */
  contextNote?: string;
}) {
  const { lang, m } = useLang();
  const label = mcnemarLabel(pair.mcnemarP, lang);
  const commonStem = shortStem(itemByQ(pair.commonQ)?.stem);
  const diffStem = shortStem(itemByQ(pair.diffQ)?.stem);

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-[var(--color-bg)] px-3 py-3 text-center">
          <div className="text-[0.7rem] leading-snug font-semibold text-[var(--color-muted)]">
            {m.surveyPairCommon}
          </div>
          <div className="mt-1 text-[2rem] font-bold tabular-nums text-[var(--color-ink)]">
            {pct(pair.commonAcc)}%
          </div>
          {commonStem && (
            <p className="font-han mt-2 mb-0 text-[0.75rem] leading-snug text-[var(--color-muted)]">
              {commonStem}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-[var(--color-trap-soft)] px-3 py-3 text-center">
          <div className="text-[0.7rem] leading-snug font-semibold text-[var(--color-trap)]">
            {m.surveyPairDiff}
          </div>
          <div className="mt-1 text-[2rem] font-bold tabular-nums text-[var(--color-trap)]">
            {pct(pair.diffAcc)}%
          </div>
          {pair.diffTrapRate > 0 && (
            <div className="mt-1 text-[0.75rem] text-[var(--color-muted)]">
              {m.surveyTrap}: {pct(pair.diffTrapRate)}%
            </div>
          )}
          {diffStem && (
            <p className="font-han mt-2 mb-0 text-[0.75rem] leading-snug text-[var(--color-muted)]">
              {diffStem}
            </p>
          )}
        </div>
      </div>
      <p
        className={`mt-3 mb-0 text-[0.85rem] font-semibold ${
          label.significant
            ? "text-[var(--color-accent)]"
            : "text-[var(--color-muted)]"
        }`}
      >
        {label.note} ({label.short})
      </p>
      {contextNote && (
        <p className="mt-1.5 mb-0 text-[0.85rem] text-[var(--color-muted)]">
          {contextNote}
        </p>
      )}
    </div>
  );
}
