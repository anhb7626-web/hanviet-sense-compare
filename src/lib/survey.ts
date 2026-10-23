import surveyJson from "../data/survey_2026-10.json";
import type {
  Survey,
  SurveyItem,
  SurveyPair,
  SurveyQuote,
} from "../types";

export const survey = surveyJson as Survey;

export function pct(rate: number): number {
  return Math.round(rate * 100);
}

/** Một chữ số thập phân — trang Nghiên cứu */
export function pct1(rate: number): string {
  return (rate * 100).toFixed(1);
}

export function itemsByWord(wordId: string): SurveyItem[] {
  return survey.items.filter((i) => i.wordId === wordId);
}

export function pairsByWord(wordId: string): SurveyPair[] {
  return survey.pairs.filter((p) => p.wordId === wordId);
}

export function itemByTestId(testId: string): SurveyItem | undefined {
  return survey.items.find((i) => i.testId === testId);
}

export function itemByQ(q: number): SurveyItem | undefined {
  return survey.items.find((i) => i.q === q);
}

export function quotesByWord(wordId: string): SurveyQuote[] {
  return survey.quotes.filter((q) => q.wordId === wordId);
}

/** Trap rate cao nhất của từ (null nếu chưa có số liệu). */
export function wordMaxTrapRate(wordId: string): number | null {
  const rates = itemsByWord(wordId)
    .map((i) => i.trapRate)
    .filter((x): x is number => x != null);
  if (!rates.length) return null;
  return Math.max(...rates);
}

/** Điểm kỳ vọng trung bình trên một bộ câu (tổng accuracy, thang 0–n). */
export function cohortExpectedScore(testIds: string[]): number | null {
  const rates = testIds
    .map((id) => itemByTestId(id)?.accuracy)
    .filter((x): x is number => x != null);
  if (!rates.length) return null;
  return rates.reduce((a, b) => a + b, 0);
}

export function mcnemarLabel(
  p: number,
  lang: "vi" | "zh",
): { short: string; significant: boolean; note: string } {
  if (p < 0.001)
    return {
      short: "***",
      significant: true,
      note: lang === "vi" ? "Hai nghĩa khác nhau rõ" : "两种意思差别明显",
    };
  if (p < 0.05)
    return {
      short: "*",
      significant: true,
      note: lang === "vi" ? "Hai nghĩa khác nhau rõ" : "两种意思差别明显",
    };
  if (p < 0.1)
    return {
      short: "†",
      significant: false,
      note: lang === "vi" ? "Chưa khác rõ giữa hai nghĩa" : "两种意思差别不大",
    };
  return {
    short: "n.s.",
    significant: false,
    note: lang === "vi" ? "Chưa khác rõ giữa hai nghĩa" : "两种意思差别不大",
  };
}

/** % còn lại sau đúng / bẫy / không biết (sai khác). */
export function breakdown(item: SurveyItem): {
  ok: number;
  trap: number;
  idk: number;
  other: number;
} {
  const ok = item.accuracy;
  const trap = item.trapRate ?? 0;
  const idk = item.idkRate ?? 0;
  const other = Math.max(0, 1 - ok - trap - idk);
  return { ok, trap, idk, other };
}

/** Số liệu trang chủ: câu 义务教老人 (T002). */
export function homeYiwuStats(): {
  nValid: number;
  acc: number;
  trap: number;
} {
  const item = itemByTestId("T002");
  return {
    nValid: survey.meta.nValid,
    acc: item ? pct(item.accuracy) : 0,
    trap: item?.trapRate != null ? pct(item.trapRate) : 0,
  };
}

export function surveyNValid(): number {
  return survey.meta.nValid;
}

export function surveyTrapConfidentPct(): number {
  return pct(survey.confidence.trapConfidentShare);
}
