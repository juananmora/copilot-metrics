import { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface EffectivenessPanelProps {
  mergeRate: number;
  rejectionRate: number;
  pendingRate: number;
}

export function EffectivenessPanel({ mergeRate, rejectionRate, pendingRate }: EffectivenessPanelProps) {
  const [showLegend, setShowLegend] = useState(false);
  
  const getStatusColor = (rate: number, type: 'merge' | 'reject' | 'pending') => {
    if (type === 'merge') {
      if (rate >= 70) return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Excelente', good: true, barColor: 'bg-emerald-500' };
      if (rate >= 50) return { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Bueno', good: true, barColor: 'bg-amber-500' };
      return { bg: 'bg-red-500', text: 'text-red-500', label: 'Mejorable', good: false, barColor: 'bg-red-500' };
    }
    if (type === 'reject') {
      if (rate <= 20) return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Excelente', good: true, barColor: 'bg-emerald-500' };
      if (rate <= 40) return { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Aceptable', good: true, barColor: 'bg-amber-500' };
      return { bg: 'bg-red-500', text: 'text-red-500', label: 'Alto', good: false, barColor: 'bg-red-500' };
    }
    if (rate <= 30) return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Bajo', good: true, barColor: 'bg-emerald-500' };
    if (rate <= 50) return { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Moderado', good: true, barColor: 'bg-amber-500' };
    return { bg: 'bg-red-500', text: 'text-red-500', label: 'Alto', good: false, barColor: 'bg-red-500' };
  };

  const mergeStatus = getStatusColor(mergeRate, 'merge');
  const rejectStatus = getStatusColor(rejectionRate, 'reject');
  const pendingStatus = getStatusColor(pendingRate, 'pending');

  const metrics = [
    {
      icon: 'check_circle',
      iconColor: 'text-emerald-500',
      title: 'Merge Rate',
      description: 'PRs integradas del total cerradas',
      value: mergeRate,
      status: mergeStatus,
      showUpArrow: mergeStatus.good,
    },
    {
      icon: 'cancel',
      iconColor: 'text-red-400',
      title: 'Rejection Rate',
      description: 'PRs cerradas sin integrar',
      value: rejectionRate,
      status: rejectStatus,
      showUpArrow: false,
    },
    {
      icon: 'schedule',
      iconColor: 'text-amber-500',
      title: 'Pending Rate',
      description: 'PRs aún en revisión',
      value: pendingRate,
      status: pendingStatus,
      showUpArrow: false,
    },
  ];

  return (
    <div className="stitch-card overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#A100FF]/10 flex items-center justify-center">
              <MaterialIcon icon="analytics" size={20} className="text-[#A100FF]" />
            </div>
            Dashboard de Efectividad
          </h2>
          <button 
            onClick={() => setShowLegend(!showLegend)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-xs"
            title="Ver leyenda"
          >
            <MaterialIcon icon="info" size={16} />
            <span className="hidden sm:inline">Leyenda</span>
          </button>
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
            <div className="flex items-start gap-2 mb-3">
              <MaterialIcon icon="info" size={16} className="text-[#A100FF] flex-shrink-0 mt-0.5" />
              <p className="font-medium text-gray-700">¿Qué significan estas métricas?</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="font-semibold text-emerald-600 mb-1">Merge Rate</p>
                <p>Porcentaje de PRs que fueron integradas del total de PRs cerradas. ≥70% es excelente, ≥50% es bueno.</p>
              </div>
              <div>
                <p className="font-semibold text-red-500 mb-1">Rejection Rate</p>
                <p>Porcentaje de PRs cerradas sin integrar. ≤20% es excelente, ≤40% es aceptable.</p>
              </div>
              <div>
                <p className="font-semibold text-amber-500 mb-1">Pending Rate</p>
                <p>Porcentaje de PRs aún en revisión del total. ≤30% es bajo (bueno), ≤50% es moderado.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className="relative bg-white rounded-xl p-5 border border-gray-100 hover:border-[#A100FF]/15 transition-all duration-350 group overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(161,0,255,0.06), 0 2px 8px rgba(0,0,0,0.03)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <MaterialIcon icon={metric.icon} size={22} className={metric.iconColor} />
                </div>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${metric.status.bg} text-white shadow-sm`}>
                  {metric.status.label}
                </span>
              </div>
              
              <div className="flex items-end gap-2">
                <div className="text-3xl font-extrabold text-gray-900 tracking-tight counter-value">
                  {metric.value}%
                </div>
                {metric.showUpArrow && (
                  <MaterialIcon icon="trending_up" size={18} className="text-emerald-500 mb-1.5" />
                )}
              </div>
              <p className="text-gray-900 text-sm font-semibold mt-1.5">{metric.title}</p>
              <p className="text-gray-500 text-xs mt-0.5">{metric.description}</p>
              
              <div className="stitch-hbar mt-4">
                <div 
                  className={`stitch-hbar-fill ${metric.status.barColor}`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
