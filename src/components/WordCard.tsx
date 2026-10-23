import { Link } from "react-router-dom";
import type { Word } from "../types";
import { formatHsk } from "../lib/hskLabel";
import { useLang } from "../lib/lang";
import { WordTag } from "./WordTag";

export function WordCard({ word }: { word: Word }) {
  const { lang } = useLang();
  return (
    <Link
      to={`/word/${word.id}`}
      className="hover-row grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--color-line)] px-4 py-4 text-[var(--color-ink)] no-underline last:border-b-0"
    >
      <span className="min-w-0">
        <span className="font-han mr-2 text-[1.4rem] font-bold text-[var(--color-brand)]">
          {word.zh}
        </span>
        <span className="text-[0.88rem] text-[var(--color-muted)]">
          {word.pinyin}
        </span>
        <span className="mt-0.5 block text-[0.88rem] text-[var(--color-muted)]">
          <span className="whitespace-nowrap">{word.hanviet}</span>
          {" · "}
          {formatHsk(word.hsk, lang)}
        </span>
      </span>
      <WordTag word={word} />
    </Link>
  );
}
