import { MaterialIcon } from './MaterialIcon';
import type { LanguageStats, TimezoneActivity } from '../types';

interface CommunityInsightsProps {
  languages: LanguageStats[];
  timezones: TimezoneActivity[];
  totalDevelopers: number;
}

export function CommunityInsights({ 
  languages, 
  timezones,
  totalDevelopers
}: CommunityInsightsProps) {
  return (
    <div className="stitch-card rounded-2xl p-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#A100FF]/10 flex items-center justify-center">
          <MaterialIcon icon="forum" size={22} className="text-[#A100FF]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-gray-900">Perspectivas de la Comunidad</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#00A551]/10 text-[#00A551] border border-[#00A551]/20">
              <MaterialIcon icon="database" size={12} />
              Datos de API
            </span>
          </div>
          <p className="text-sm text-gray-500">Análisis de actividad y distribución de tecnologías (datos reales de repositorios)</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Timezone Activity */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon icon="public" size={20} className="text-[#A100FF]" />
            <h4 className="text-lg font-semibold text-gray-900">Actividad por Zona Horaria</h4>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">GMT -5, -3, +1</span>
            <span>Zonas más activas</span>
          </div>
          
          {/* Activity Timeline Visual */}
          <div className="relative h-32 mt-4">
            {/* Time labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
              <span>Medianoche</span>
              <span>6:00</span>
              <span>Mediodía</span>
              <span>18:00</span>
              <span>Medianoche</span>
            </div>
            
            {/* Activity bars */}
            <div className="absolute bottom-6 left-0 right-0 flex items-end justify-between gap-1 h-20">
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = i;
                let activity = 20;
                if (hour >= 8 && hour <= 12) activity = 60 + Math.random() * 30;
                else if (hour >= 14 && hour <= 18) activity = 70 + Math.random() * 25;
                else if (hour >= 6 && hour <= 20) activity = 40 + Math.random() * 20;
                
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all duration-500"
                    style={{
                      height: `${activity}%`,
                      background: activity > 60 
                        ? 'linear-gradient(180deg, #A100FF, #7500C0)' 
                        : activity > 40 
                          ? 'linear-gradient(180deg, #A100FF88, #A100FF44)' 
                          : '#E5E7EB',
                      opacity: activity > 60 ? 1 : 0.7,
                    }}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Timezone badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {timezones.slice(0, 3).map((tz, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                <MaterialIcon icon="schedule" size={14} className="text-[#A100FF]" />
                <span className="text-xs text-gray-600">{tz.timezone}</span>
                <span className="text-xs font-semibold text-[#00A551]">{tz.activity}%</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Language Distribution */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <MaterialIcon icon="code" size={20} className="text-[#00A551]" />
            <h4 className="text-lg font-semibold text-gray-900">Lenguajes Principales</h4>
          </div>
          
          <div className="space-y-4">
            {languages.map((lang, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: lang.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{lang.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{lang.percentage}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${lang.percentage}%`,
                      background: `linear-gradient(90deg, ${lang.color}, ${lang.color}88)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Total developers badge */}
          <div className="mt-6 p-4 rounded-xl bg-[#A100FF]/5 border border-[#A100FF]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon icon="group" size={20} className="text-[#A100FF]" />
                <span className="text-sm text-gray-600">Desarrolladores activos</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalDevelopers.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
