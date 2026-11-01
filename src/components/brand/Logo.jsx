export default function Logo({ className = "", compact = false }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
        <rect x="2.5" y="2.5" width="35" height="35" rx="11" fill="#E5322B" stroke="#1B1D22" strokeWidth="2.5" />
        <circle cx="18" cy="17" r="7.5" fill="#fff" stroke="#1B1D22" strokeWidth="1.5" opacity="0.15" />
        <circle cx="18" cy="17" r="7.5" fill="none" stroke="#fff" strokeWidth="3" />
        <path d="M23.6 22.6 30 29" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
        <path
          d="M14.3 17.4l2.7 2.7 4.8-5.3"
          stroke="#FFCB1F"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {!compact && (
        <span className="font-display text-[26px] leading-none font-extrabold tracking-tight text-brand-ink">
          Shin<span className="text-brand-red">Check</span>
        </span>
      )}
    </span>
  );
}