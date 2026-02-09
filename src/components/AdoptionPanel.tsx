import { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';
import type { SeatsStats } from '../types';

interface AdoptionPanelProps {
  stats: SeatsStats;
}

export function AdoptionPanel({ stats }: AdoptionPanelProps) {
  const [showLegend, setShowLegend] = useState(false);
  
  return (
    <div className="stitch-card !rounded-2xl overflow-hidden !p-0">
      <div className="p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A100FF]/10 flex items-center justify-center">
              <MaterialIcon icon="donut_large" size={20} className="text-[#A100FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Métricas de Adopción</h2>
              <p className="text-gray-400 text-xs">GitHub Copilot Usage</p>
            </div>
          </div>
          <button 
            onClick={() => setShowLegend(!showLegend)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 text-xs rounded-lg px-2 py-1 hover:bg-gray-50"
            title="Ver leyenda"
          >
            <MaterialIcon icon="info" size={16} />
            <span className="hidden sm:inline">Leyenda</span>
          </button>
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
            <div className="flex items-start gap-2 mb-3">
              <MaterialIcon icon="info" size={16} className="text-[#A100FF] flex-shrink-0 mt-0.5" />
              <p className="font-semibold text-gray-700">¿Qué significan estas métricas?</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-blue-600 mb-1">Total Licencias</p>
                <p>Número total de licencias de Copilot asignadas en la organización.</p>
              </div>
              <div>
                <p className="font-semibold text-[#00A551] mb-1">Con Actividad</p>
                <p>Usuarios que han utilizado Copilot al menos una vez (han generado código, sugerencias, etc.).</p>
              </div>
              <div>
                <p className="font-semibold text-[#A100FF] mb-1">Activos (7 días)</p>
                <p>Usuarios que han usado Copilot en los últimos 7 días. Indica engagement reciente.</p>
              </div>
              <div>
                <p className="font-semibold text-amber-600 mb-1">Sin Actividad</p>
                <p>Usuarios con licencia que nunca han usado Copilot. Oportunidad de mejora en adopción.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#A100FF]/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <MaterialIcon icon="group" size={20} className="text-blue-600" />
              </div>
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                100%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{stats.totalSeats}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Total Licencias</div>
            <div className="text-xs text-gray-400 mt-0.5">Copilot seats</div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#00A551]/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#00A551]/8 flex items-center justify-center">
                <MaterialIcon icon="person_check" size={20} className="text-[#00A551]" />
              </div>
              <span className="bg-[#00A551]/8 text-[#00A551] px-2 py-0.5 rounded-full text-xs font-bold">
                {stats.adoptionRate}%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{stats.withActivity}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Con Actividad</div>
            <div className="text-xs text-gray-400 mt-0.5">Usuarios activos</div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#A100FF]/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#A100FF]/8 flex items-center justify-center">
                <MaterialIcon icon="bolt" size={20} className="text-[#A100FF]" />
              </div>
              <span className="bg-[#A100FF]/8 text-[#A100FF] px-2 py-0.5 rounded-full text-xs font-bold">
                {stats.activeRate7d}%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{stats.active7d}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Activos (7 días)</div>
            <div className="text-xs text-gray-400 mt-0.5">Última semana</div>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <MaterialIcon icon="person_off" size={20} className="text-amber-600" />
              </div>
              <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {Math.round((stats.withoutActivity / stats.totalSeats) * 100)}%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{stats.withoutActivity}</div>
            <div className="text-sm font-medium text-gray-500 mt-1">Sin Actividad</div>
            <div className="text-xs text-gray-400 mt-0.5">Oportunidad mejora</div>
          </div>
        </div>
        
        {/* Progress bars */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-gray-900 text-sm">Tasa de Adopción</span>
              <span className="text-xl font-bold text-[#00A551]">{stats.adoptionRate}%</span>
            </div>
            <div className="stitch-hbar">
              <div 
                className="stitch-hbar-fill bg-[#00A551]"
                style={{ width: `${stats.adoptionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {stats.withActivity} de {stats.totalSeats} usuarios han utilizado Copilot
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-gray-900 text-sm">Actividad 7 días</span>
              <span className="text-xl font-bold text-[#A100FF]">{stats.activeRate7d}%</span>
            </div>
            <div className="stitch-hbar">
              <div 
                className="stitch-hbar-fill bg-[#A100FF]"
                style={{ width: `${stats.activeRate7d}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {stats.active7d} usuarios activos en la última semana
            </p>
          </div>
        </div>
        
        {/* Activity breakdown */}
        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Desglose de Actividad</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.active24h}</div>
              <div className="text-xs text-gray-400 mt-1">Últimas 24h</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#A100FF]">{stats.active7d}</div>
              <div className="text-xs text-gray-400 mt-1">Últimos 7 días</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#00A551]">{stats.active30d}</div>
              <div className="text-xs text-gray-400 mt-1">Últimos 30 días</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
