export function LogoMark({ size = 36, className = '' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#lm-bg)" />
      <path
        d="M14 48V24l18-10 18 10v24"
        stroke="white"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="20" y="30" width="6" height="6" rx="1" fill="white" />
      <rect x="29" y="30" width="6" height="6" rx="1" fill="white" />
      <rect x="38" y="30" width="6" height="6" rx="1" fill="white" />
      <rect x="20" y="40" width="6" height="6" rx="1" fill="white" />
      <rect
        x="29"
        y="40"
        width="6"
        height="6"
        rx="1"
        fill="white"
        fillOpacity="0.55"
      />
      <rect x="38" y="40" width="6" height="6" rx="1" fill="white" />
      <rect x="29" y="50" width="6" height="6" rx="1" fill="white" />
      <path
        d="M52 14l1.5 3.2L57 18l-2.7 2 .7 3.4L52 21.7 49 23.4l.7-3.4L47 18l3.5-.8L52 14z"
        fill="#fde68a"
      />
    </svg>
  );
}

export function Logo({ size = 36, className = '', wordmark = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} />
      {wordmark && (
        <div className="leading-tight">
          <div className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            BookingManager
          </div>
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
            Hotel Suite
          </div>
        </div>
      )}
    </div>
  );
}

export default Logo;
