/** Gom cấp HSK thành bucket lọc / quiz. */
export type HskBucketId = "1-3" | "4" | "5" | "6" | "7-9" | "unknown";

export const HSK_BUCKETS: {
  id: HskBucketId;
  labelVi: string;
  labelZh: string;
}[] = [
  { id: "1-3", labelVi: "1–3", labelZh: "1–3级" },
  { id: "4", labelVi: "4", labelZh: "4级" },
  { id: "5", labelVi: "5", labelZh: "5级" },
  { id: "6", labelVi: "6", labelZh: "6级" },
  { id: "7-9", labelVi: "7–9", labelZh: "7–9级" },
  { id: "unknown", labelVi: "Không rõ", labelZh: "不明" },
];

const ORDER: HskBucketId[] = ["1-3", "4", "5", "6", "7-9", "unknown"];

export function hskBucket(hsk: string): HskBucketId {
  const s = hsk.trim();
  if (/七|八|九|7|8|9/.test(s)) return "7-9";
  if (/六|6/.test(s)) return "6";
  if (/五|5/.test(s)) return "5";
  if (/四|4/.test(s)) return "4";
  if (/一|二|三|1|2|3/.test(s)) return "1-3";
  return "unknown";
}

/** Thứ tự gần nhất để gộp khi bucket thiếu câu. */
export function nearbyBuckets(id: HskBucketId): HskBucketId[] {
  const i = ORDER.indexOf(id);
  if (i < 0) return ORDER;
  const out: HskBucketId[] = [id];
  for (let d = 1; d < ORDER.length; d++) {
    if (i - d >= 0) out.push(ORDER[i - d]!);
    if (i + d < ORDER.length) out.push(ORDER[i + d]!);
  }
  return out;
}

export function hskSortKey(hsk: string): number {
  const b = hskBucket(hsk);
  const base = ORDER.indexOf(b) * 10;
  if (b === "1-3") {
    if (/一|1/.test(hsk) && !/二|三|2|3/.test(hsk)) return base;
    if (/二|2/.test(hsk)) return base + 1;
    return base + 2;
  }
  return base;
}
