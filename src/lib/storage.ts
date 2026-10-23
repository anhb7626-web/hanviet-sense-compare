import type { Dim } from "../types";

const SAVED_KEY = "hanviet-saved";
const RESULTS_KEY = "hanviet-quiz-results";
const TEACHER_KEY = "hanviet-teacher-mode";
const WRONG_KEY = "hanviet-wrong-words";
const ROLE_KEY = "hanviet-role";

export type UserRole = "student" | "teacher";

export type QuizResultPayload = {
  score: number;
  total: number;
  traps: number;
  answers: { id: string; choice: number; ok: boolean; trap: boolean }[];
  lang: string;
  ts: string;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getSavedIds(): string[] {
  return readJson<string[]>(SAVED_KEY, []);
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}

export function toggleSaved(id: string): boolean {
  const cur = getSavedIds();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  writeJson(SAVED_KEY, next);
  return next.includes(id);
}

export function clearSaved() {
  writeJson(SAVED_KEY, []);
}

export function getQuizResults(): QuizResultPayload[] {
  return readJson<QuizResultPayload[]>(RESULTS_KEY, []);
}

export function saveQuizResult(payload: QuizResultPayload) {
  const cur = getQuizResults();
  writeJson(RESULTS_KEY, [payload, ...cur].slice(0, 50));
}

export function clearQuizResults() {
  writeJson(RESULTS_KEY, []);
}

export function getTeacherMode(): boolean {
  try {
    return localStorage.getItem(TEACHER_KEY) === "1";
  } catch {
    return false;
  }
}

export function setTeacherMode(on: boolean) {
  try {
    localStorage.setItem(TEACHER_KEY, on ? "1" : "0");
    localStorage.setItem(ROLE_KEY, on ? "teacher" : "student");
  } catch {
    /* ignore */
  }
}

export function getRole(): UserRole {
  try {
    const r = localStorage.getItem(ROLE_KEY);
    if (r === "teacher" || r === "student") return r;
    return getTeacherMode() ? "teacher" : "student";
  } catch {
    return "student";
  }
}

export function setRole(role: UserRole) {
  try {
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(TEACHER_KEY, role === "teacher" ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function getWrongWordIds(): string[] {
  return readJson<string[]>(WRONG_KEY, []);
}

export function setWrongWordIds(ids: string[]) {
  writeJson(WRONG_KEY, [...new Set(ids.filter(Boolean))]);
}

export function mergeWrongWordIds(ids: string[]) {
  setWrongWordIds([...getWrongWordIds(), ...ids]);
}

/** Google Apps Script Web App URL — để trống thì chỉ lưu local. */
export const APPS_SCRIPT_URL = "";

export type { Dim };
