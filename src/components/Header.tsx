import { Activity, RefreshCw, AlertTriangle, Database, Cpu, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccentureLogo } from '../assets/images/AccentureLogo';
import copilotLogo from '../assets/images/copilot.jpg';

interface HeaderProps {
  lastUpdated: string;
  onRefresh: () => void;
  isLoading: boolean;
  isLiveData: boolean;
  dataSource: string;
}

export function Header({ lastUpdated, onRefresh, isLoading, isLiveData, dataSource }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#460073] via-[#7500C0] to-[#A100FF] text-white shadow-2xl relative z-10">
      {/* Top bar con info de Accenture */}
      <div className="bg-black/20 backdrop-blur-sm py-2 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs md:text-sm">
          <div className="flex items-center gap-4 md:gap-6">
            <span className="text-white/70">Información Corporativa</span>
            <span className="hidden md:inline text-white/70">|</span>
            <span className="hidden md:inline text-white/70">Tecnología & Innovación</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60">Accenture</span>
            <span className="text-[#A100FF] font-semibold">AI Innovation Hub</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="py-6 md:py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Logo y título */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Logo Accenture */}
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-lg p-2 shadow-lg">
                  <AccentureLogo size="md" />
                </div>
                <div className="h-0.5 w-full bg-gradient-to-r from-[#A100FF] to-transparent mt-2"></div>
              </div>
              
              {/* Separador */}
              <div className="hidden md:block h-16 w-px bg-white/20"></div>
              
              {/* Copilot branding con imagen */}
              <div className="flex items-center gap-3 md:gap-4">
                {/* Icono Copilot - Imagen real */}
                <div className="relative">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20">
                    <img 
                      src={copilotLogo} 
                      alt="GitHub Copilot" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                    GitHub Copilot
                    <span className="text-[#A100FF] ml-2">Metrics</span>
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-white/70 text-sm">
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="font-medium">Inteligencia Artificial para Desarrollo</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Indicadores y botones */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Data Source Indicator */}
              {isLiveData ? (
                <div className="flex items-center gap-2 bg-[#00A551]/20 backdrop-blur-sm rounded-xl px-3 md:px-4 py-2 border border-[#00A551]/40">
                  <Activity className="w-4 h-4 text-[#00A551] animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-semibold text-[#00A551]">DATOS EN VIVO</span>
                    <span className="text-[10px] md:text-xs text-[#00A551]/70">GitHub Enterprise</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm rounded-xl px-3 md:px-4 py-2 border border-yellow-400/40">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-semibold text-yellow-300">DATOS DEMO</span>
                    <span className="text-[10px] md:text-xs text-yellow-200/70">Mock Data</span>
                  </div>
                </div>
              )}
              
              {/* Executive Dashboard Link */}
              <Link
                to="/executive"
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                           rounded-xl px-4 md:px-5 py-2.5 md:py-3 transition-all duration-300 group
                           border border-amber-400/30 shadow-lg hover:shadow-xl"
              >
                <Briefcase className="w-4 h-4" />
                <span className="font-medium text-sm md:text-base">Executive View</span>
              </Link>
              
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm 
                           rounded-xl px-4 md:px-5 py-2.5 md:py-3 transition-all duration-300 group disabled:opacity-50
                           border border-white/10 hover:border-white/20"
              >
                <RefreshCw className={`w-4 h-4 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                <span className="font-medium text-sm md:text-base">Actualizar</span>
              </button>
            </div>
          </div>
          
          {/* Info bar */}
          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm border border-white/5">
              <span className="text-white/50">Organización:</span>
              <span className="ml-2 font-semibold">copilot-full-capacity</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm border border-white/5">
              <span className="text-white/50">Última actualización:</span>
              <span className="ml-2 font-semibold">{lastUpdated}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm flex items-center gap-2 border border-white/5">
              <Database className="w-3 h-3 text-white/50" />
              <span className="text-white/50">Fuente:</span>
              <span className="ml-1 font-semibold">{dataSource}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-[#A100FF] via-[#00A551] to-[#A100FF]"></div>
    </header>
  );
}
