import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DemoIllustration } from "../components/DemoIllustration";
import { SearchBox } from "../components/SearchBox";
import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";
import { homeYiwuStats } from "../lib/survey";

export function HomePage() {
  const { m } = useLang();
  const { dueReviewCount } = usePrefs();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const due = dueReviewCount;
  const yiwu = homeYiwuStats();

  const goSearch = (value: string) => {
    const v = value.trim();
    nav(v ? `/words?q=${encodeURIComponent(v)}` : "/words");
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="hero-stage">
        <div className="hero-chars" aria-hidden>
          <span>忠</span>
          <span>义</span>
        </div>
        <div className="hero-inner max-w-[34rem]">
          <p className="m-0 font-han text-[clamp(1.65rem,4vw,2.1rem)] font-bold tracking-tight text-white">
            {m.siteTitle}
          </p>
          <h1 className="mt-2 mb-0 text-[1.05rem] font-medium leading-snug text-white/75">
            {m.homeTitleBefore}
            <span className="text-[#ffb4bf]">{m.homeTitleEm}</span>
            {m.homeTitleAfter}
          </h1>

          <div className="mt-5 [&_input]:border-white/20 [&_input]:bg-white/95 [&_input]:text-[var(--color-ink)]">
            <SearchBox
              value={q}
              onChange={setQ}
              onSubmit={goSearch}
              placeholder={m.searchPlaceholder}
              ariaLabel={m.searchAria}
              large
            />
          </div>
        </div>
      </section>

      <DemoIllustration />

      <p className="m-0 text-[0.9rem] leading-relaxed text-[var(--color-muted)]">
        {m.homeEvidence(yiwu.nValid, yiwu.acc, yiwu.trap)}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          to="/quiz"
          className="pressable inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-[0.92rem] font-semibold text-white no-underline"
        >
          {m.homeCtaQuiz}
        </Link>
        <Link
          to="/saved"
          className="pressable inline-flex items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 text-[0.92rem] font-semibold text-[var(--color-ink)] no-underline"
        >
          {m.homeCtaReview}
          {due > 0 ? ` (${due})` : ""}
        </Link>
      </div>
    </div>
  );
}
