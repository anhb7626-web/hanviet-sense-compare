import type { SurveyItem } from "../types";
import { useLang } from "../lib/lang";
import { breakdown, pct } from "../lib/survey";

/** Một dòng dễ hiểu cho học sinh — không thanh thống kê. */
export function SurveyHint({ item }: { item: SurveyItem }) {
  const { m } = useLang();
  const b = breakdown(item);
  return (
    <p className="m-0 rounded-xl bg-[var(--color-bg)]/80 px-3 py-2 text-[0.88rem] text-[var(--color-muted)]">
      {m.surveyLearnerHint(pct(b.trap), pct(b.ok))}
    </p>
  );
}
