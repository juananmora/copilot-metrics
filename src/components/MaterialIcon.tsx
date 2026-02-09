/**
 * MaterialIcon - Wrapper for Google Material Symbols Outlined
 * Uses the Material Symbols font loaded via CDN in index.html
 */

interface MaterialIconProps {
  icon: string;
  className?: string;
  size?: number;
  filled?: boolean;
  style?: React.CSSProperties;
}

export function MaterialIcon({ icon, className = '', size = 24, filled = false, style }: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        ...style,
      }}
    >
      {icon}
    </span>
  );
}
