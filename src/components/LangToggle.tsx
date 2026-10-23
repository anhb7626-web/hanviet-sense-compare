import { useLang } from "../lib/lang";

export function LangToggle({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang, m } = useLang();

  return (
    <div
      className={`inline-flex overflow-hidden rounded-full text-xs font-semibold ${
        onDark
          ? "border border-white/30 bg-white/10"
          : "border border-[var(--color-line)] bg-[var(--color-bg)]"
      }`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={`px-2.5 py-1.5 ${
          lang === "vi"
            ? "bg-[var(--color-accent)] text-white"
            : onDark
              ? "text-white/80"
              : "text-[var(--color-muted)]"
        }`}
        aria-pressed={lang === "vi"}
        onClick={() => setLang("vi")}
      >
        {m.langVi}
      </button>
      <button
        type="button"
        className={`px-2.5 py-1.5 ${
          lang === "zh"
            ? "bg-[var(--color-accent)] text-white"
            : onDark
              ? "text-white/80"
              : "text-[var(--color-muted)]"
        }`}
        aria-pressed={lang === "zh"}
        onClick={() => setLang("zh")}
      >
        {m.langZh}
      </button>
    </div>
  );
}
