interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Enterprise AI Search brand glyph — a bold four-point "AI spark" in the
 * orange→gold brand gradient. Standalone mark (no background tile), styled to
 * sit directly on light or dark surfaces.
 */
export const BrandMark = ({ size = 28, className }: BrandMarkProps) => {
  const gradientId = "brand-mark-gradient";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F2760A" />
          <stop offset="1" stopColor="#D4A94A" />
        </linearGradient>
      </defs>
      {/* Primary four-point spark */}
      <path
        d="M16 2.5c.9 6.9 5.6 11.6 12.5 12.5v2c-6.9.9-11.6 5.6-12.5 12.5h-2C13.1 22.6 8.4 17.9 1.5 17v-2C8.4 14.1 13.1 9.4 14 2.5h2z"
        fill={`url(#${gradientId})`}
      />
      {/* Small accent spark */}
      <path
        d="M26 3.5c.3 2 1.3 3 3.3 3.3-.2 2-1.3 3-3.3 3.3-.3-2-1.3-3-3.3-3.3.2-2 1.3-3 3.3-3.3z"
        fill="#D4A94A"
        opacity="0.75"
      />
    </svg>
  );
};
