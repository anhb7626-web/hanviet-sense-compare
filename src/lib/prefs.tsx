import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  countDueReviews,
  scheduleAfterWrong,
  scheduleSaved,
} from "./review";
import {
  clearSaved,
  getRole,
  getSavedIds,
  getWrongWordIds,
  setRole as persistRole,
  setWrongWordIds,
  toggleSaved as toggleSavedStore,
  type UserRole,
} from "./storage";

type PrefsCtx = {
  role: UserRole;
  setRole: (r: UserRole) => void;
  /** alias: giáo viên = true */
  teacherMode: boolean;
  setTeacherMode: (on: boolean) => void;
  savedIds: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  clearAllSaved: () => void;
  wrongWordIds: string[];
  recordWrongWords: (ids: string[]) => void;
  clearWrongWords: () => void;
  dueReviewCount: number;
  refreshDueCount: () => void;
};

const Ctx = createContext<PrefsCtx | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(getRole);
  const [savedIds, setSavedIds] = useState(getSavedIds);
  const [wrongWordIds, setWrongState] = useState(getWrongWordIds);
  const [dueReviewCount, setDueCount] = useState(() => countDueReviews());

  const refreshDueCount = useCallback(() => {
    setDueCount(countDueReviews());
  }, []);

  const setRole = useCallback((r: UserRole) => {
    persistRole(r);
    setRoleState(r);
  }, []);

  const setTeacherMode = useCallback(
    (on: boolean) => setRole(on ? "teacher" : "student"),
    [setRole],
  );

  const toggleSaved = useCallback((id: string) => {
    const on = toggleSavedStore(id);
    if (on) scheduleSaved(id);
    setSavedIds(getSavedIds());
    setDueCount(countDueReviews());
  }, []);

  const clearAllSaved = useCallback(() => {
    clearSaved();
    setSavedIds([]);
    setDueCount(countDueReviews());
  }, []);

  const recordWrongWords = useCallback((ids: string[]) => {
    const next = [...new Set([...getWrongWordIds(), ...ids.filter(Boolean)])];
    setWrongWordIds(next);
    setWrongState(next);
    scheduleAfterWrong(ids);
    setDueCount(countDueReviews());
  }, []);

  const clearWrongWords = useCallback(() => {
    setWrongWordIds([]);
    setWrongState([]);
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      teacherMode: role === "teacher",
      setTeacherMode,
      savedIds,
      isSaved: (id: string) => savedIds.includes(id),
      toggleSaved,
      clearAllSaved,
      wrongWordIds,
      recordWrongWords,
      clearWrongWords,
      dueReviewCount,
      refreshDueCount,
    }),
    [
      role,
      setRole,
      setTeacherMode,
      savedIds,
      toggleSaved,
      clearAllSaved,
      wrongWordIds,
      recordWrongWords,
      clearWrongWords,
      dueReviewCount,
      refreshDueCount,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrefs within PrefsProvider");
  return ctx;
}
