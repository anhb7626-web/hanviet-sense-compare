import type { SurveyItem } from "../types";
import { useLang } from "../lib/lang";
import { breakdown, pct, surveyNValid } from "../lib/survey";

/** Thanh ngang: đúng / bẫy Hán Việt / sai khác / không biết */
export function SurveyBar({ item }: { item: SurveyItem }) {
  const { lang, m } = useLang();
  const b = breakdown(item);
  const okP = pct(b.ok);
  const trapP = pct(b.trap);
  const otherP = pct(b.other);
  const idkP = pct(b.idk);
  const n = surveyNValid();

  const summary =
    lang === "zh"
      ? `${okP}%答对${trapP > 0 ? `；${trapP}%按越南语意思理解` : ""}。`
      : `${okP}% hiểu đúng${trapP > 0 ? `; ${trapP}% hiểu theo nghĩa tiếng Việt` : ""}.`;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)]/60 px-3 py-2.5">
      <div className="mb-1.5 text-[0.7rem] font-semibold text-[var(--color-muted)]">
        {m.surveyLearnerBar} · n = {n}
      </div>
      <div
        className="flex h-2.5 overflow-hidden rounded-full"
        title={`${m.surveyOk} ${okP}% · ${m.surveyTrap} ${trapP}% · ${m.surveyOther} ${otherP}% · ${m.surveyIdk} ${idkP}%`}
      >
        {okP > 0 && (
          <span
            className="bg-[var(--color-ok)]"
            style={{ width: `${okP}%` }}
          />
        )}
        {trapP > 0 && (
          <span
            className="bg-[var(--color-trap)]"
            style={{ width: `${trapP}%` }}
          />
        )}
        {otherP > 0 && (
          <span className="bg-[#9aa3b2]" style={{ width: `${otherP}%` }} />
        )}
        {idkP > 0 && (
          <span className="bg-[#c5cad3]" style={{ width: `${idkP}%` }} />
        )}
      </div>
      <p className="mt-2 mb-0 text-[0.85rem] text-[var(--color-ink)]">{summary}</p>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.68rem] text-[var(--color-muted)]">
        <span>
          <i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--color-ok)] not-italic" />
          {m.surveyOk}
        </span>
        <span>
          <i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[var(--color-trap)] not-italic" />
          {m.surveyTrap}
        </span>
        <span>
          <i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#9aa3b2] not-italic" />
          {m.surveyOther}
        </span>
        <span>
          <i className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#c5cad3] not-italic" />
          {m.surveyIdk}
        </span>
      </div>
    </div>
  );
}
