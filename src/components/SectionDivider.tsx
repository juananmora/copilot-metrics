import { Bot, Sparkles, TrendingUp, Code2, GitBranch, Zap, Shield, Target } from 'lucide-react';

interface SectionDividerProps {
  variant?: 'default' | 'wave' | 'dots' | 'gradient' | 'tech' | 'minimal';
  icon?: 'bot' | 'sparkles' | 'trending' | 'code' | 'git' | 'zap' | 'shield' | 'target';
  text?: string;
}

const icons = {
  bot: Bot,
  sparkles: Sparkles,
  trending: TrendingUp,
  code: Code2,
  git: GitBranch,
  zap: Zap,
  shield: Shield,
  target: Target,
};

export function SectionDivider({ variant = 'default', icon, text }: SectionDividerProps) {
  const IconComponent = icon ? icons[icon] : null;

  // Wave variant
  if (variant === 'wave') {
    return (
      <div className="relative py-8 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 120">
          <path 
            d="M0,60 C300,100 400,20 600,60 C800,100 900,20 1200,60 L1200,120 L0,120 Z" 
            fill="url(#wave-gradient)" 
            opacity="0.15"
          />
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A100FF" />
              <stop offset="50%" stopColor="#00A551" />
              <stop offset="100%" stopColor="#A100FF" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative flex items-center justify-center">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#A100FF]/40"></div>
          {IconComponent && (
            <div className="mx-4 w-10 h-10 rounded-full bg-gradient-to-br from-[#A100FF] to-[#7500C0] flex items-center justify-center shadow-lg shadow-[#A100FF]/20">
              <IconComponent className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#A100FF]/40"></div>
        </div>
        {text && (
          <p className="text-center text-sm text-gray-500 mt-3 font-medium">{text}</p>
        )}
      </div>
    );
  }

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className="py-6 flex items-center justify-center gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={`left-${i}`} 
              className="w-1.5 h-1.5 rounded-full bg-[#A100FF]"
              style={{ opacity: 0.2 + (i * 0.15) }}
            />
          ))}
        </div>
        {IconComponent ? (
          <div className="mx-2 w-8 h-8 rounded-lg bg-[#A100FF]/20 border border-[#A100FF]/30 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-[#A100FF]" />
          </div>
        ) : (
          <div className="w-3 h-3 rounded-full bg-[#00A551]" />
        )}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={`right-${i}`} 
              className="w-1.5 h-1.5 rounded-full bg-[#A100FF]"
              style={{ opacity: 0.8 - (i * 0.15) }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Gradient variant
  if (variant === 'gradient') {
    return (
      <div className="py-6">
        <div className="relative">
          <div className="h-1 rounded-full bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-32 rounded-full bg-gradient-to-r from-[#A100FF] via-[#00A551] to-[#7500C0] shadow-lg shadow-[#A100FF]/20"></div>
          </div>
        </div>
        {text && (
          <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-wider">{text}</p>
        )}
      </div>
    );
  }

  // Tech variant - more elaborate
  if (variant === 'tech') {
    return (
      <div className="py-8 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="grid grid-cols-12 gap-2 w-full max-w-2xl">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="h-1 bg-[#A100FF] rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Main divider */}
        <div className="relative flex items-center justify-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-[#A100FF]/40 max-w-xs"></div>
          
          <div className="mx-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00A551] animate-pulse"></div>
            <div className="px-4 py-2 rounded-full border border-[#A100FF]/30 bg-[#F9FAFB]/80 backdrop-blur-sm flex items-center gap-2">
              {IconComponent && <IconComponent className="w-4 h-4 text-[#A100FF]" />}
              {text && <span className="text-xs font-semibold text-[#A100FF] uppercase tracking-wider">{text}</span>}
            </div>
            <div className="w-2 h-2 rounded-full bg-[#00A551] animate-pulse"></div>
          </div>
          
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#E5E7EB] to-[#A100FF]/40 max-w-xs"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#06b6d4]"></div>
        <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#06b6d4]"></div>
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className="py-4 flex items-center justify-center">
        <div className="w-16 h-0.5 rounded-full bg-gradient-to-r from-[#A100FF] to-[#00A551]"></div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="py-6 flex items-center justify-center">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#E5E7EB] max-w-xs"></div>
      <div className="mx-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#A100FF]/50"></div>
        {IconComponent ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A100FF]/20 to-[#00A551]/20 flex items-center justify-center border border-[#A100FF]/20">
            <IconComponent className="w-5 h-5 text-[#A100FF]" />
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-[#00A551]"></div>
        )}
        <div className="w-1.5 h-1.5 rounded-full bg-[#A100FF]/50"></div>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#E5E7EB] max-w-xs"></div>
    </div>
  );
}

// Quick divider for simple use
export function QuickDivider() {
  return (
    <div className="py-4 flex items-center justify-center gap-2">
      <div className="w-8 h-0.5 rounded-full bg-[#E5E7EB]"></div>
      <div className="w-2 h-2 rounded-full bg-[#00A551]/60"></div>
      <div className="w-8 h-0.5 rounded-full bg-[#E5E7EB]"></div>
    </div>
  );
}
