import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GroupAccuracyChart } from "../components/GroupAccuracyChart";
import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";
import { mcnemarLabel, pct, survey } from "../lib/survey";

type SortKey = "acc" | "trap";

export function ResearchPage() {
  const { lang, m } = useLang();
  const { teacherMode, setRole } = usePrefs();
  const [sort, setSort] = useState<SortKey>("acc");
  const [group, setGroup] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  const meta = survey.meta;
  const gA = survey.groups.A.mean;
  const gB = survey.groups.B.mean;
  const gC = survey.groups.C.mean;
  const trapA = survey.trapShare.A.share;
  const confTrap = survey.confidence.trapConfidentShare;

  const tableItems = useMemo(() => {
    let list = [...survey.items];
    if (group) list = list.filter((i) => i.group === group);
    list.sort((a, b) => {
      if (sort === "trap") {
        return (b.trapRate ?? -1) - (a.trapRate ?? -1);
      }
      return a.accuracy - b.accuracy;
    });
    return list;
  }, [sort, group]);

  if (!teacherMode) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
        <h1 className="m-0 text-xl font-bold">{m.researchTitle}</h1>
        <p className="mt-3 mb-4 text-[var(--color-muted)]">
          {m.researchTeacherOnly}
        </p>
        <button
          type="button"
          className="pressable rounded-full bg-[var(--color-accent)] px-4 py-2.5 font-semibold text-white"
          onClick={() => setRole("teacher")}
        >
          {m.roleTeacher}
        </button>
        <Link
          to="/"
          className="mt-3 ml-3 inline-block font-semibold text-[var(--color-accent)]"
        >
          ← Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="m-0 text-xl font-bold">{m.researchTitle}</h1>
        <p className="mt-1.5 mb-0 text-[0.9rem] text-[var(--color-muted)]">
          {m.researchPlainLead(meta.nValid)}
        </p>
      </div>

      {/* 4 ô tóm tắt — luôn hiện */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={String(meta.nValid)} label={m.researchNValid} />
        <StatTile
          value={`${pct(gA)}% / ${pct(gC)}%`}
          label={
            lang === "vi"
              ? "Nhóm từ lệch / đối chứng"
              : "偏移组 / 对照组"
          }
        />
        <StatTile
          value={`${pct(trapA)}%`}
          label={
            lang === "vi"
              ? "Khi sai, chọn nghĩa tiếng Việt"
              : "错时选越南语义"
          }
          accent
        />
        <StatTile
          value={`${pct(confTrap)}%`}
          label={
            lang === "vi" ? "Sai mà vẫn chắc chắn" : "错了仍很有把握"
          }
          accent
        />
      </div>

      <GroupAccuracyChart
        title={m.researchChartGroups}
        rows={[
          {
            name: "A",
            rate: gA,
            color: "#c41e3a",
            caption: m.researchGroupCapA,
          },
          {
            name: "B",
            rate: gB,
            color: "#1b4f8a",
            caption: m.researchGroupCapB,
          },
          {
            name: "C",
            rate: gC,
            color: "#2d6a4f",
            caption: m.researchGroupCapC,
          },
        ]}
      />

      <aside className="rounded-2xl border border-[var(--color-trap)]/25 bg-[var(--color-trap-soft)] px-4 py-3.5 text-[0.95rem] leading-relaxed font-medium text-[var(--color-ink)]">
        {m.researchConfidence(pct(confTrap))}
      </aside>

      <button
        type="button"
        className="pressable self-start rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-[0.85rem] font-semibold"
        onClick={() => setShowDetail((v) => !v)}
      >
        {showDetail ? m.researchHideDetail : m.researchShowDetail}
      </button>

      {showDetail && (
        <>
      {/* Cặp nghĩa */}
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 sm:p-5">
        <h2 className="mt-0 mb-1 text-[0.95rem] font-bold">
          {m.researchChartPairs}
        </h2>
        <p className="mt-0 mb-4 text-[0.78rem] text-[var(--color-muted)]">
          {lang === "vi"
            ? "Xám = nghĩa chung · Đỏ = nghĩa lệch"
            : "灰 = 相同义项 · 红 = 差异义项"}
        </p>
        <div className="flex flex-col gap-5">
          {survey.pairs.map((pair) => {
            const label = mcnemarLabel(pair.mcnemarP, lang);
            return (
              <div
                key={`${pair.wordId}-${pair.diffQ}`}
                className="rounded-xl border border-[var(--color-line)]/80 bg-[var(--color-bg)]/40 px-3 py-3 sm:px-4"
              >
                <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-han text-[1.05rem] font-semibold">
                    {pair.word}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.72rem] font-semibold ${
                      label.significant
                        ? "bg-[var(--color-trap-soft)] text-[var(--color-trap)]"
                        : "bg-[var(--color-accent-soft)] text-[var(--color-muted)]"
                    }`}
                  >
                    {label.note}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <PairBar
                    label={m.surveyPairCommon}
                    pctVal={pct(pair.commonAcc)}
                    tone="common"
                  />
                  <PairBar
                    label={m.surveyPairDiff}
                    pctVal={pct(pair.diffAcc)}
                    tone="diff"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trap share A/B */}
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 sm:p-5">
        <h2 className="mt-0 mb-4 text-[0.95rem] font-bold">
          {m.researchChartTrap}
        </h2>
        {(["A", "B"] as const).map((g) => {
          const row = survey.trapShare[g];
          const trapP = pct(row.share);
          const otherP = 100 - trapP;
          return (
            <div key={g} className="mb-5 last:mb-0">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[0.9rem] font-bold">
                  {lang === "vi" ? `Nhóm ${g}` : `${g} 组`}
                </span>
                <span className="text-[0.8rem] tabular-nums text-[var(--color-muted)]">
                  <span className="font-semibold text-[var(--color-trap)]">
                    {trapP}%
                  </span>
                  {" · "}
                  {otherP}%
                </span>
              </div>
              <div className="relative h-10 overflow-hidden rounded-xl shadow-[inset_0_1px_2px_rgba(10,39,72,0.06)]">
                <div className="absolute inset-0 flex">
                  <div
                    className="quiz-bar flex items-center justify-center bg-[var(--color-trap)] text-[0.72rem] font-bold text-white"
                    style={{ width: `${trapP}%` }}
                  >
                    {trapP >= 22 ? `${trapP}%` : ""}
                  </div>
                  <div
                    className="quiz-bar flex items-center justify-center bg-[#8b95a8] text-[0.72rem] font-bold text-white"
                    style={{ width: `${otherP}%` }}
                  >
                    {otherP >= 18 ? `${otherP}%` : ""}
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute top-0 bottom-0 z-[1] w-0 border-l-2 border-dashed border-[var(--color-ink)]/45"
                  style={{ left: "50%" }}
                  title={m.researchChance}
                />
              </div>
              <div className="mt-1.5 text-[0.7rem] text-[var(--color-muted)]">
                {m.researchChance}
              </div>
            </div>
          );
        })}
      </section>

      <p className="m-0 text-[0.85rem] text-[var(--color-muted)]">
        KR-20 = {meta.kr20.toFixed(2)}
      </p>

      {/* Bảng 50 câu */}
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="m-0 mr-auto text-[0.95rem] font-bold">
            {m.researchTableTitle}
          </h2>
          <select
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-2 py-1 text-[0.82rem]"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">{m.filterAll}</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-[0.78rem] font-semibold ${
              sort === "acc"
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-line)]"
            }`}
            onClick={() => setSort("acc")}
          >
            {m.researchSortAcc}
          </button>
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-[0.78rem] font-semibold ${
              sort === "trap"
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                : "border-[var(--color-line)]"
            }`}
            onClick={() => setSort("trap")}
          >
            {m.researchSortTrap}
          </button>
        </div>
        <div className="max-h-[28rem] overflow-auto rounded-xl border border-[var(--color-line)]">
          <table className="w-full min-w-[480px] border-collapse text-left text-[0.8rem]">
            <thead className="sticky top-0 bg-[var(--color-accent-soft)]">
              <tr>
                <th className="px-2 py-2 font-semibold">Q</th>
                <th className="px-2 py-2 font-semibold">{m.groupLabel}</th>
                <th className="px-2 py-2 font-semibold">词</th>
                <th className="px-2 py-2 font-semibold">{m.surveyOk}</th>
                <th className="px-2 py-2 font-semibold">{m.surveyTrap}</th>
                <th className="px-2 py-2 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {tableItems.map((it) => (
                <tr
                  key={it.q}
                  className="border-t border-[var(--color-line)]"
                >
                  <td className="px-2 py-1.5 tabular-nums">{it.q}</td>
                  <td className="px-2 py-1.5">{it.group}</td>
                  <td className="font-han px-2 py-1.5">{it.word}</td>
                  <td className="px-2 py-1.5 tabular-nums">{pct(it.accuracy)}%</td>
                  <td className="px-2 py-1.5 tabular-nums">
                    {it.trapRate == null ? "—" : `${pct(it.trapRate)}%`}
                  </td>
                  <td className="px-2 py-1.5">
                    {it.flag === "distractor_issue" && (
                      <span className="rounded bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[0.68rem] font-semibold text-[var(--color-accent)]">
                        {m.researchFlagIssue}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <details className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3">
        <summary className="cursor-pointer font-semibold text-[var(--color-muted)]">
          {m.researchMethodTitle}
        </summary>
        <p className="mt-2 mb-0 text-[0.88rem] text-[var(--color-muted)]">
          {m.researchMethodBody}
        </p>
        <p className="mt-2 mb-0 text-[0.8rem] text-[var(--color-muted)]">
          {lang === "zh" ? meta.note_zh : meta.note_vi}
        </p>
      </details>
        </>
      )}
    </div>
  );
}

function StatTile({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-3.5 py-3.5 shadow-[0_8px_20px_-16px_rgba(10,39,72,0.35)] ${
        accent
          ? "border-[var(--color-trap)]/25 bg-[var(--color-trap-soft)]"
          : "border-[var(--color-line)] bg-[var(--color-panel)]"
      }`}
    >
      <div
        className={`text-[1.45rem] leading-none font-bold tabular-nums tracking-tight ${
          accent ? "text-[var(--color-trap)]" : "text-[var(--color-brand)]"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-[0.72rem] leading-snug text-[var(--color-muted)]">
        {label}
      </div>
    </div>
  );
}

function PairBar({
  label,
  pctVal,
  tone,
}: {
  label: string;
  pctVal: number;
  tone: "common" | "diff";
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-[0.75rem]">
        <span className="text-[var(--color-muted)]">{label}</span>
        <span className="font-semibold tabular-nums">{pctVal}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[var(--color-line)]/60">
        <div
          className="quiz-bar h-full rounded-full"
          style={{
            width: `${pctVal}%`,
            background:
              tone === "diff"
                ? "var(--color-trap)"
                : "color-mix(in srgb, var(--color-brand) 55%, #8b95a8)",
          }}
        />
      </div>
    </div>
  );
}
