import { examplesOf, sensesOf } from "../lib/data";
import { useLang } from "../lib/lang";
import { displayNote, displayWarnZh } from "../lib/text";
import type { Word } from "../types";

/** Khối giáo viên: dùng trong lớp ~3 phút — chỉ hiện ở chế độ giáo viên */
export function ClassroomBlock({ word }: { word: Word }) {
  const { lang, m } = useLang();
  const ss = sensesOf(word.id);
  const trapSense =
    ss.find((s) => s.relation !== "same") ?? ss[0];
  if (!trapSense) return null;

  const zhEx = examplesOf(trapSense.id, "zh")[0];
  const viEx = examplesOf(trapSense.id, "vi")[0];
  const warn =
    lang === "zh"
      ? displayWarnZh(trapSense.id, trapSense.warn_zh)
      : displayNote(trapSense.warn_vi);
  const viAlt =
    viEx?.text ||
    warn.replace(/<[^>]+>/g, "") ||
    displayNote(trapSense.def_vi).replace(/<[^>]+>/g, "");

  return (
    <section className="no-print rounded-2xl border border-[var(--color-brand)]/20 bg-[var(--color-accent-soft)]/50 p-5">
      <h2 className="m-0 text-[0.95rem] font-bold text-[var(--color-brand)]">
        {m.classroomTitle}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[0.92rem]">
        {zhEx && (
          <div>
            <div className="text-[0.7rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase">
              {m.classroomTrapSentence}
            </div>
            <p className="font-han m-0 mt-1">{zhEx.text}</p>
          </div>
        )}
        <div>
          <div className="text-[0.7rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            {m.classroomAsk}
          </div>
          <p className="m-0 mt-1 text-[var(--color-ink)]">{m.classroomAskText}</p>
        </div>
        {viAlt && (
          <div>
            <div className="text-[0.7rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase">
              {m.classroomViAlt}
            </div>
            <p className="m-0 mt-1">{viAlt}</p>
          </div>
        )}
      </div>
    </section>
  );
}
