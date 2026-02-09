import { useMemo } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface ContributionGraphProps {
  activityData?: Record<string, number>;
  startMonth?: string; // Format: 'YYYY-MM'
  endMonth?: string;   // Format: 'YYYY-MM'
  title?: string;
}

export function ContributionGraph({ 
  activityData = {}, 
  startMonth = '2025-12',
  endMonth = '2026-06',
  title = "Actividad de Copilot"
}: ContributionGraphProps) {
  
  const { grid, months, totalActivity, streakDays } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Parse start and end months
    const [startYear, startMonthNum] = startMonth.split('-').map(Number);
    const [endYear, endMonthNum] = endMonth.split('-').map(Number);
    
    // Start from first day of start month, adjust to previous Sunday
    const firstDay = new Date(startYear, startMonthNum - 1, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End at last day of end month
    const endDate = new Date(endYear, endMonthNum, 0);
    endDate.setHours(23, 59, 59, 999);
    
    // Keys for filtering months within range
    const startMonthKey = startYear * 12 + (startMonthNum - 1);
    const endMonthKey = endYear * 12 + (endMonthNum - 1);
    
    type DayData = { 
      date: string; 
      count: number; 
      level: number; 
      isFuture: boolean; 
      isFirstOfMonth: boolean; 
      dayOfMonth: number 
    };
    
    const grid: DayData[][] = [];
    const monthLabels: { week: number; name: string }[] = [];
    let total = 0;
    let max = 0;
    let streak = 0;
    let maxStreak = 0;
    
    // Iterate day by day
    const current = new Date(startDate);
    let weekData: DayData[] = [];
    let weekIndex = 0;
    let lastMonthSeen = -1;
    
    while (current <= endDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const day = current.getDate();
      const dayOfWeek = current.getDay();
      
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isFuture = current > today;
      const isFirstOfMonth = day === 1;
      const count = isFuture ? 0 : (activityData[dateStr] || 0);
      
      total += count;
      max = Math.max(max, count);
      
      // Track streak
      if (count > 0 && !isFuture) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else if (!isFuture) {
        streak = 0;
      }
      
      // Track month labels - only for months within the requested range
      const monthKey = year * 12 + month;
      if (monthKey !== lastMonthSeen && monthKey >= startMonthKey && monthKey <= endMonthKey) {
        const monthName = current.toLocaleDateString('es-ES', { month: 'short' });
        const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} '${String(year).slice(-2)}`;
        monthLabels.push({ week: weekIndex, name: label });
        lastMonthSeen = monthKey;
      } else if (monthKey !== lastMonthSeen) {
        lastMonthSeen = monthKey;
      }
      
      weekData.push({
        date: dateStr,
        count,
        level: 0,
        isFuture,
        isFirstOfMonth,
        dayOfMonth: day
      });
      
      // End of week (Saturday)
      if (dayOfWeek === 6) {
        grid.push(weekData);
        weekData = [];
        weekIndex++;
      }
      
      // Move to next day
      current.setDate(current.getDate() + 1);
    }
    
    // Push remaining days
    if (weekData.length > 0) {
      grid.push(weekData);
    }
    
    // Calculate levels
    grid.forEach(week => {
      week.forEach(d => {
        if (d.isFuture) d.level = -1;
        else if (d.count === 0) d.level = 0;
        else if (max > 0) {
          const ratio = d.count / max;
          if (ratio <= 0.25) d.level = 1;
          else if (ratio <= 0.5) d.level = 2;
          else if (ratio <= 0.75) d.level = 3;
          else d.level = 4;
        }
      });
    });
    
    return { 
      grid, 
      months: monthLabels, 
      totalActivity: total, 
      streakDays: maxStreak
    };
  }, [activityData, startMonth, endMonth]);
  
  const getLevelColor = (level: number) => {
    if (level === -1) return 'bg-gray-50 border border-dashed border-gray-200';
    if (level === 0) return 'bg-gray-100';
    if (level === 1) return 'bg-[#A100FF]/15';
    if (level === 2) return 'bg-[#A100FF]/30';
    if (level === 3) return 'bg-[#A100FF]/55';
    return 'bg-[#A100FF]';
  };
  
  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Calculate position for each month label
  // Each week column = 12px square + 3px gap = 15px
  const getMonthPosition = (weekIndex: number) => {
    return weekIndex * 15;
  };
  
  return (
    <div className="stitch-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#A100FF]/10 flex items-center justify-center">
            <MaterialIcon icon="calendar_month" size={20} className="text-[#A100FF]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Dic 2025 - Jun 2026</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{totalActivity.toLocaleString('es-ES')}</div>
            <div className="text-xs text-gray-500">PRs totales</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#A100FF] flex items-center gap-1">
              <MaterialIcon icon="local_fire_department" size={20} className="text-[#A100FF]" />
              {streakDays}
            </div>
            <div className="text-xs text-gray-500">días de racha</div>
          </div>
        </div>
      </div>
      
      {/* Graph */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col">
          {/* Month labels row */}
          <div className="flex mb-1" style={{ marginLeft: '32px' }}>
            <div className="relative h-4 flex-1" style={{ width: `${grid.length * 15}px` }}>
              {months.map((month, i) => (
                <span 
                  key={i}
                  className="absolute text-xs text-gray-500 font-medium"
                  style={{ left: `${getMonthPosition(month.week)}px` }}
                >
                  {month.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Grid with day labels */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-2 text-xs text-gray-400" style={{ width: '24px' }}>
              {dayLabels.map((label, i) => (
                <div key={i} className="h-[12px] flex items-center justify-end" style={{ fontSize: '9px' }}>
                  {label}
                </div>
              ))}
            </div>
            
            {/* Contribution squares */}
            <div className="flex gap-[3px]">
              {grid.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => {
                    // Show tooltip below for first 2 rows (Sunday and Monday)
                    const showTooltipBelow = dayIndex <= 1;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-[12px] h-[12px] rounded-sm ${getLevelColor(day.level)} 
                          transition-all duration-200 hover:ring-2 hover:ring-[#A100FF] hover:ring-offset-1 hover:ring-offset-white
                          cursor-pointer group relative`}
                        title={day.isFuture ? `${day.date}: Futuro` : `${day.date}: ${day.count} PRs`}
                      >
                        <div className={`absolute ${showTooltipBelow ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 px-2 py-1 
                          bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 
                          transition-opacity whitespace-nowrap pointer-events-none z-10`}>
                          <div className="font-semibold">
                            {day.isFuture ? 'Futuro' : `${day.count} PRs`}
                          </div>
                          <div className="text-gray-400">{new Date(day.date + 'T12:00:00').toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })}</div>
                          <div className={`absolute ${showTooltipBelow ? 'bottom-full' : 'top-full'} left-1/2 -translate-x-1/2 border-4 border-transparent ${showTooltipBelow ? 'border-b-gray-900' : 'border-t-gray-900'}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
            <span>Menos</span>
            <div className={`w-[12px] h-[12px] rounded-sm ${getLevelColor(0)}`} />
            <div className={`w-[12px] h-[12px] rounded-sm ${getLevelColor(1)}`} />
            <div className={`w-[12px] h-[12px] rounded-sm ${getLevelColor(2)}`} />
            <div className={`w-[12px] h-[12px] rounded-sm ${getLevelColor(3)}`} />
            <div className={`w-[12px] h-[12px] rounded-sm ${getLevelColor(4)}`} />
            <span>Más</span>
            <span className="ml-4">|</span>
            <div className={`w-[12px] h-[12px] rounded-sm ${getLevelColor(-1)}`} />
            <span>Futuro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
