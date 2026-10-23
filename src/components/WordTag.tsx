import { useLang } from "../lib/lang";
import { isTrapWord } from "../lib/data";
import type { Word } from "../types";

export function WordTag({ word }: { word: Word }) {
  const { m } = useLang();

  if (word.tier === "classified") {
    return (
      <span className="rounded-full bg-[var(--color-line)]/50 px-2.5 py-1 text-[0.72rem] font-semibold text-[var(--color-muted)]">
        {m.tierClassified}
      </span>
    );
  }

  if (isTrapWord(word)) {
    return (
      <span className="rounded-full bg-[var(--color-trap)] px-2.5 py-1 text-[0.72rem] font-semibold text-white">
        {m.tagTrap}
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[var(--color-ok)] px-2.5 py-1 text-[0.72rem] font-semibold text-white">
      {m.tagSame}
    </span>
  );
}
