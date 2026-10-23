import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { WordCard } from "../components/WordCard";
import {
  isTrapWord,
  matchWord,
  stripTone,
  words,
} from "../lib/data";
import { hskBucket, hskSortKey, HSK_BUCKETS, type HskBucketId } from "../lib/hsk";
import { corpusTierCounts } from "../lib/learn";
import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";
import { wordMaxTrapRate } from "../lib/survey";
import type { Word } from "../types";

type FilterKind = "all" | "trap" | "same";
type SortKey = "default" | "hsk" | "trap";

function parseKind(raw: string | null): FilterKind {
  if (raw === "trap" || raw === "same" || raw === "all") return raw;
  return "all";
}

const GROUP_ORDER = ["A", "B", "C", "R"] as const;

export function WordsPage() {
  const { lang, m } = useLang();
  const { teacherMode } = usePrefs();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [kind, setKind] = useState<FilterKind>(() =>
    parseKind(params.get("kind")),
  );
  const [showRef, setShowRef] = useState(() => params.get("ref") === "1");
  const [group, setGroup] = useState("");
  const [hsk, setHsk] = useState<"" | HskBucketId>("");
  const [sort, setSort] = useState<SortKey>("default");
  const counts = useMemo(() => corpusTierCounts(), []);

  useEffect(() => {
    setKind(parseKind(params.get("kind")));
    if (params.get("ref") === "1") setShowRef(true);
  }, [params]);

  const setKindAndUrl = (k: FilterKind) => {
    setKind(k);
    const next = new URLSearchParams(params);
    if (k === "all") next.delete("kind");
    else next.set("kind", k);
    setParams(next, { replace: true });
  };

  const setShowRefAndUrl = (on: boolean) => {
    setShowRef(on);
    const next = new URLSearchParams(params);
    if (on) next.set("ref", "1");
    else next.delete("ref");
    setParams(next, { replace: true });
  };

  const groupLabel = (g: string) => {
    if (g === "A") return m.groupA;
    if (g === "B") return m.groupB;
    if (g === "C") return m.groupC;
    if (g === "R") return m.groupR;
    return g;
  };

  const filtered = useMemo(() => {
    const qTrim = q.trim();
    const exactZh = qTrim.length > 0 && /[\u4e00-\u9fff]/.test(qTrim);

    let list = words.filter((w) => {
      // Học sinh: ẩn classified trừ khi gõ đúng chữ Hán của từ
      if (!teacherMode) {
        if (w.tier === "classified") {
          if (!exactZh || w.zh !== qTrim) return false;
        }
      } else if (!showRef && w.tier !== "tested") {
        return false;
      }

      if (!matchWord(w, q)) return false;
      if (teacherMode && group && w.group !== group) return false;
      if (hsk && hskBucket(w.hsk) !== hsk) return false;
      if (kind === "trap") return isTrapWord(w);
      if (kind === "same") return !isTrapWord(w);
      return true;
    });

    const sorted = [...list];
    if (sort === "hsk") {
      sorted.sort(
        (a, b) =>
          hskSortKey(a.hsk) - hskSortKey(b.hsk) ||
          stripTone(a.pinyin).localeCompare(stripTone(b.pinyin)),
      );
    } else if (sort === "trap") {
      sorted.sort((a, b) => {
        const ta = wordMaxTrapRate(a.id);
        const tb = wordMaxTrapRate(b.id);
        if (ta == null && tb == null) return 0;
        if (ta == null) return 1;
        if (tb == null) return -1;
        return tb - ta;
      });
    } else {
      sorted.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier === "tested" ? -1 : 1;
        return a.id.localeCompare(b.id);
      });
    }
    return sorted;
  }, [q, kind, group, hsk, sort, showRef, teacherMode]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-[0.82rem] font-semibold transition-colors ${
      active
        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-panel)]"
        : "border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-ink)] hover:border-[var(--color-accent)]"
    }`;

  const selectCls =
    "max-w-[11rem] truncate rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-1 text-[var(--color-ink)]";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="m-0 text-xl font-bold">{m.navLookup}</h1>
        <p className="mt-1 mb-0 text-[0.82rem] text-[var(--color-muted)]">
          {teacherMode
            ? m.listCountLine(counts.tested, counts.classified)
            : `${counts.tested} ${m.filterTierTested}`}
        </p>
      </div>
      <SearchBox
        value={q}
        onChange={(v) => {
          const next = new URLSearchParams(params);
          if (v) next.set("q", v);
          else next.delete("q");
          setParams(next, { replace: true });
        }}
        placeholder={m.listSearchPlaceholder}
        ariaLabel={m.searchAria}
        autoFocus={!!q}
      />

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["all", m.filterAll],
            ["trap", m.filterTrap],
            ["same", m.filterSame],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={chip(kind === k)}
            onClick={() => setKindAndUrl(k)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={chip(sort === "trap")}
          onClick={() => setSort(sort === "trap" ? "default" : "trap")}
        >
          {m.sortTrapShort}
        </button>
        {teacherMode && (
          <button
            type="button"
            className={chip(showRef)}
            onClick={() => setShowRefAndUrl(!showRef)}
          >
            {showRef ? m.hideReference : m.showReference(counts.classified)}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-2 text-[0.82rem] text-[var(--color-muted)]">
        <label className="flex items-center gap-1">
          {m.filterHsk}
          <select
            className={selectCls}
            value={hsk}
            onChange={(e) => setHsk(e.target.value as "" | HskBucketId)}
          >
            <option value="">{m.filterAll}</option>
            {HSK_BUCKETS.map((b) => (
              <option key={b.id} value={b.id}>
                {lang === "vi" ? b.labelVi : b.labelZh}
              </option>
            ))}
          </select>
        </label>
        {teacherMode && (
          <label className="flex items-center gap-1">
            {m.filterGroup}
            <select
              className={selectCls}
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="">{m.filterAll}</option>
              {GROUP_ORDER.map((g) => (
                <option key={g} value={g}>
                  {groupLabel(g)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-1">
          {m.sortLabel}
          <select
            className={selectCls}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="default">{m.sortDefault}</option>
            <option value="hsk">{m.sortHsk}</option>
            <option value="trap">{m.sortTrapShort}</option>
          </select>
        </label>
        <span className="ml-auto self-center tabular-nums">
          {filtered.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
        {filtered.length ? (
          filtered.map((w: Word) => <WordCard key={w.id} word={w} />)
        ) : (
          <p className="m-0 px-3 py-6 text-[var(--color-muted)]">{m.emptyList}</p>
        )}
      </div>
    </div>
  );
}
