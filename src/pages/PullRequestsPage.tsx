import { useOutletContext } from 'react-router-dom';
import { DashboardData } from '../types';
import {
  KPICard, TimeStats, PRTable, MaterialIcon
} from '../components';

export function PullRequestsPage() {
  const data = useOutletContext<DashboardData>();
  const { prs, prList } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header - Stitch Style */}
      <div className="stitch-page-header">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-gradient-to-r from-[#A100FF] to-[#7500C0] p-3 rounded-xl shadow-lg shadow-purple-200/50">
            <MaterialIcon icon="commit" size={28} className="text-white" />
          </div>
          <div>
            <h1 className="stitch-page-title">Repository Activity &amp; PRs</h1>
            <p className="stitch-page-subtitle">Análisis de PRs generadas por Copilot SWE Agent</p>
          </div>
        </div>
      </div>

      {/* Filter Bar - Stitch Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="stitch-filter-bar">
            <MaterialIcon icon="filter_list" size={18} />
            Global Filter
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="stitch-filter-bar">
            <MaterialIcon icon="file_download" size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          title="Total PRs"
          value={prs.total}
          materialIcon="commit"
          color="purple"
        />
        <KPICard
          title="PRs Abiertas"
          value={prs.open}
          materialIcon="visibility"
          color="orange"
        />
        <KPICard
          title="PRs Merged"
          value={prs.merged}
          materialIcon="check_circle"
          color="green"
        />
        <KPICard
          title="PRs Rechazadas"
          value={prs.rejected}
          materialIcon="cancel"
          color="red"
        />
        <KPICard
          title="Con Custom Agent"
          value={prs.withAgent}
          subtitle={`${prs.total > 0 ? Math.round((prs.withAgent / prs.total) * 100) : 0}%`}
          materialIcon="smart_toy"
          color="blue"
        />
        <KPICard
          title="Custom Agents"
          value={prs.uniqueAgents}
          subtitle="Agentes distintos"
          materialIcon="group"
          color="purple"
        />
      </div>

      {/* Time Stats */}
      <TimeStats
        avgDaysToClose={prs.avgDaysToClose}
        minDaysToClose={prs.minDaysToClose}
        maxDaysToClose={prs.maxDaysToClose}
        totalComments={prs.totalComments}
        avgComments={prs.avgComments}
      />

      {/* PR Table */}
      <PRTable prs={prList} />
    </div>
  );
}
