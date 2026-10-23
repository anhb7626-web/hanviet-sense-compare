import { Link, NavLink, Outlet } from "react-router-dom";
import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";
import { LangToggle } from "./LangToggle";
import { Logo } from "./Logo";
import { RoleToggle } from "./RoleToggle";

export function Layout() {
  const { m } = useLang();
  const { teacherMode } = usePrefs();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-2.5 py-2 text-[0.875rem] font-medium no-underline transition-colors duration-150 ${
      isActive
        ? "font-semibold text-[var(--color-accent)] after:absolute after:right-2 after:bottom-0 after:left-2 after:h-0.5 after:rounded-full after:bg-[var(--color-accent)] after:content-['']"
        : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
    }`;

  const shellPad =
    "mx-auto w-full max-w-[720px] px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]";

  return (
    <div className="flex min-h-svh w-full flex-col">
      <header className="no-print sticky top-0 z-20 w-full border-b border-[var(--color-line)] bg-[var(--color-bg)]/90 backdrop-blur-md">
        <div className={shellPad}>
          <div className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <Logo compact subtitle={m.siteSubtitle} />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
            <nav className="flex min-w-0 flex-wrap items-center gap-0.5">
              <NavLink to="/" end className={navClass}>
                {m.navHome}
              </NavLink>
              <NavLink to="/words" className={navClass}>
                {m.navLookup}
              </NavLink>
              <NavLink to="/quiz" className={navClass}>
                {m.navQuiz}
              </NavLink>
              <NavLink to="/saved" className={navClass}>
                {m.navSaved}
              </NavLink>
              {teacherMode && (
                <NavLink to="/research" className={navClass}>
                  {m.navStats}
                </NavLink>
              )}
              <NavLink to="/about" className={navClass}>
                {m.navAbout}
              </NavLink>
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <RoleToggle />
              <LangToggle />
            </div>
          </div>
        </div>
      </header>

      <div className={`${shellPad} flex-1`}>
        <main className="py-7">
          <Outlet />
        </main>
      </div>

      <footer className="no-print mt-auto w-full border-t border-[var(--color-line)] bg-[var(--color-bg)]/90 py-4 text-[0.75rem] text-[var(--color-muted)]">
        <div className={shellPad}>
          <p className="m-0">
            {m.footer}
            {" · "}
            <Link
              to="/about"
              className="text-[var(--color-accent)] no-underline hover:underline"
            >
              {m.navAbout}
            </Link>
            {teacherMode && (
              <>
                {" · "}
                <Link
                  to="/research"
                  className="text-[var(--color-accent)] no-underline hover:underline"
                >
                  {m.navStats}
                </Link>
              </>
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
