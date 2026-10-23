import { hskBucket } from "./hsk";

/** Hiển thị cấp HSK: VI dùng số; ZH giữ nhãn gốc. */
export function formatHsk(hsk: string, lang: "vi" | "zh"): string {
  if (lang === "zh") return hsk;
  const b = hskBucket(hsk);
  switch (b) {
    case "1-3":
      if (/一|1/.test(hsk) && !/[二三]|[23]/.test(hsk)) return "HSK 1";
      if (/二|2/.test(hsk)) return "HSK 2";
      if (/三|3/.test(hsk)) return "HSK 3";
      return "HSK 1–3";
    case "4":
      return "HSK 4";
    case "5":
      return "HSK 5";
    case "6":
      return "HSK 6";
    case "7-9":
      return "HSK 7–9";
    default:
      return "Ngoài HSK";
  }
}
