/**
 * Accenture Logo Component - ">" chevron mark + text
 * Corporate branding following Accenture visual identity
 */
interface AccentureLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'mark' | 'text';
  color?: string;
}

export function AccentureLogo({ 
  className = '', 
  size = 'md', 
  variant = 'full',
  color = '#A100FF' 
}: AccentureLogoProps) {
  const sizes = {
    sm: { height: 24, fontSize: 14, chevron: 20 },
    md: { height: 36, fontSize: 20, chevron: 28 },
    lg: { height: 48, fontSize: 28, chevron: 38 },
  };
  
  const s = sizes[size];

  if (variant === 'mark') {
    return (
      <svg 
        className={className}
        height={s.chevron} 
        viewBox="0 0 24 28" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M2 2L18 14L2 26" 
          stroke={color} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'text') {
    return (
      <span 
        className={`font-bold tracking-tight ${className}`}
        style={{ fontSize: s.fontSize, color }}
      >
        accenture
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg 
        height={s.chevron} 
        viewBox="0 0 24 28" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M2 2L18 14L2 26" 
          stroke={color} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span 
        className="font-bold tracking-tight"
        style={{ fontSize: s.fontSize, color }}
      >
        accenture
      </span>
    </div>
  );
}
