import { isTrapWord, words, wordById } from "./data";
import { wordMaxTrapRate } from "./survey";
import type { Word } from "../types";

const testedTraps = () =>
  words.filter((w) => w.tier === "tested" && isTrapWord(w));

/** Ưu tiên từ đã sai (tested); không có thì lấy ngẫu nhiên từ có bẫy đã khảo sát. */
export function pickLearnWord(wrongWordIds: string[]): Word {
  const traps = testedTraps();
  const fromWrong = wrongWordIds
    .map((id) => wordById(id))
    .filter((w): w is Word => w != null && w.tier === "tested" && isTrapWord(w));
  const pool = fromWrong.length ? fromWrong : traps.length ? traps : words.filter((w) => w.tier === "tested");
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/**
 * 6 chip trang chủ: từ tested có bẫy, ưu tiên trapRate cao,
 * rồi lấy ngẫu nhiên trong nhóm đầu.
 */
export function pickHomeTrapChips(n = 6): Word[] {
  const traps = testedTraps();
  const ranked = [...traps].sort((a, b) => {
    const ta = wordMaxTrapRate(a.id) ?? 0;
    const tb = wordMaxTrapRate(b.id) ?? 0;
    return tb - ta;
  });
  const top = ranked.slice(0, Math.max(n, Math.min(12, ranked.length)));
  for (let i = top.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [top[i], top[j]] = [top[j]!, top[i]!];
  }
  return top.slice(0, Math.min(n, top.length));
}

export function corpusTierCounts(): { tested: number; classified: number; total: number } {
  let tested = 0;
  let classified = 0;
  for (const w of words) {
    if (w.tier === "tested") tested++;
    else classified++;
  }
  return { tested, classified, total: words.length };
}
