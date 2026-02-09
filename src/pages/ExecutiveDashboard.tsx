import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, DollarSign, Users, Clock, Target, 
  Building2, Briefcase, BarChart3, PieChart, Calendar,
  CheckCircle2, XCircle, AlertCircle, Zap, Award, AlertTriangle, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend,
  LineChart, Line
} from 'recharts';
import { fetchDashboardData } from '../services/github';
import { Footer, Loading, NavBar } from '../components';

// Badge component for simulated data - Stitch Style
const SimulatedBadge = () => (
  <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full border border-amber-500/30">
    <AlertTriangle className="w-3 h-3" />
    Simulado
  </span>
);

// Badge for partially simulated data (historical) - Stitch Style
const HistoricalBadge = () => (
  <span className="inline-flex items-center gap-1 bg-[#A100FF]/20 text-[#A100FF] text-xs font-medium px-2 py-0.5 rounded-full border border-[#A100FF]/30">
    <Calendar className="w-3 h-3" />
    Histórico simulado
  </span>
);

export function ExecutiveDashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    refetch();
  };

  if (isLoading) return <Loading />;
  
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#FFFFFF] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error al cargar datos</h2>
          <Link to="/" className="text-[#A100FF] hover:underline">Volver al dashboard principal</Link>
        </div>
      </div>
    );
  }

  const { seats, prs } = data;

  // ============================================
  // ROI CALCULATIONS
  // ============================================
  const HOURLY_RATE = 75; // €/hora desarrollador senior
  const HOURS_PER_PR = 4; // Horas estimadas por PR manual
  const LICENSE_COST_MONTHLY = 39; // $ por licencia/mes
  
  const totalPRsAutomated = prs.total;
  const hourssSaved = totalPRsAutomated * HOURS_PER_PR;
  const moneySaved = hourssSaved * HOURLY_RATE;
  const licenseCost = seats?.totalSeats ? seats.totalSeats * LICENSE_COST_MONTHLY : 0;
  const netSavings = moneySaved - licenseCost;
  const roi = licenseCost > 0 ? ((moneySaved - licenseCost) / licenseCost * 100) : 0;
  
  // PRs per developer per week
  const activeDevelopers = seats?.withActivity || 1;
  const weeksOfData = 4; // Assuming 4 weeks of data
  const prsPerDevPerWeek = (totalPRsAutomated / activeDevelopers / weeksOfData).toFixed(1);

  // ============================================
  // ADOPTION DATA (Simulated by teams)
  // ============================================
  const teamAdoption = [
    { team: 'Core Banking', total: 45, active: 42, adoption: 93 },
    { team: 'Digital Channels', total: 38, active: 35, adoption: 92 },
    { team: 'Risk & Compliance', total: 52, active: 45, adoption: 87 },
    { team: 'Data & Analytics', total: 35, active: 30, adoption: 86 },
    { team: 'Infrastructure', total: 28, active: 22, adoption: 79 },
    { team: 'Security', total: 25, active: 18, adoption: 72 },
    { team: 'Mobile Apps', total: 32, active: 28, adoption: 88 },
    { team: 'API Platform', total: 42, active: 38, adoption: 90 },
  ];

  // Real data from API
  const activeUsers = seats?.withActivity || 0;
  const inactiveUsers = (seats?.totalSeats || 0) - activeUsers;
  
  const adoptionPieData = [
    { name: 'Con Actividad', value: activeUsers, color: '#00A551' },
    { name: 'Sin Actividad', value: inactiveUsers, color: '#FFB800' },
  ];

  // ============================================
  // MONTHLY TRENDS
  // ============================================
  const monthlyTrend = prs.monthlyStats || [];
  const monthlyData = monthlyTrend.map((m, i) => ({
    month: m.month,
    PRs: m.count,
    trend: i > 0 ? ((m.count - monthlyTrend[i-1].count) / monthlyTrend[i-1].count * 100).toFixed(0) : 0
  }));

  // Adoption over time - Historical data is simulated, January 2026 is real
  const adoptionOverTime = [
    { month: 'Sep 25', licenses: 120, active: 45 },
    { month: 'Oct 25', licenses: 180, active: 95 },
    { month: 'Nov 25', licenses: 250, active: 165 },
    { month: 'Dic 25', licenses: 320, active: 230 },
    { month: 'Ene 26*', licenses: seats?.totalSeats || 385, active: seats?.withActivity || 270 },
  ];

  // ============================================
  // EXECUTIVE SUMMARY KPIs
  // ============================================
  const executiveKPIs = [
    { 
      title: 'ROI Estimado',
      value: `${roi.toFixed(0)}%`,
      subtitle: 'Retorno sobre inversión',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-emerald-500 to-emerald-700',
      trend: '+15%'
    },
    { 
      title: 'Ahorro Mensual',
      value: `€${(moneySaved / 1000).toFixed(0)}K`,
      subtitle: `${hourssSaved.toLocaleString('es-ES')} horas ahorradas`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-700',
      trend: '+22%'
    },
    { 
      title: 'Tasa de Adopción',
      value: `${seats?.adoptionRate || 0}%`,
      subtitle: `${seats?.withActivity || 0} de ${seats?.totalSeats || 0} usuarios`,
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-700',
      trend: '+8%'
    },
    { 
      title: 'Productividad',
      value: `${prsPerDevPerWeek}`,
      subtitle: 'PRs/desarrollador/semana',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600',
      trend: '+12%'
    },
  ];

  return (
    <div className="min-h-screen app-shell">
      <NavBar 
        lastUpdated={data.lastUpdated}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        isLiveData={data.isLiveData}
        dataSource={data.dataSource}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* ============================================
            SECTION 1: EXECUTIVE SUMMARY
        ============================================ */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A100FF] to-[#7500C0] flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
              <p className="text-gray-400 text-sm">Resumen ejecutivo de métricas clave</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {executiveKPIs.map((kpi, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    {kpi.icon}
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                    {kpi.trend}
                  </span>
                </div>
                <div className="text-4xl font-extrabold mb-1">{kpi.value}</div>
                <div className="text-lg font-semibold opacity-90">{kpi.title}</div>
                <div className="text-sm opacity-70 mt-1">{kpi.subtitle}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================
            SECTION 2: ROI PANEL
        ============================================ */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A551] to-[#008C44] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Panel de ROI
                <SimulatedBadge />
              </h2>
              <p className="text-gray-400 text-sm">Retorno de inversión y ahorro estimado (€75/hora, 4h/PR)</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* ROI Card */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border-t-4 border-[#00A551] border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00A551]" />
                Análisis de ROI
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[#E5E7EB]">
                  <span className="text-gray-400">PRs Automatizadas</span>
                  <span className="text-xl font-bold text-[#00A551]">{totalPRsAutomated}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#E5E7EB]">
                  <span className="text-gray-400">Horas Ahorradas</span>
                  <span className="text-xl font-bold text-[#A100FF]">{hourssSaved.toLocaleString('es-ES')}h</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#E5E7EB]">
                  <span className="text-gray-400">Valor Generado</span>
                  <span className="text-xl font-bold text-[#7500C0]">€{moneySaved.toLocaleString('es-ES')}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#E5E7EB]">
                  <span className="text-gray-400">Coste Licencias</span>
                  <span className="text-xl font-bold text-[#FFB800]">€{licenseCost.toLocaleString('es-ES')}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-[#00A551]/20 rounded-lg px-3 border border-[#00A551]/30">
                  <span className="text-gray-900 font-semibold">Ahorro Neto</span>
                  <span className="text-2xl font-extrabold text-[#00A551]">€{netSavings.toLocaleString('es-ES')}</span>
                </div>
              </div>
            </div>

            {/* Savings Breakdown */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border-t-4 border-[#A100FF] border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#A100FF]" />
                Desglose de Ahorro
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Horas Dev', valor: hourssSaved, fill: '#A100FF' },
                    { name: 'Valor €', valor: moneySaved / 100, fill: '#00A551' },
                    { name: 'Coste Lic', valor: licenseCost / 10, fill: '#FFB800' },
                    { name: 'ROI %', valor: roi, fill: '#7500C0' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" fontSize={12} stroke="#9ca3af" />
                    <YAxis fontSize={12} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                    <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                      {[0,1,2,3].map((_, index) => (
                        <Cell key={index} fill={['#A100FF', '#00A551', '#FFB800', '#7500C0'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROI Gauge */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border-t-4 border-[#7500C0] border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#7500C0]" />
                ROI Total
              </h3>
              <div className="flex flex-col items-center justify-center h-64">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="#E5E7EB" strokeWidth="16" />
                    <circle 
                      cx="96" cy="96" r="80" fill="none" 
                      stroke="url(#roiGradient)" strokeWidth="16"
                      strokeDasharray={`${Math.min(roi, 500) / 500 * 502} 502`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="roiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00A551" />
                        <stop offset="100%" stopColor="#008C44" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-[#00A551]">{roi.toFixed(0)}%</span>
                    <span className="text-sm text-gray-400">ROI</span>
                  </div>
                </div>
                <p className="text-center text-gray-400 mt-4">
                  Por cada €1 invertido, se generan <span className="font-bold text-[#00A551]">€{(1 + roi/100).toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 3: ADOPTION BY TEAMS
        ============================================ */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7500C0] to-[#460073] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Adopción por Equipos
                <SimulatedBadge />
              </h2>
              <p className="text-gray-400 text-sm">Distribución de uso por área de negocio (datos de ejemplo)</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Team Adoption Table */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border-t-4 border-[#7500C0] border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#7500C0]" />
                Ranking de Equipos
                <SimulatedBadge />
              </h3>
              <div className="space-y-3">
                {teamAdoption.sort((a, b) => b.adoption - a.adoption).map((team, index) => (
                  <div key={team.team} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-500' : index === 2 ? 'bg-amber-600' : 'bg-gray-600'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-900">{team.team}</span>
                        <span className="text-sm font-bold" style={{ color: team.adoption >= 85 ? '#00A551' : team.adoption >= 75 ? '#FFB800' : '#E4002B' }}>
                          {team.adoption}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${team.adoption}%`,
                            background: team.adoption >= 85 ? 'linear-gradient(90deg, #00A551, #008C44)' : 
                                       team.adoption >= 75 ? 'linear-gradient(90deg, #FFB800, #E0A200)' : 
                                       'linear-gradient(90deg, #E4002B, #dc2626)'
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{team.active} de {team.total} usuarios activos</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adoption Pie Chart */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border-t-4 border-[#A100FF] border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#A100FF]" />
                Estado de Licencias
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={adoptionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {adoptionPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00A551]"></div>
                  <span className="text-sm text-gray-400">Con Actividad ({activeUsers})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FFB800]"></div>
                  <span className="text-sm text-gray-400">Sin Actividad ({inactiveUsers})</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 4: MONTHLY TRENDS
        ============================================ */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A100FF] to-[#7500C0] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tendencias Mensuales</h2>
              <p className="text-gray-400 text-sm">Evolución del uso a lo largo del tiempo</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* PRs Over Time */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border-t-4 border-[#A100FF] border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#A100FF]" />
                PRs Generadas por Mes
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A100FF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#A100FF" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" fontSize={12} stroke="#9ca3af" />
                    <YAxis fontSize={12} stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="PRs" 
                      stroke="#A100FF" 
                      strokeWidth={3}
                      fill="url(#colorPRs)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Adoption Growth */}
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 border-t-4 border-[#00A551] border border-[#E5E7EB]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00A551]" />
                Curva de Adopción
                <HistoricalBadge />
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={adoptionOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" fontSize={12} stroke="#9ca3af" />
                    <YAxis fontSize={12} stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '12px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="licenses" 
                      stroke="#7500C0" 
                      strokeWidth={3}
                      dot={{ fill: '#7500C0', strokeWidth: 2 }}
                      name="Licencias Totales"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="active" 
                      stroke="#00A551" 
                      strokeWidth={3}
                      dot={{ fill: '#00A551', strokeWidth: 2 }}
                      name="Usuarios Activos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Quality & Speed Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFB800] to-[#E0A200] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Calidad y Velocidad</h2>
              <p className="text-gray-400 text-sm">Métricas de eficiencia del desarrollo</p>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 text-center border-t-4 border-[#00A551] border border-[#E5E7EB]">
              <CheckCircle2 className="w-12 h-12 text-[#00A551] mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-[#00A551]">{prs.mergeRate}%</div>
              <div className="text-gray-900 font-medium">Merge Rate</div>
              <div className="text-sm text-gray-500 mt-1">PRs integradas exitosamente</div>
            </div>
            
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 text-center border-t-4 border-[#A100FF] border border-[#E5E7EB]">
              <Clock className="w-12 h-12 text-[#A100FF] mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-[#A100FF]">{prs.avgDaysToClose}</div>
              <div className="text-gray-900 font-medium">Días Promedio</div>
              <div className="text-sm text-gray-500 mt-1">Tiempo de cierre de PR</div>
            </div>
            
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 text-center border-t-4 border-red-500 border border-[#E5E7EB]">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-red-400">{prs.rejectionRate}%</div>
              <div className="text-gray-900 font-medium">Rejection Rate</div>
              <div className="text-sm text-gray-500 mt-1">PRs rechazadas</div>
            </div>
            
            <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-lg p-6 text-center border-t-4 border-[#FFB800] border border-[#E5E7EB]">
              <AlertCircle className="w-12 h-12 text-[#FFB800] mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-[#FFB800]">{prs.pendingRate}%</div>
              <div className="text-gray-900 font-medium">Pending Rate</div>
              <div className="text-sm text-gray-500 mt-1">PRs en revisión</div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
