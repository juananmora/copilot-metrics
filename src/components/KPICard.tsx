import { ReactNode } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { AnimatedNumber } from '../hooks';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  /** Material icon name (e.g. 'person', 'check_circle') - preferred over icon prop */
  materialIcon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'aqua' | 'orange';
  large?: boolean;
}

const colorClasses = {
  blue: {
    iconBg: 'bg-blue-50',
    icon: 'text-[#0070AD]',
  },
  green: {
    iconBg: 'bg-green-50',
    icon: 'text-[#078847]',
  },
  red: {
    iconBg: 'bg-red-50',
    icon: 'text-[#E4002B]',
  },
  purple: {
    iconBg: 'bg-purple-50',
    icon: 'text-accenture-purple',
  },
  aqua: {
    iconBg: 'bg-blue-50',
    icon: 'text-[#0070AD]',
  },
  orange: {
    iconBg: 'bg-amber-50',
    icon: 'text-amber-600',
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  icon,
  materialIcon,
  trend,
  trendValue,
  color = 'purple',
  large = false,
}: KPICardProps) {
  const colors = colorClasses[color];

  return (
    <div className={`stitch-kpi ${large ? 'col-span-2' : ''}`}>
      {/* Header: label + trend badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`stitch-icon-container ${colors.iconBg}`}>
            {materialIcon ? (
              <MaterialIcon icon={materialIcon} size={20} className={colors.icon} />
            ) : icon ? (
              <div className={colors.icon}>{icon}</div>
            ) : null}
          </div>
          <p className="text-gray-600 font-bold uppercase text-xs tracking-wider">{title}</p>
        </div>

        {trend && trendValue && (
          <div
            className={
              trend === 'up'
                ? 'stitch-trend-up'
                : trend === 'down'
                ? 'stitch-trend-down'
                : 'stitch-trend-neutral'
            }
          >
            <MaterialIcon
              icon={trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
              size={14}
            />
            {trendValue}
          </div>
        )}
      </div>

      {/* Value */}
      <p className={`${large ? 'text-4xl' : 'text-3xl'} font-bold text-black tracking-tight leading-tight counter-value`}>
        {typeof value === 'number' ? (
          <AnimatedNumber value={value} duration={1400} />
        ) : (
          value
        )}
      </p>

      {/* Subtitle with progress bar */}
      {subtitle && (
        <p className="text-xs text-gray-500 mt-3 font-medium">{subtitle}</p>
      )}

      {/* Optional thin progress bar */}
      <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
        <div className="bg-accenture-purple h-1.5 rounded-full" style={{ width: '75%' }} />
      </div>
    </div>
  );
}
