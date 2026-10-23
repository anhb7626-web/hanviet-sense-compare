import {
  examples,
  isTrapWord,
  senses,
  tests,
  words,
} from "./data";
import type { Dim, Relation } from "../types";

export type CorpusSnapshot = {
  wordCount: number;
  senseCount: number;
  exampleCount: number;
  testCount: number;
  trapWords: number;
  sameWords: number;
  pendingWords: number;
  verifiedWords: number;
  trapQuestions: number;
  byRelation: Record<Relation, number>;
  byDim: Partial<Record<Dim, number>>;
  byShift: { type: string; n: number }[];
  byGroup: { group: string; n: number }[];
};

export function getCorpusSnapshot(): CorpusSnapshot {
  const trapWords = words.filter(
    (w) => w.status === "verified" && isTrapWord(w),
  ).length;
  const sameWords = words.filter(
    (w) => w.status === "verified" && !isTrapWord(w),
  ).length;
  const pendingWords = words.filter((w) => w.status === "pending").length;
  const verifiedWords = words.filter((w) => w.status === "verified").length;

  const byRelation: Record<Relation, number> = {
    same: 0,
    zh_only: 0,
    vi_only: 0,
    diff: 0,
  };
  for (const s of senses) byRelation[s.relation] += 1;

  const byDim: Partial<Record<Dim, number>> = {};
  for (const s of senses) {
    for (const d of s.dims) byDim[d] = (byDim[d] ?? 0) + 1;
  }

  const shiftMap = new Map<string, number>();
  for (const w of words) {
    shiftMap.set(w.shiftType, (shiftMap.get(w.shiftType) ?? 0) + 1);
  }
  const byShift = [...shiftMap.entries()]
    .map(([type, n]) => ({ type, n }))
    .sort((a, b) => b.n - a.n);

  const groupMap = new Map<string, number>();
  for (const w of words) {
    groupMap.set(w.group, (groupMap.get(w.group) ?? 0) + 1);
  }
  const byGroup = [...groupMap.entries()]
    .map(([group, n]) => ({ group, n }))
    .sort((a, b) => a.group.localeCompare(b.group));

  return {
    wordCount: words.length,
    senseCount: senses.length,
    exampleCount: examples.length,
    testCount: tests.length,
    trapWords,
    sameWords,
    pendingWords,
    verifiedWords,
    trapQuestions: tests.filter((t) => t.trap != null).length,
    byRelation,
    byDim,
    byShift,
    byGroup,
  };
}
