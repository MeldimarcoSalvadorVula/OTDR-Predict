export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="otdr-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#48D9F5" />
          <stop offset="1" stopColor="#668BFF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#0D1422" stroke="#1D2A40" />
      <path
        d="M5 20h5l2-3 2.5 6 3-14 2.5 9 1.5-3H27"
        fill="none"
        stroke="url(#otdr-mark)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="15" r="1.6" fill="#48D9F5" />
    </svg>
  )
}
