import examplesJson from "../data/examples.json";
import sensesJson from "../data/senses.json";
import testsJson from "../data/tests.json";
import wordsJson from "../data/words.json";
import type { Dim, Example, Sense, TestItem, Word } from "../types";
import {
  APPS_SCRIPT_URL,
  saveQuizResult,
  type QuizResultPayload,
} from "./storage";

export const words = wordsJson as Word[];
export const senses = sensesJson as Sense[];
export const examples = examplesJson as Example[];
export const tests = testsJson as TestItem[];

export function sensesOf(wordId: string): Sense[] {
  return senses.filter((s) => s.wordId === wordId);
}

export function examplesOf(senseId: string, lang?: "zh" | "vi"): Example[] {
  return examples.filter(
    (e) => e.senseId === senseId && (lang == null || e.lang === lang),
  );
}

export function wordById(id: string): Word | undefined {
  return words.find((w) => w.id === id);
}

export function senseById(id: string): Sense | undefined {
  return senses.find((s) => s.id === id);
}

export function isTrapWord(w: Word): boolean {
  return sensesOf(w.id).some((s) => s.relation !== "same");
}

export function dimsOfWord(wordId: string): Dim[] {
  return [...new Set(sensesOf(wordId).flatMap((s) => s.dims))];
}

export function relatedWords(w: Word, limit = 4): Word[] {
  return words
    .filter((x) => x.id !== w.id)
    .map((x) => {
      let score = 0;
      if (x.group === w.group) score += 2;
      if (x.shiftType === w.shiftType) score += 3;
      if ([...w.zh].some((ch) => x.zh.includes(ch))) score += 1;
      return { x, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.x);
}

export function allShiftTypes(): string[] {
  return [...new Set(words.map((w) => w.shiftType))].sort();
}

export function allDims(): Dim[] {
  return [
    ...new Set(senses.flatMap((s) => s.dims)),
  ].sort() as Dim[];
}

export function stripTone(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[āáǎà]/g, "a")
    .replace(/[ēéěè]/g, "e")
    .replace(/[īíǐì]/g, "i")
    .replace(/[ōóǒò]/g, "o")
    .replace(/[ūúǔù]/g, "u")
    .replace(/[ǖǘǚǜü]/g, "v")
    .toLowerCase();
}

export function matchWord(w: Word, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const qFlat = stripTone(q);
  const py = stripTone(w.pinyin);
  return (
    w.zh.includes(query.trim()) ||
    w.hanviet.toLowerCase().includes(q) ||
    w.pinyin.toLowerCase().includes(q) ||
    py.includes(qFlat) ||
    w.id.toLowerCase() === q
  );
}

export function shuffleQuizItems(items: TestItem[]): TestItem[] {
  const withWord = items.map((it) => {
    const s = senseById(it.senseId);
    return { it, wordId: s?.wordId ?? it.senseId };
  });

  const pool = [...withWord];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const result: typeof pool = [];
  const remaining = [...pool];

  while (remaining.length) {
    let picked = -1;
    const lastWid = result[result.length - 1]?.wordId;
    for (let i = 0; i < remaining.length; i++) {
      if (lastWid && remaining[i].wordId === lastWid) continue;
      picked = i;
      break;
    }
    // Không còn lựa chọn khác từ → buộc lấy (edge case ít từ)
    if (picked < 0) picked = 0;
    result.push(remaining.splice(picked, 1)[0]!);
  }

  return result.map((x) => x.it);
}

/** Lưu local; nếu có APPS_SCRIPT_URL thì gửi ẩn danh (không chặn UI). */
export function submitResult(payload: QuizResultPayload): void {
  saveQuizResult(payload);
  if (!APPS_SCRIPT_URL) return;
  try {
    void fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
  } catch {
    /* mạng lỗi thì vẫn giữ bản local */
  }
}
