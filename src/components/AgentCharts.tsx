import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Line
} from 'recharts';
import { Bot, Target, TrendingUp, Users } from 'lucide-react';

interface AgentData {
  agent: string;
  total: number;
  open: number;
  merged: number;
  rejected: number;
  mergeRate: number;
}

interface TopAgent {
  name: string;
  count: number;
}

const COLORS = [
  '#A100FF', '#00A551', '#7500C0', '#06b6d4', '#FFB800', 
  '#ec4899', '#f97316', '#14b8a6', '#a855f7', '#E4002B',
  '#22c55e', '#3b82f6', '#eab308', '#f472b6', '#6366f1'
];

interface AgentDistributionChartProps {
  data: TopAgent[];
  withAgent: number;
  withoutAgent: number;
  uniqueAgents: number;
}

export function AgentDistributionChart({ data, withAgent, withoutAgent, uniqueAgents }: AgentDistributionChartProps) {
  const total = withAgent + withoutAgent;
  
  // Prepare data for the horizontal bar visualization
  const topAgents = data.slice(0, 6);
  const othersCount = data.slice(6).reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...topAgents.map(d => d.count), othersCount, withoutAgent);

  return (
    <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border border-[#E5E7EB]">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Bot className="w-5 h-5 text-[#7500C0]" />
        Distribución de PRs por Agente
      </h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-[#7500C0]/20 to-[#7500C0]/30 rounded-xl p-4 text-gray-900 text-center border border-[#7500C0]/30">
          <div className="text-2xl font-bold text-[#7500C0]">{withAgent}</div>
          <div className="text-xs text-gray-400">Con Custom Agent</div>
          <div className="text-xs text-gray-500 mt-1">{((withAgent / total) * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-gradient-to-br from-[#E5E7EB]/50 to-[#E5E7EB]/70 rounded-xl p-4 text-gray-900 text-center border border-[#E5E7EB]">
          <div className="text-2xl font-bold text-gray-400">{withoutAgent}</div>
          <div className="text-xs text-gray-400">Sin Custom Agent</div>
          <div className="text-xs text-gray-500 mt-1">{((withoutAgent / total) * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-gradient-to-br from-[#A100FF]/20 to-[#A100FF]/30 rounded-xl p-4 text-gray-900 text-center border border-[#A100FF]/30">
          <div className="text-2xl font-bold text-[#A100FF]">{uniqueAgents}</div>
          <div className="text-xs text-gray-400">Agentes</div>
          <div className="text-xs text-gray-500 mt-1">únicos</div>
        </div>
      </div>
      
      {/* Horizontal Bar Distribution */}
      <div className="space-y-3">
        {topAgents.map((agent, index) => {
          const width = (agent.count / maxCount) * 100;
          const percentage = ((agent.count / total) * 100).toFixed(1);
          return (
            <div key={agent.name} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600 truncate max-w-[180px]" title={agent.name}>
                  {agent.name}
                </span>
                <span className="text-sm font-bold text-gray-400">{agent.count} <span className="text-xs text-gray-500">({percentage}%)</span></span>
              </div>
              <div className="h-6 bg-[#E5E7EB] rounded-lg overflow-hidden">
                <div 
                  className="h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2"
                  style={{ 
                    width: `${Math.max(width, 8)}%`,
                    background: `linear-gradient(90deg, ${COLORS[index]}, ${COLORS[index]}cc)`
                  }}
                >
                  {width > 20 && <span className="text-xs font-semibold text-white">{agent.count}</span>}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Others row */}
        {othersCount > 0 && (
          <div className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-500">Otros agentes ({data.length - 6})</span>
              <span className="text-sm font-bold text-gray-500">{othersCount} <span className="text-xs text-gray-600">({((othersCount / total) * 100).toFixed(1)}%)</span></span>
            </div>
            <div className="h-6 bg-[#E5E7EB] rounded-lg overflow-hidden">
              <div 
                className="h-full rounded-lg transition-all duration-700 ease-out bg-gradient-to-r from-gray-500 to-gray-600"
                style={{ width: `${Math.max((othersCount / maxCount) * 100, 8)}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Without agent row */}
        <div className="group pt-2 border-t border-[#E5E7EB] mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-500 italic">Sin Custom Agent</span>
            <span className="text-sm font-bold text-gray-500">{withoutAgent} <span className="text-xs">({((withoutAgent / total) * 100).toFixed(1)}%)</span></span>
          </div>
          <div className="h-6 bg-[#E5E7EB] rounded-lg overflow-hidden">
            <div 
              className="h-full rounded-lg transition-all duration-700 ease-out bg-gradient-to-r from-gray-600 to-gray-500"
              style={{ width: `${Math.max((withoutAgent / maxCount) * 100, 8)}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Total bar at bottom */}
      <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Total PRs</span>
          <span className="font-bold text-gray-900">{total}</span>
        </div>
        <div className="h-3 bg-[#E5E7EB] rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-[#7500C0] to-[#a855f7] transition-all duration-1000"
            style={{ width: `${(withAgent / total) * 100}%` }}
            title={`Con Custom Agent asignado: ${withAgent}`}
          />
          <div 
            className="h-full bg-gradient-to-r from-gray-500 to-gray-600 transition-all duration-1000"
            style={{ width: `${(withoutAgent / total) * 100}%` }}
            title={`Sin Custom Agent asignado: ${withoutAgent}`}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Con Custom Agent ({((withAgent / total) * 100).toFixed(0)}%)</span>
          <span>Sin Custom Agent ({((withoutAgent / total) * 100).toFixed(0)}%)</span>
        </div>
      </div>
    </div>
  );
}

interface AgentEffectivenessChartProps {
  data: AgentData[];
}

export function AgentEffectivenessChart({ data }: AgentEffectivenessChartProps) {
  // Prepare data for comparison chart
  const chartData = data.slice(0, 10).map(d => ({
    name: d.agent.length > 15 ? d.agent.substring(0, 12) + '...' : d.agent,
    fullName: d.agent,
    Merged: d.merged,
    Rechazadas: d.rejected,
    Abiertas: d.open,
    'Merge Rate': d.mergeRate
  }));

  return (
    <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border border-[#E5E7EB]">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-[#00A551]" />
        Efectividad de Custom Agents (Top 10)
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              angle={-45} 
              textAnchor="end" 
              fontSize={11}
              interval={0}
              height={80}
              stroke="#9ca3af"
            />
            <YAxis yAxisId="left" fontSize={12} stroke="#9ca3af" />
            <YAxis yAxisId="right" orientation="right" fontSize={12} domain={[0, 100]} unit="%" stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F9FAFB', 
                border: '1px solid #E5E7EB', 
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                color: '#e5e7eb'
              }}
              labelFormatter={(_, payload) => payload[0]?.payload?.fullName || ''}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#9ca3af' }} />
            <Bar yAxisId="left" dataKey="Merged" stackId="a" fill="#00A551" radius={[0, 0, 0, 0]} />
            <Bar yAxisId="left" dataKey="Rechazadas" stackId="a" fill="#E4002B" radius={[0, 0, 0, 0]} />
            <Bar yAxisId="left" dataKey="Abiertas" stackId="a" fill="#FFB800" radius={[4, 4, 0, 0]} />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="Merge Rate" 
              stroke="#A100FF" 
              strokeWidth={3}
              dot={{ fill: '#A100FF', strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend explanation */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#00A551]" />
          <span>Merged</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#E4002B]" />
          <span>Rechazadas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#FFB800]" />
          <span>Abiertas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#A100FF]" />
          <span>Merge Rate (%)</span>
        </div>
      </div>
    </div>
  );
}

export function AgentUsageBarChart({ data }: { data: TopAgent[] }) {
  // Show ALL agents, sorted by count
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const chartData = sortedData.map((d, i) => ({
    name: d.name.length > 20 ? d.name.substring(0, 17) + '...' : d.name,
    fullName: d.name,
    PRs: d.count,
    fill: COLORS[i % COLORS.length]
  }));

  const maxValue = Math.max(...chartData.map(d => d.PRs));
  // Dynamic height based on number of agents (minimum 280px, 28px per bar)
  const chartHeight = Math.max(280, chartData.length * 28);

  return (
    <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border border-[#E5E7EB]">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#06b6d4]" />
        Uso de Custom Agents (PRs generadas)
        <span className="text-xs font-normal text-gray-500 ml-2">({chartData.length} agentes)</span>
      </h3>
      
      <div style={{ height: `${chartHeight}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
            <XAxis type="number" fontSize={12} stroke="#9ca3af" />
            <YAxis 
              type="category" 
              dataKey="name" 
              fontSize={11} 
              width={130}
              tickFormatter={(value) => value}
              stroke="#9ca3af"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F9FAFB', 
                border: '1px solid #E5E7EB', 
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                color: '#e5e7eb'
              }}
              labelFormatter={(_, payload) => payload[0]?.payload?.fullName || ''}
              formatter={(value) => [`${value} PRs`, 'Cantidad']}
            />
            <Bar 
              dataKey="PRs" 
              radius={[0, 6, 6, 0]}
              label={{ 
                position: 'right', 
                fontSize: 11, 
                fill: '#9ca3af'
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  opacity={0.8 + (0.2 * (entry.PRs / maxValue))}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AgentRadarChart({ data }: AgentEffectivenessChartProps) {
  // Prepare radar data for top 6 agents
  const radarData = data.slice(0, 6).map(d => ({
    agent: d.agent.length > 12 ? d.agent.substring(0, 9) + '...' : d.agent,
    fullName: d.agent,
    'Total PRs': Math.min(d.total * 5, 100), // Normalize
    'Merge Rate': d.mergeRate,
    'Actividad': Math.min((d.total / data[0].total) * 100, 100),
    'Efectividad': d.mergeRate > 0 ? d.mergeRate : 10
  }));

  return (
    <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border border-[#E5E7EB]">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#7500C0]" />
        Comparativa de Agentes (Top 6)
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="agent" fontSize={11} stroke="#9ca3af" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} stroke="#6b7280" />
            <Radar
              name="Merge Rate"
              dataKey="Merge Rate"
              stroke="#A100FF"
              fill="#A100FF"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Actividad"
              dataKey="Actividad"
              stroke="#00A551"
              fill="#00A551"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#F9FAFB', 
                border: '1px solid #E5E7EB', 
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                color: '#e5e7eb'
              }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface AgentSummaryCardsProps {
  data: AgentData[];
  topAgents: TopAgent[];
  uniqueAgents: number;
}

export function AgentSummaryCards({ data, topAgents, uniqueAgents }: AgentSummaryCardsProps) {
  // Calculate summary stats - use total from ALL agents, not just top 10
  const totalPRsWithAgent = data.reduce((sum, a) => sum + a.total, 0);
  const avgMergeRate = data.length > 0 
    ? Math.round(data.reduce((sum, a) => sum + a.mergeRate, 0) / data.length * 10) / 10
    : 0;
  const mostUsedAgent = topAgents.length > 0 ? topAgents[0] : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-[#7500C0]/20 to-[#7500C0]/30 rounded-2xl p-5 text-gray-900 shadow-lg border border-[#7500C0]/30">
        <Bot className="w-8 h-8 mb-2 text-[#7500C0]" />
        <div className="text-3xl font-bold text-[#7500C0]">{uniqueAgents}</div>
        <div className="text-sm text-gray-500">Custom Agents distintos</div>
      </div>
      
      <div className="bg-gradient-to-br from-[#06b6d4]/20 to-[#06b6d4]/30 rounded-2xl p-5 text-gray-900 shadow-lg border border-[#06b6d4]/30">
        <TrendingUp className="w-8 h-8 mb-2 text-[#06b6d4]" />
        <div className="text-3xl font-bold text-[#06b6d4]">{totalPRsWithAgent}</div>
        <div className="text-sm text-gray-500">PRs con Custom Agent</div>
      </div>
      
      <div className="bg-gradient-to-br from-[#00A551]/20 to-[#00A551]/30 rounded-2xl p-5 text-gray-900 shadow-lg border border-[#00A551]/30">
        <Target className="w-8 h-8 mb-2 text-[#00A551]" />
        <div className="text-3xl font-bold text-[#00A551]">{avgMergeRate}%</div>
        <div className="text-sm text-gray-500">Merge Rate Promedio</div>
      </div>
      
      <div className="bg-gradient-to-br from-[#FFB800]/20 to-[#FFB800]/30 rounded-2xl p-5 text-gray-900 shadow-lg border border-[#FFB800]/30">
        <Users className="w-8 h-8 mb-2 text-[#FFB800]" />
        <div className="text-xl font-bold truncate text-[#FFB800]" title={mostUsedAgent?.name}>
          {mostUsedAgent?.name || '-'}
        </div>
        <div className="text-sm text-gray-500">Más utilizado ({mostUsedAgent?.count || 0} PRs)</div>
      </div>
    </div>
  );
}
