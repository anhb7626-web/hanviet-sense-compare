import { useEffect, useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  autoFocus?: boolean;
  large?: boolean;
};

export function SearchBox({
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  autoFocus,
  large,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--color-brand-mid)]"
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) onSubmit(value);
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`w-full min-w-0 border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] transition-[border-color,box-shadow] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-soft)] focus:outline-none ${
          large
            ? "rounded-2xl py-3.5 pr-4 pl-11 text-[1.05rem] shadow-[0_1px_0_rgba(12,45,94,0.04)]"
            : "rounded-xl py-2.5 pr-3 pl-10 text-base"
        }`}
      />
    </div>
  );
}
