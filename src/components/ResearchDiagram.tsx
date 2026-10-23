import { useLang } from "../lib/lang";

export function ResearchDiagram() {
  const { lang } = useLang();
  const vi = lang === "vi";

  const steps = vi
    ? [
        { title: "Âm Hán Việt", sub: "trông quen" },
        { title: "Đoán nghĩa", sub: "theo tiếng Việt" },
        { title: "Lệch nghĩa", sub: "phạm vi / đối tượng" },
        { title: "Hiểu lệch", sub: "bẫy khi đọc câu" },
      ]
    : [
        { title: "汉越音", sub: "眼熟" },
        { title: "按越语猜", sub: "迁移理解" },
        { title: "义项偏移", sub: "范围／对象" },
        { title: "理解偏差", sub: "易混" },
      ];

  return (
    <figure className="m-0">
      <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="relative rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-2.5 py-3 text-center"
          >
            <div className="text-[0.65rem] font-semibold text-[var(--color-accent)]">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[0.88rem] font-bold text-[var(--color-ink)]">
              {s.title}
            </div>
            <div className="mt-0.5 text-[0.72rem] text-[var(--color-muted)]">
              {s.sub}
            </div>
            {i < steps.length - 1 && (
              <span
                className="absolute top-1/2 -right-1.5 z-10 hidden -translate-y-1/2 text-[var(--color-line)] sm:block"
                aria-hidden
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-[var(--color-brand)] px-3 py-2.5 text-center text-[0.85rem] font-semibold text-white">
          {vi ? "Đối chiếu nghĩa" : "义项对照"}
        </div>
        <div className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-2.5 text-center text-[0.85rem] font-semibold text-[var(--color-accent)]">
          {vi ? "Đo bằng câu hỏi" : "测题测偏误"}
        </div>
      </div>
    </figure>
  );
}
