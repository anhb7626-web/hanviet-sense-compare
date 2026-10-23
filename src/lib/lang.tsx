import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { t, type Messages } from "../i18n";
import type { Lang } from "../types";

const STORAGE_KEY = "hanviet-lang";

function readLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "vi" || v === "zh") return v;
  } catch {
    /* ignore */
  }
  return "vi";
}

function writeLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  m: Messages;
};

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    writeLang(l);
    document.documentElement.lang = l === "zh" ? "zh-CN" : "vi";
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, m: t(lang) }),
    [lang, setLang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
