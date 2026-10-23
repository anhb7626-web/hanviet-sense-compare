import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";

export function RoleToggle() {
  const { m } = useLang();
  const { role, setRole } = usePrefs();

  return (
    <div
      className="inline-flex overflow-hidden rounded-full border border-[var(--color-line)] text-[0.75rem] font-semibold"
      role="group"
      aria-label={m.roleHint}
    >
      <button
        type="button"
        className={`px-2.5 py-1.5 ${
          role === "student"
            ? "bg-[var(--color-accent)] text-white"
            : "bg-[var(--color-panel)] text-[var(--color-muted)]"
        }`}
        aria-pressed={role === "student"}
        onClick={() => setRole("student")}
      >
        {m.roleStudent}
      </button>
      <button
        type="button"
        className={`px-2.5 py-1.5 ${
          role === "teacher"
            ? "bg-[var(--color-brand)] text-white"
            : "bg-[var(--color-panel)] text-[var(--color-muted)]"
        }`}
        aria-pressed={role === "teacher"}
        onClick={() => setRole("teacher")}
      >
        {m.roleTeacher}
      </button>
    </div>
  );
}
