import { useEffect, useState, useRef } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { ProcessedPR } from '../types';

interface TickerItem {
  id: string;
  type: 'pr_created' | 'pr_merged' | 'pr_closed' | 'user_active';
  message: string;
  timestamp: Date;
  icon: 'pr' | 'merge' | 'closed' | 'user';
  url?: string;
}

interface ActivityTickerProps {
  prList?: ProcessedPR[];
  activeUsers?: number;
  speed?: number;
  className?: string;
}

// Generar items del ticker desde datos reales de PRs
const generateItemsFromPRs = (prList: ProcessedPR[], activeUsers: number): TickerItem[] => {
  const items: TickerItem[] = [];
  
  const sortedPRs = [...prList]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 15);
  
  sortedPRs.forEach((pr, index) => {
    const repoName = pr.repository.split('/').pop() || pr.repository;
    const agentName = pr.customAgent !== '-' ? pr.customAgent : 'SWE Agent';
    
    if (pr.isMerged) {
      items.push({
        id: `merged-${pr.number}-${index}`,
        type: 'pr_merged',
        message: `PR #${pr.number} mergeada en ${repoName}`,
        timestamp: new Date(pr.closedAt !== '-' ? pr.closedAt : pr.updatedAt),
        icon: 'merge',
        url: pr.url
      });
    } else if (pr.state === 'closed') {
      items.push({
        id: `closed-${pr.number}-${index}`,
        type: 'pr_closed',
        message: `PR #${pr.number} cerrada en ${repoName}`,
        timestamp: new Date(pr.closedAt !== '-' ? pr.closedAt : pr.updatedAt),
        icon: 'closed',
        url: pr.url
      });
    } else {
      items.push({
        id: `created-${pr.number}-${index}`,
        type: 'pr_created',
        message: `${agentName} abrió PR #${pr.number} en ${repoName}`,
        timestamp: new Date(pr.createdAt),
        icon: 'pr',
        url: pr.url
      });
    }
  });
  
  if (activeUsers > 0) {
    items.push({
      id: 'active-users',
      type: 'user_active',
      message: `${activeUsers} usuarios activos con Copilot hoy`,
      timestamp: new Date(),
      icon: 'user'
    });
  }
  
  return items;
};

const iconMap: Record<string, string> = {
  pr: 'commit',
  merge: 'merge',
  closed: 'cancel',
  user: 'group',
};

const colorMap: Record<string, string> = {
  pr: 'text-[#A100FF]',
  merge: 'text-[#00A551]',
  closed: 'text-red-500',
  user: 'text-[#A100FF]',
};

export function ActivityTicker({ prList, activeUsers = 0, speed = 50, className = '' }: ActivityTickerProps) {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (prList && prList.length > 0) {
      const items = generateItemsFromPRs(prList, activeUsers);
      setTickerItems(items);
    }
  }, [prList, activeUsers]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [animationDuration, setAnimationDuration] = useState(30);
  
  useEffect(() => {
    if (contentRef.current && tickerItems.length > 0) {
      const contentWidth = contentRef.current.scrollWidth / 2;
      const duration = contentWidth / speed;
      setAnimationDuration(duration);
    }
  }, [tickerItems, speed]);

  if (tickerItems.length === 0) {
    return null;
  }

  return (
    <div 
      className={`relative overflow-hidden bg-white border border-gray-200 rounded-xl shadow-card ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={containerRef}
    >
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none" />
      
      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 bg-white pr-3">
        <span className="stitch-badge bg-purple-50 text-accenture-purple flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-full bg-accenture-purple animate-pulse" />
          LIVE
        </span>
      </div>
      
      {/* Ticker content */}
      <div 
        ref={contentRef}
        className="flex items-center py-2.5 pl-28"
        style={{
          animation: `ticker ${animationDuration}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {/* Duplicate content for infinite scroll */}
        {[...tickerItems, ...tickerItems].map((item, index) => {
          const iconName = iconMap[item.icon];
          const colorClass = colorMap[item.icon];
          
          const handleClick = () => {
            if (item.url) {
              window.open(item.url, '_blank', 'noopener,noreferrer');
            }
          };
          
          return (
            <div 
              key={`${item.id}-${index}`}
              className={`flex items-center gap-2 mx-6 whitespace-nowrap group ${item.url ? 'cursor-pointer' : ''}`}
              onClick={handleClick}
              title={item.url ? 'Click para abrir PR' : undefined}
            >
              <div className={`p-1.5 rounded-lg bg-gray-50 group-hover:bg-[#A100FF]/10 transition-colors ${colorClass}`}>
                <MaterialIcon icon={iconName} size={16} />
              </div>
              <span className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">
                {item.message}
              </span>
              <span className="text-gray-300 text-xs">•</span>
            </div>
          );
        })}
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
