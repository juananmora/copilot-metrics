import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MaterialIcon } from './MaterialIcon';

interface ChartData {
  name: string;
  count: number;
}

interface WeeklyData {
  week: string;
  start: string;
  end: string;
  count: number;
}

const COLORS = ['#A100FF', '#00A551', '#7500C0', '#FFB800', '#06b6d4', '#ec4899', '#f43f5e', '#a855f7'];

/* ── Shared tooltip style ─────────────────────────────── */
const tooltipStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  padding: '12px 16px',
  color: '#111827',
};

/* ── Shared chart header ──────────────────────────────── */
function ChartHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        <MaterialIcon icon={icon} size={20} className="text-[#A100FF]" />
        {title}
      </h3>
      <button className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 p-1">
        <MaterialIcon icon="more_horiz" size={20} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TopItemsChart
   ═══════════════════════════════════════════════════════ */

interface TopItemsChartProps {
  title: string;
  data: ChartData[];
}

export function TopItemsChart({ title, data }: TopItemsChartProps) {
  const formatRepoName = (fullName: string) => {
    if (fullName.includes('/')) {
      const parts = fullName.split('/');
      const repoName = parts[parts.length - 1];
      return repoName.length > 28 ? repoName.substring(0, 25) + '...' : repoName;
    }
    return fullName.length > 28 ? fullName.substring(0, 25) + '...' : fullName;
  };

  return (
    <div className="stitch-card p-6">
      <ChartHeader icon="bar_chart" title={title} />

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#A100FF" />
                <stop offset="100%" stopColor="#7500C0" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis type="number" fontSize={11} stroke="#9CA3AF" tickLine={false} axisLine={false} />
            <YAxis 
              type="category" 
              dataKey="name" 
              fontSize={10} 
              width={180}
              stroke="#9CA3AF"
              tickFormatter={formatRepoName}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={tooltipStyle}
              formatter={(value) => [<span className="font-bold text-[#A100FF]">{value}</span>, 'PRs']}
              labelFormatter={(label) => <span className="font-semibold text-gray-900">{label}</span>}
            />
            <Bar 
              dataKey="count" 
              fill="url(#barGradient)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DistributionPieChart
   ═══════════════════════════════════════════════════════ */

interface PieChartProps {
  title: string;
  data: ChartData[];
}

export function DistributionPieChart({ title, data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div className="stitch-card p-6">
      <ChartHeader icon="donut_large" title={title} />

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.slice(0, 6)}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              label={({ name, percent }) => `${(name || '').substring(0, 15)}${(name || '').length > 15 ? '...' : ''} (${((percent || 0) * 100).toFixed(0)}%)`}
              labelLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
            >
              {data.slice(0, 6).map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value} (${(((value as number) / total) * 100).toFixed(1)}%)`, 'Usuarios']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TrendChart
   ═══════════════════════════════════════════════════════ */

interface TrendChartProps {
  title: string;
  weeklyData: WeeklyData[];
}

export function TrendChart({ title, weeklyData }: TrendChartProps) {
  const chartData = [...weeklyData].reverse().map(w => ({
    name: w.week,
    PRs: w.count,
    periodo: `${w.start} - ${w.end}`
  }));

  return (
    <div className="stitch-card p-6">
      <ChartHeader icon="trending_up" title={title} />

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPRsTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A100FF" stopOpacity={0.18}/>
                <stop offset="95%" stopColor="#A100FF" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" fontSize={11} stroke="#9CA3AF" tickLine={false} axisLine={false} />
            <YAxis fontSize={11} stroke="#9CA3AF" tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={tooltipStyle}
              labelFormatter={(_, payload) => payload[0]?.payload?.periodo || ''}
              formatter={(value) => [<span className="font-bold text-[#A100FF]">{value}</span>, 'PRs']}
            />
            <Area 
              type="monotone" 
              dataKey="PRs" 
              stroke="#A100FF" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorPRsTrend)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EditorDistribution
   ═══════════════════════════════════════════════════════ */

interface EditorDistributionProps {
  data: ChartData[];
  totalWithActivity: number;
}

export function EditorDistribution({ data, totalWithActivity }: EditorDistributionProps) {
  const formatEditorName = (name: string) => {
    if (name.includes('vscode/')) {
      const match = name.match(/vscode\/([^/]+)/);
      return match ? `VS Code ${match[1]}` : name;
    }
    if (name.includes('jetbrains/')) {
      const match = name.match(/jetbrains\/([^/]+)/);
      return match ? `JetBrains ${match[1]}` : name;
    }
    if (name.length > 20) return name.substring(0, 17) + '...';
    return name;
  };

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="stitch-card p-6">
      <ChartHeader icon="code" title="Distribución por Editor" />

      <div className="space-y-3">
        {data.slice(0, 8).map((item, index) => {
          const width = (item.count / maxCount) * 100;
          const percentage = totalWithActivity > 0 ? ((item.count / totalWithActivity) * 100).toFixed(1) : '0';
          const barColors = ['#A100FF', '#00A551', '#7500C0', '#FFB800', '#ec4899', '#06b6d4', '#f97316', '#a855f7'];
          
          return (
            <div key={index} className="group">
              <div className="grid grid-cols-[120px_1fr_50px] items-center gap-3">
                <span className="text-xs text-right truncate text-gray-400 group-hover:text-gray-900 transition-colors" title={item.name}>
                  {formatEditorName(item.name)}
                </span>
                <div className="bg-gray-100 rounded-lg h-7 overflow-hidden">
                  <div 
                    className="h-full rounded-lg flex items-center justify-end pr-3 transition-all duration-700 ease-out"
                    style={{ 
                      width: `${Math.max(width, 15)}%`,
                      background: `linear-gradient(90deg, ${barColors[index % barColors.length]}, ${barColors[index % barColors.length]}99)`
                    }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow">{item.count}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length > 8 && (
        <p className="mt-5 text-xs text-gray-400 text-center py-2 bg-gray-50 rounded-lg">
          + {data.length - 8} otros editores ({data.slice(8).reduce((sum, d) => sum + d.count, 0)} usuarios)
        </p>
      )}
    </div>
  );
}
