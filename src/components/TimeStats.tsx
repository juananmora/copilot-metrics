import { MaterialIcon } from './MaterialIcon';

interface TimeStatsProps {
  avgDaysToClose: number | string;
  minDaysToClose: number | string;
  maxDaysToClose: number | string;
  totalComments: number;
  avgComments: number;
}

export function TimeStats({ 
  avgDaysToClose, 
  minDaysToClose, 
  maxDaysToClose,
  totalComments,
  avgComments 
}: TimeStatsProps) {
  const stats = [
    {
      icon: 'timer',
      label: 'Promedio (días)',
      value: avgDaysToClose,
      color: '#A100FF',
    },
    {
      icon: 'speed',
      label: 'Mínimo (días)',
      value: minDaysToClose,
      color: '#00A551',
      arrow: 'arrow_downward',
    },
    {
      icon: 'schedule',
      label: 'Máximo (días)',
      value: maxDaysToClose,
      color: '#FFB800',
      arrow: 'arrow_upward',
    },
    {
      icon: 'chat',
      label: 'Total Comentarios',
      value: totalComments,
      color: '#7500C0',
    },
    {
      icon: 'rate_review',
      label: 'Promedio por PR',
      value: avgComments,
      color: '#A100FF',
    },
  ];

  return (
    <div className="stitch-card rounded-2xl overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#A100FF] via-[#7500C0] to-[#A100FF]"></div>
      
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A100FF]/10 flex items-center justify-center">
            <MaterialIcon icon="schedule" size={22} className="text-[#A100FF]" />
          </div>
          Tiempo de Resolución e Interacción
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl p-4 text-center border border-gray-100 
                          hover:border-[#A100FF]/20 hover:shadow-md transition-all duration-300 group overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: stat.color }} />
              
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${stat.color}10` }}
                >
                  <MaterialIcon icon={stat.icon} size={22} style={{ color: stat.color }} />
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-extrabold tracking-tight" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                  {stat.arrow && (
                    <MaterialIcon icon={stat.arrow} size={18} style={{ color: stat.color }} />
                  )}
                </div>
                <div className="text-[10px] text-gray-500 mt-1 font-semibold uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
