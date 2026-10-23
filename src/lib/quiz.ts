import {
  dimsOfWord,
  senseById,
  shuffleQuizItems,
  tests,
  wordById,
  words,
} from "./data";
import { hskBucket, nearbyBuckets, type HskBucketId } from "./hsk";
import type { TestItem, Word } from "../types";

export type QuizPoolMode =
  | "quick"
  | "hsk"
  | "themeA"
  | "wrong"
  | "saved"
  | "word"
  | "all";

export type QuizPoolOpts = {
  hskBucket?: HskBucketId | null;
  limit?: number;
};

function wordIdOf(t: TestItem): string {
  return senseById(t.senseId)?.wordId ?? "";
}

/** Cắt N câu; không hai câu cùng từ đứng liền. */
export function takeQuizItems(items: TestItem[], n: number): TestItem[] {
  const ordered = shuffleQuizItems(items);
  if (ordered.length <= n) return ordered;

  const picked: TestItem[] = [];
  const rest = [...ordered];

  while (picked.length < n && rest.length) {
    let idx = rest.findIndex((t) => {
      const last = picked[picked.length - 1];
      if (!last) return true;
      return wordIdOf(t) !== wordIdOf(last);
    });
    if (idx < 0) idx = 0;
    picked.push(rest.splice(idx, 1)[0]!);
  }
  return picked;
}

export function testsForWordIds(wordIds: string[]): TestItem[] {
  const set = new Set(wordIds);
  const filtered = tests.filter((t) => {
    const s = senseById(t.senseId);
    return s && set.has(s.wordId);
  });
  return shuffleQuizItems(filtered);
}

export function countTestsForWord(wordId: string): number {
  return tests.filter((t) => senseById(t.senseId)?.wordId === wordId).length;
}

/**
 * 2–3 câu cho một từ: lấy hết câu của từ;
 * nếu chỉ 1 câu thì bổ sung 1–2 câu cùng chiều lệch / cùng loại shift.
 */
export function testsForSingleWord(wordId: string, target = 3): TestItem[] {
  const own = tests.filter((t) => senseById(t.senseId)?.wordId === wordId);
  if (own.length >= 2) {
    return shuffleQuizItems(own).slice(0, Math.min(target, own.length));
  }

  const word = wordById(wordId);
  if (!word) return shuffleQuizItems(own);

  const dims = new Set(dimsOfWord(wordId));
  const pad: TestItem[] = [];
  const used = new Set(own.map((t) => t.id));

  const candidates = tests.filter((t) => {
    if (used.has(t.id)) return false;
    const wid = wordIdOf(t);
    if (!wid || wid === wordId) return false;
    const w = wordById(wid);
    if (!w || w.tier !== "tested") return false;
    if (w.shiftType && word.shiftType && w.shiftType === word.shiftType)
      return true;
    const d = dimsOfWord(wid);
    return d.some((x) => dims.has(x));
  });

  const ranked = shuffleQuizItems(candidates);
  for (const t of ranked) {
    if (own.length + pad.length >= target) break;
    // ưu tiên câu có bẫy
    if (t.trap != null) pad.push(t);
  }
  for (const t of ranked) {
    if (own.length + pad.length >= target) break;
    if (!pad.includes(t) && !used.has(t.id)) pad.push(t);
  }

  // vẫn thiếu → thêm bất kỳ câu tested có bẫy
  if (own.length + pad.length < 2) {
    for (const t of shuffleQuizItems(tests)) {
      if (own.length + pad.length >= 2) break;
      const wid = wordIdOf(t);
      if (!wid || wid === wordId || used.has(t.id) || pad.includes(t)) continue;
      if (wordById(wid)?.tier !== "tested") continue;
      pad.push(t);
    }
  }

  return shuffleQuizItems([...own, ...pad]);
}

function testsForHskBucket(bucket: HskBucketId): TestItem[] {
  for (const bid of nearbyBuckets(bucket)) {
    const ids = new Set(
      words.filter((w) => hskBucket(w.hsk) === bid).map((w) => w.id),
    );
    const pool = tests.filter((t) => ids.has(wordIdOf(t)));
    if (pool.length >= 5 || bid === nearbyBuckets(bucket).at(-1)) {
      return pool;
    }
  }
  return [];
}

function testsForThemeA(): TestItem[] {
  const ids = new Set(words.filter((w) => w.group === "A").map((w) => w.id));
  return tests.filter((t) => ids.has(wordIdOf(t)));
}

export function buildQuizPool(
  mode: QuizPoolMode,
  wrongIds: string[],
  savedIds: string[],
  wordId?: string | null,
  opts?: QuizPoolOpts,
): TestItem[] {
  const limit = opts?.limit ?? 10;

  if (mode === "word" && wordId) return testsForSingleWord(wordId, 3);
  if (mode === "wrong") return takeQuizItems(testsForWordIds(wrongIds), limit);
  if (mode === "saved") return takeQuizItems(testsForWordIds(savedIds), limit);

  if (mode === "hsk") {
    const bucket = opts?.hskBucket ?? "4";
    return takeQuizItems(testsForHskBucket(bucket), limit);
  }

  if (mode === "themeA") {
    return takeQuizItems(testsForThemeA(), limit);
  }

  return takeQuizItems(tests, limit);
}

export function wordHasQuiz(word: Word): boolean {
  return word.tier === "tested" && countTestsForWord(word.id) > 0;
}
