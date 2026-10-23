import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../lib/lang";

const DEMO_WORD_ID = "W001";

export function DemoIllustration() {
  const { m } = useLang();
  const rootRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.28 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={rootRef}
      className={`demo-scene overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] ${
        inView ? "is-in" : ""
      }`}
    >
      <header className="border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-han text-[1.75rem] font-bold text-[var(--color-brand)]">
            义务
          </span>
          <span className="text-[0.9rem] text-[var(--color-muted)]">
            yìwù · nghĩa vụ
          </span>
          <span className="rounded-full bg-[var(--color-trap-soft)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--color-trap)]">
            {m.tagTrap}
          </span>
        </div>
      </header>

      <div className="grid gap-0 sm:grid-cols-2">
        <div className="demo-step demo-step-1 border-b border-[var(--color-line)] px-5 py-4 sm:border-r sm:border-b-0 sm:px-6">
          <div className="mb-1.5 text-[0.7rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            {m.demoThink}
          </div>
          <p className="m-0 text-[1rem] text-[var(--color-muted)] line-through decoration-[var(--color-trap)]/40">
            {m.demoThinkText}
          </p>
        </div>
        <div className="demo-step demo-step-2 bg-[var(--color-trap-soft)]/50 px-5 py-4 sm:px-6">
          <div className="mb-1.5 text-[0.7rem] font-semibold tracking-wide text-[var(--color-trap)] uppercase">
            {m.demoReal}
          </div>
          <p className="font-han m-0 text-[1.02rem] leading-relaxed">
            他周末去社区
            <mark className="han-underline mx-0.5 rounded-sm bg-[var(--color-trap)]/10 px-0.5 font-semibold text-[var(--color-trap)]">
              义务
            </mark>
            教老人用手机。
          </p>
          <p className="mt-2 mb-0 text-[0.92rem] font-semibold text-[var(--color-trap)]">
            {m.demoRealNote}
          </p>
        </div>
      </div>

      <footer className="flex flex-wrap gap-2 border-t border-[var(--color-line)] px-5 py-3 sm:px-6">
        <Link
          to={`/word/${DEMO_WORD_ID}`}
          className="pressable rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-[0.82rem] font-semibold text-[var(--color-ink)] no-underline"
        >
          {m.demoOpenWord}
        </Link>
        <Link
          to={`/quiz?word=${DEMO_WORD_ID}&mode=word&go=1`}
          className="pressable rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 text-[0.82rem] font-semibold text-white no-underline"
        >
          {m.quizThisWord}
        </Link>
      </footer>
    </article>
  );
}
