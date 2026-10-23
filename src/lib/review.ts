import { getSavedIds, getWrongWordIds } from "./storage";

const REVIEW_KEY = "hanviet-review-v1";

const DAY = 24 * 60 * 60 * 1000;

export type ReviewEntry = {
  wordId: string;
  /** timestamp ms */
  dueAt: number;
  /** số lần bấm “Nhớ rồi” liên tiếp */
  streak: number;
  source: "wrong" | "saved" | "manual";
};

function read(): ReviewEntry[] {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReviewEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: ReviewEntry[]) {
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(list));
  } catch {
    /* private mode / quota */
  }
}

function upsert(wordId: string, patch: Partial<ReviewEntry>) {
  if (!wordId) return;
  const cur = read();
  const i = cur.findIndex((x) => x.wordId === wordId);
  const base: ReviewEntry =
    i >= 0
      ? cur[i]!
      : { wordId, dueAt: Date.now(), streak: 0, source: "manual" };
  const next = { ...base, ...patch, wordId };
  if (i >= 0) cur[i] = next;
  else cur.push(next);
  write(cur);
}

/** Sai trong quiz → ôn sau 1 ngày. */
export function scheduleAfterWrong(wordIds: string[]) {
  const due = Date.now() + DAY;
  for (const id of [...new Set(wordIds.filter(Boolean))]) {
    upsert(id, { dueAt: due, streak: 0, source: "wrong" });
  }
}

/** Lưu từ → đưa vào hàng ôn (có thể ôn ngay). */
export function scheduleSaved(wordId: string) {
  upsert(wordId, {
    dueAt: Date.now(),
    source: "saved",
  });
}

export function markRemembered(wordId: string) {
  const cur = read().find((x) => x.wordId === wordId);
  const streak = (cur?.streak ?? 0) + 1;
  const days = streak >= 2 ? 7 : 3;
  upsert(wordId, {
    streak,
    dueAt: Date.now() + days * DAY,
  });
}

export function markForgot(wordId: string) {
  upsert(wordId, {
    streak: 0,
    dueAt: Date.now() + DAY,
    source: "wrong",
  });
}

/** Đồng bộ từ wrong/saved cũ vào lịch (lần đầu). */
export function ensureReviewSeeded() {
  const cur = read();
  const known = new Set(cur.map((x) => x.wordId));
  let changed = false;
  const next = [...cur];
  for (const id of getWrongWordIds()) {
    if (known.has(id)) continue;
    next.push({
      wordId: id,
      dueAt: Date.now(),
      streak: 0,
      source: "wrong",
    });
    known.add(id);
    changed = true;
  }
  for (const id of getSavedIds()) {
    if (known.has(id)) continue;
    next.push({
      wordId: id,
      dueAt: Date.now(),
      streak: 0,
      source: "saved",
    });
    known.add(id);
    changed = true;
  }
  if (changed) write(next);
}

export function getDueReviews(now = Date.now()): ReviewEntry[] {
  ensureReviewSeeded();
  return read()
    .filter((x) => x.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt);
}

export function countDueReviews(now = Date.now()): number {
  return getDueReviews(now).length;
}

export function getAllReviews(): ReviewEntry[] {
  ensureReviewSeeded();
  return read();
}
