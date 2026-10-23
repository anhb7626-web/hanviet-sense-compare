import { Link } from "react-router-dom";
import { CorpusPanel } from "../components/CorpusPanel";
import { ResearchDiagram } from "../components/ResearchDiagram";
import { useLang } from "../lib/lang";
import { usePrefs } from "../lib/prefs";

export function AboutPage() {
  const { m } = useLang();
  const { teacherMode } = usePrefs();

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-[40rem]">
        <h1 className="m-0 text-xl font-bold">{m.aboutTitle}</h1>
        <p className="mt-2 mb-0 text-[0.95rem] text-[var(--color-muted)]">
          {m.aboutLead}
        </p>
      </div>

      {teacherMode && (
        <>
          <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h2 className="mt-0 mb-3 text-[0.95rem] font-bold">
              {m.aboutMethod}
            </h2>
            <ResearchDiagram />
            <ol className="mt-4 mb-0 list-decimal space-y-1.5 pl-5 text-[0.88rem] text-[var(--color-muted)]">
              <li>{m.aboutMethod1}</li>
              <li>{m.aboutMethod2}</li>
              <li>{m.aboutMethod3}</li>
            </ol>
          </section>
          <CorpusPanel />
        </>
      )}

      <section className="border-t border-[var(--color-line)] pt-4">
        <p className="font-han m-0 text-[0.85rem] leading-relaxed text-[var(--color-muted)]">
          {m.aboutThesisTitle}
        </p>
        <p className="mt-2 mb-0 text-[0.8rem] text-[var(--color-muted)]">
          {m.aboutCiteText}
        </p>
      </section>

      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        <Link to="/words" className="text-[var(--color-accent)]">
          {m.navLookup}
        </Link>
        <Link to="/quiz" className="text-[var(--color-accent)]">
          {m.navQuiz}
        </Link>
      </div>
    </div>
  );
}
