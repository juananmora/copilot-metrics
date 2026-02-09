import { useEffect, useState, useRef } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface PulseMonitorProps {
  /** Valor actual de actividad (0-100) */
  activityLevel?: number;
  /** Título del monitor */
  title?: string;
  /** Mostrar en modo compacto */
  compact?: boolean;
  /** Datos históricos para el gráfico */
  data?: number[];
  /** Clase CSS adicional */
  className?: string;
  /** Subtítulo descriptivo */
  subtitle?: string;
  /** Si es true, usa solo datos reales sin simulación */
  realTimeSimulation?: boolean;
  /** Texto de la leyenda explicativa */
  legendText?: string;
}

// Generar datos de pulso simulados
const generatePulseData = (baseLevel: number = 50): number[] => {
  const data: number[] = [];
  let value = baseLevel;
  
  for (let i = 0; i < 60; i++) {
    // Simular picos de actividad tipo latido
    const noise = (Math.random() - 0.5) * 15;
    const spike = i % 12 < 3 ? Math.sin((i % 12) * Math.PI / 3) * 30 : 0;
    value = Math.max(5, Math.min(100, baseLevel + noise + spike));
    data.push(value);
  }
  
  return data;
};

export function PulseMonitor({ 
  activityLevel = 65, 
  title = 'Actividad Copilot',
  compact = false,
  data,
  className = '',
  subtitle,
  realTimeSimulation = true,
  legendText
}: PulseMonitorProps) {
  const [showLegend, setShowLegend] = useState(false);
  const [pulseData, setPulseData] = useState<number[]>(data || generatePulseData(activityLevel));
  const [currentValue, setCurrentValue] = useState(activityLevel);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const pulseDataRef = useRef<number[]>(pulseData);
  
  // Actualizar con datos externos cuando cambien
  useEffect(() => {
    if (data && data.length > 0) {
      setPulseData(data);
      setCurrentValue(data[data.length - 1]);
    }
  }, [data]);

  // Actualizar activityLevel cuando cambie
  useEffect(() => {
    setCurrentValue(activityLevel);
  }, [activityLevel]);
  
  // Actualizar datos en tiempo real (solo si realTimeSimulation está habilitado)
  useEffect(() => {
    if (!realTimeSimulation) return;
    
    const interval = setInterval(() => {
      setPulseData(prev => {
        const newData = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1];
        // Variación más suave para datos reales
        const variation = (Math.random() - 0.5) * 5;
        const newValue = Math.max(5, Math.min(100, lastValue + variation));
        newData.push(newValue);
        return newData;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [realTimeSimulation]);

  useEffect(() => {
    pulseDataRef.current = pulseData;
  }, [pulseData]);
  
  // Dibujar el gráfico de pulso
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const draw = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, width, height);
      
      // Fondo con grid sutil
      ctx.strokeStyle = 'rgba(229, 231, 235, 0.5)';
      ctx.lineWidth = 1;
      
      // Líneas horizontales
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Línea de pulso con gradiente púrpura
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(161, 0, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(161, 0, 255, 1)');
      gradient.addColorStop(1, 'rgba(161, 0, 255, 0.8)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      const dataPoints = pulseDataRef.current;
      dataPoints.forEach((value, index) => {
        const x = (index / (dataPoints.length - 1)) * width;
        const y = height - (value / 100) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Área bajo la curva con gradiente púrpura
      const areaGradient = ctx.createLinearGradient(0, 0, 0, height);
      areaGradient.addColorStop(0, 'rgba(161, 0, 255, 0.15)');
      areaGradient.addColorStop(1, 'rgba(161, 0, 255, 0)');
      
      ctx.fillStyle = areaGradient;
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      
      // Punto final
      const lastX = width;
      const lastY = height - (dataPoints[dataPoints.length - 1] / 100) * height;
      
      ctx.beginPath();
      ctx.arc(lastX - 2, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#A100FF';
      ctx.fill();
      
      // Glow del punto
      ctx.beginPath();
      ctx.arc(lastX - 2, lastY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(161, 0, 255, 0.2)';
      ctx.fill();
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Determinar el estado basado en el nivel de actividad
  const getStatus = () => {
    if (currentValue >= 70) return { text: 'Alta', color: 'text-emerald-600', bg: 'bg-emerald-50', dotBg: 'bg-emerald-500' };
    if (currentValue >= 40) return { text: 'Normal', color: 'text-[#A100FF]', bg: 'bg-[#A100FF]/10', dotBg: 'bg-[#A100FF]' };
    return { text: 'Baja', color: 'text-amber-600', bg: 'bg-amber-50', dotBg: 'bg-amber-500' };
  };
  
  const status = getStatus();
  
  if (compact) {
    return (
      <div className={`flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-200 ${className}`}>
        <div className="relative">
          <MaterialIcon icon="monitor_heart" size={20} className="text-[#A100FF]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#A100FF] rounded-full animate-ping" />
        </div>
        <div className="flex-1">
          <canvas 
            ref={canvasRef} 
            width={100} 
            height={24} 
            className="w-full h-6"
          />
        </div>
        <span className={`text-sm font-bold ${status.color}`}>{currentValue}%</span>
      </div>
    );
  }
  
  return (
    <div className={`stitch-card p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#A100FF]/10 flex items-center justify-center">
            <MaterialIcon icon="monitor_heart" size={20} className="text-[#A100FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900 font-semibold">{title}</h3>
              {legendText && (
                <button 
                  onClick={() => setShowLegend(!showLegend)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Ver leyenda"
                >
                  <MaterialIcon icon="info" size={16} />
                </button>
              )}
            </div>
            <p className="text-gray-500 text-xs">{subtitle || 'Monitoreo en tiempo real'}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.dotBg} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dotBg}`}></span>
          </span>
          <span className={`text-xs font-semibold ${status.color}`}>{status.text}</span>
        </div>
      </div>
      
      {/* Legend */}
      {showLegend && legendText && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
          <div className="flex items-start gap-2">
            <MaterialIcon icon="info" size={16} className="text-[#A100FF] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700 mb-1">¿Cómo se calcula?</p>
              <p>{legendText}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Gráfico de pulso */}
      <div className="relative bg-gray-50 rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={120} 
          className="w-full h-[120px] rounded-lg"
        />
        
        {/* Valor actual superpuesto */}
        <div className="absolute top-2 right-2 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="electric_bolt" size={16} className="text-[#A100FF]" />
            <span className="text-2xl font-bold text-gray-900">{currentValue}</span>
            <span className="text-gray-500 text-sm">%</span>
          </div>
        </div>
      </div>
      
      {/* Stats footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <MaterialIcon icon="trending_up" size={16} className="text-[#A100FF]" />
          <span>Promedio: {Math.round(pulseData.reduce((a, b) => a + b, 0) / pulseData.length)}%</span>
        </div>
        <div className="text-gray-400 text-xs">
          Última actualización: ahora mismo
        </div>
      </div>
    </div>
  );
}
