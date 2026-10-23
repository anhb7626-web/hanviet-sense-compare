import { useId } from "react";
import { Link } from "react-router-dom";

type Props = {
  compact?: boolean;
  subtitle?: string;
};

/**
 * Mark: hai mặt đối chiếu 汉 | 越 trên nền mực,
 * ấn son góc = chỗ nghĩa lệch (bẫy Hán Việt).
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="6" y1="2" x2="44" y2="46">
          <stop offset="0%" stopColor="#163a66" />
          <stop offset="55%" stopColor="#0a2748" />
          <stop offset="100%" stopColor="#06182e" />
        </linearGradient>
        <linearGradient id={`${uid}-sheen`} x1="24" y1="2" x2="24" y2="28">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="30%" cy="25%" r="55%">
          <stop offset="0%" stopColor="#5b9bd5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5b9bd5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Khối chính */}
      <rect width="48" height="48" rx="13" fill={`url(#${uid}-bg)`} />
      <rect width="48" height="48" rx="13" fill={`url(#${uid}-glow)`} />
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="12"
        stroke="#ffffff"
        strokeOpacity="0.14"
        strokeWidth="1"
      />
      <path
        d="M13 1.5h22a11.5 11.5 0 0 1 11.5 11.5V16H1.5V13A11.5 11.5 0 0 1 13 1.5z"
        fill={`url(#${uid}-sheen)`}
      />

      {/* Vạch đối chiếu */}
      <line
        x1="24"
        y1="11"
        x2="24"
        y2="33"
        stroke="#8ec5ff"
        strokeOpacity="0.55"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="24" cy="22" r="2.1" fill="#c41e3a" />
      <circle cx="24" cy="22" r="1" fill="#ffb4bf" fillOpacity="0.9" />

      {/* 汉 | 越 */}
      <text
        x="13.5"
        y="27.5"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="PingFang SC, Microsoft YaHei, Songti SC, sans-serif"
        fontSize="15.5"
        fontWeight="700"
      >
        汉
      </text>
      <text
        x="34.5"
        y="27.5"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="PingFang SC, Microsoft YaHei, Songti SC, sans-serif"
        fontSize="15.5"
        fontWeight="700"
      >
        越
      </text>

      {/* Ấn son — lệch nghĩa */}
      <circle
        cx="37.5"
        cy="37.5"
        r="5.2"
        fill="#c41e3a"
        stroke="#ffd0d6"
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />
      <text
        x="37.5"
        y="40.2"
        textAnchor="middle"
        fill="#fff8f8"
        fontFamily="PingFang SC, Microsoft YaHei, Songti SC, sans-serif"
        fontSize="7.5"
        fontWeight="700"
      >
        义
      </text>
    </svg>
  );
}

export function Logo({ compact, subtitle }: Props) {
  return (
    <Link
      to="/"
      className="group flex min-w-0 items-center gap-2.5 no-underline"
    >
      <LogoMark size={compact ? 36 : 44} />
      <span className="min-w-0">
        <span
          className={`font-han block truncate leading-tight ${
            compact ? "text-[1.05rem]" : "text-[1.18rem]"
          }`}
        >
          <span className="font-bold text-[var(--color-brand)]">汉越</span>
          <span className="font-bold text-[var(--color-ink)]">词义项对照</span>
        </span>
        {subtitle && (
          <span className="mt-0.5 hidden truncate text-[0.7rem] leading-snug text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent)] sm:block">
            {subtitle}
          </span>
        )}
      </span>
    </Link>
  );
}
