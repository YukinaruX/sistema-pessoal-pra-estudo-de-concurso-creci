export default function Logo({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CRECI-BA logo"
    >
      <rect width="40" height="40" rx="10" fill="#58cc02" />
      {/* Mortarboard board */}
      <path d="M20 10.5L33 17.5L20 24.5L7 17.5Z" fill="white" />
      {/* Cap body */}
      <path
        d="M13.5 20.5V26C13.5 28.5 16.4 30.5 20 30.5C23.6 30.5 26.5 28.5 26.5 26V20.5"
        fill="rgba(255,255,255,0.28)"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tassel string */}
      <line x1="33" y1="17.5" x2="33" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Tassel end */}
      <circle cx="33" cy="26.5" r="2" fill="white" />
    </svg>
  );
}
