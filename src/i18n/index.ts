import type { Lang } from "../types";
import { vi, type Messages } from "./vi";
import { zh } from "./zh";

export type { Messages };
export { vi, zh };

const map: Record<Lang, Messages> = { vi, zh };

export function t(lang: Lang): Messages {
  return map[lang];
}
