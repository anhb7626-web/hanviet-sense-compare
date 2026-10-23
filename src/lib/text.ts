/** Chuỗi placeholder trong dữ liệu sơ bộ — không hiện ra UI. */
const PLACEHOLDER =
  /^(（\s*待补充\s*）|（\s*中文说明待补充\s*）|\(\s*待补充\s*\)|待补充)$/;

export function isPlaceholder(text: string | undefined | null): boolean {
  if (!text) return true;
  const t = text.trim();
  if (!t) return true;
  if (PLACEHOLDER.test(t)) return true;
  if (/^（[^）]*待补充[^）]*）$/.test(t)) return true;
  return false;
}

export function hasTodo(text: string | undefined | null): boolean {
  if (!text) return false;
  return /TODO[:：]/i.test(text) || /待补充/.test(text);
}

/** Ẩn placeholder / TODO — không hiện ra giao diện. */
export function displayNote(text: string | undefined | null): string {
  if (!text) return "";
  const t = text.trim();
  if (!t || isPlaceholder(t) || hasTodo(t)) return "";
  return t;
}

/**
 * gist_zh trên UI: chỉ hiện khi đã hoàn chỉnh.
 * TODO / 待补充 → ẩn (điền qua src/data/zh_todo.json).
 */
export function displayGistZh(
  _wordId: string,
  gistZh: string | undefined | null,
): string {
  return displayNote(gistZh);
}

/**
 * warn_zh trên UI: chỉ hiện khi đã hoàn chỉnh.
 * TODO → ẩn (điền qua src/data/zh_todo.json).
 */
export function displayWarnZh(
  _senseId: string,
  warnZh: string | undefined | null,
): string {
  return displayNote(warnZh);
}

export function forLearner(text: string | undefined | null): string {
  return displayNote(text);
}
