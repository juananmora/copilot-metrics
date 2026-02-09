import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DashboardData } from '../types';
import {
  AIBanner,
  EffectivenessPanel,
  TopItemsChart,
  TrendChart,
  ContributionGraph,
  PulseMonitor,
  MaterialIcon,
  KPICard,
} from '../components';
import { AnimatedNumber } from '../hooks';

export function OverviewPage() {
  const data = useOutletContext<DashboardData>();
  const { seats, prs, prList, languages } = data;

  // Generate activity data from real PR creation dates
  const activityData = useMemo(() => {
    const activity: Record<string, number> = {};
    prList.forEach((pr) => {
      if (pr.createdAt) {
        const date = pr.createdAt.split('T')[0];
        activity[date] = (activity[date] || 0) + 1;
      }
    });
    return activity;
  }, [prList]);

  // Calculate real hourly activity for PulseMonitor
  const hourlyActivityData = useMemo(() => {
    const now = new Date();
    const hourlyData: number[] = [];
    const hourCounts: Record<string, number> = {};
    prList.forEach((pr) => {
      if (pr.createdAt) {
        const prDate = new Date(pr.createdAt);
        const hourKey = `${prDate.getFullYear()}-${prDate.getMonth()}-${prDate.getDate()}-${prDate.getHours()}`;
        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
      }
    });
    const maxPRsPerHour = Math.max(...Object.values(hourCounts), 1);
    for (let i = 59; i >= 0; i--) {
      const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = `${hourDate.getFullYear()}-${hourDate.getMonth()}-${hourDate.getDate()}-${hourDate.getHours()}`;
      const count = hourCounts[hourKey] || 0;
      const normalized = Math.round((count / maxPRsPerHour) * 100);
      hourlyData.push(Math.max(5, normalized));
    }
    return hourlyData;
  }, [prList]);

  const mergeActivityData = useMemo(() => {
    const now = new Date();
    const hourlyData: number[] = [];
    const hourCounts: Record<string, number> = {};
    prList.forEach((pr) => {
      if (pr.isMerged && pr.closedAt) {
        const mergeDate = new Date(pr.closedAt);
        const hourKey = `${mergeDate.getFullYear()}-${mergeDate.getMonth()}-${mergeDate.getDate()}-${mergeDate.getHours()}`;
        hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
      }
    });
    const maxMergesPerHour = Math.max(...Object.values(hourCounts), 1);
    for (let i = 59; i >= 0; i--) {
      const hourDate = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = `${hourDate.getFullYear()}-${hourDate.getMonth()}-${hourDate.getDate()}-${hourDate.getHours()}`;
      const count = hourCounts[hourKey] || 0;
      const normalized = Math.round((count / maxMergesPerHour) * 100);
      hourlyData.push(Math.max(5, normalized));
    }
    return hourlyData;
  }, [prList]);

  const currentActivityLevel = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prsLast24h = prList.filter((pr) => new Date(pr.createdAt) >= last24h).length;
    const totalDays = Math.max(
      1,
      Math.ceil(
        (now.getTime() - new Date(prList[prList.length - 1]?.createdAt || now).getTime()) /
          (24 * 60 * 60 * 1000)
      )
    );
    const avgPRsPerDay = prList.length / totalDays;
    if (prsLast24h === 0) return 0;
    const ratio = prsLast24h / Math.max(1, avgPRsPerDay);
    return Math.min(100, Math.round(ratio * 33.3));
  }, [prList]);

  const mergeVelocityLevel = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const mergedPRs = prList.filter((pr) => pr.isMerged);
    const mergesLast24h = mergedPRs.filter(
      (pr) => pr.closedAt && new Date(pr.closedAt) >= last24h
    ).length;
    const totalDays = Math.max(
      1,
      Math.ceil(
        (now.getTime() - new Date(mergedPRs[mergedPRs.length - 1]?.closedAt || now).getTime()) /
          (24 * 60 * 60 * 1000)
      )
    );
    const avgMergesPerDay = mergedPRs.length / totalDays;
    if (mergesLast24h === 0) return 0;
    const ratio = mergesLast24h / Math.max(1, avgMergesPerDay);
    return Math.min(100, Math.round(ratio * 33.3));
  }, [prList]);

  // Calculate adoption rate as percentage
  const adoptionPercent = seats?.adoptionRate ?? 0;

  // Seat utilization
  const totalSeats = seats?.totalSeats ?? 0;
  const withActivity = seats?.withActivity ?? 0;
  const seatUtilization = totalSeats > 0 ? Math.round((withActivity / totalSeats) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI Innovation Banner */}
      <AIBanner
        totalPRs={prs.total}
        withAgent={prs.withAgent}
        mergeRate={prs.mergeRate}
        uniqueAgents={prs.uniqueAgents}
        merged={prs.merged}
        avgDaysToClose={prs.avgDaysToClose}
        open={prs.open}
        rejectionRate={prs.rejectionRate}
      />

      {/* Stitch-style KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Active Users"
          value={totalSeats}
          materialIcon="person"
          trend="up"
          trendValue={`+${adoptionPercent}%`}
          color="purple"
          subtitle={`${withActivity} con actividad`}
        />
        <KPICard
          title="Acceptance Rate"
          value={`${prs.mergeRate}%`}
          materialIcon="check_circle"
          trend="up"
          trendValue={`+${prs.merged}`}
          color="green"
          subtitle={`${prs.merged} merged de ${prs.total}`}
        />
        <KPICard
          title="Custom Agents"
          value={prs.uniqueAgents}
          materialIcon="smart_toy"
          trend="up"
          trendValue={`${prs.withAgent} PRs`}
          color="blue"
          subtitle={`${prs.withAgent} PRs con agente`}
        />
        <KPICard
          title="Avg. Days to Close"
          value={typeof prs.avgDaysToClose === 'number' ? prs.avgDaysToClose.toFixed(1) : '0'}
          materialIcon="schedule"
          trend="down"
          trendValue={`${prs.open} open`}
          color="orange"
          subtitle={`${prs.total} PRs totales`}
        />
      </div>

      {/* Adoption Trends + Usage by Language (Stitch layout) */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Adoption Trends - 2/3 width */}
        <div className="md:col-span-2">
          <ContributionGraph
            title="Actividad de PRs de Copilot"
            startMonth="2025-12"
            endMonth="2026-06"
            activityData={activityData}
          />
        </div>

        {/* Usage by Language - 1/3 width (Stitch style) */}
        <div className="stitch-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MaterialIcon icon="code" size={20} className="text-[#A100FF]" />
              Usage by Language
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MaterialIcon icon="more_horiz" size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {(languages || []).map((lang) => (
              <div key={lang.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{lang.name}</span>
                  <span className="text-sm font-bold text-gray-900">{lang.percentage}%</span>
                </div>
                <div className="stitch-hbar">
                  <div
                    className="stitch-hbar-fill"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color || '#A100FF',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seat Utilization (Premium style) */}
      <div className="stitch-card p-6 card-accent-top">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#A100FF]/10 flex items-center justify-center">
                <MaterialIcon icon="event_seat" size={20} className="text-[#A100FF]" />
              </div>
              Seat Utilization
            </h3>
            <p className="text-sm text-gray-500 mt-1 ml-[46px]">Current active licenses vs total available</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-extrabold stat-value-purple">
              <AnimatedNumber value={seatUtilization} duration={1200} />%
            </span>
            <p className="text-xs text-gray-400 font-medium mt-1">Assigned</p>
          </div>
        </div>
        <div className="stitch-gauge-track rounded-full overflow-hidden">
          <div
            className="stitch-gauge-fill"
            style={{ width: `${seatUtilization}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="text-gray-400 text-xs font-medium">Total Seats</span>
              <span className="font-bold text-gray-900 counter-value">
                <AnimatedNumber value={totalSeats} duration={1200} />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00A551]" />
              <span className="text-gray-400 text-xs font-medium">Active</span>
              <span className="font-bold text-[#00A551] counter-value">
                <AnimatedNumber value={withActivity} duration={1200} />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="text-gray-400 text-xs font-medium">Unassigned</span>
            <span className="font-bold text-gray-500 counter-value">
              <AnimatedNumber value={totalSeats - withActivity} duration={1200} />
            </span>
          </div>
        </div>
      </div>

      {/* Pulse Monitor - Real Activity Data */}
      <div className="grid md:grid-cols-2 gap-6">
        <PulseMonitor
          activityLevel={currentActivityLevel}
          data={hourlyActivityData}
          title="Actividad de PRs (últimas 60h)"
          subtitle={`${prList.filter((pr) => new Date(pr.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length} PRs en últimas 24h`}
          realTimeSimulation={false}
          legendText="Compara los PRs creados en las últimas 24h con el promedio diario histórico."
        />
        <PulseMonitor
          activityLevel={mergeVelocityLevel}
          data={mergeActivityData}
          title="Velocidad de Merges (últimas 60h)"
          subtitle={`${prList.filter((pr) => pr.isMerged && pr.closedAt && new Date(pr.closedAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length} merges en últimas 24h`}
          realTimeSimulation={false}
          legendText="Compara los merges realizados en las últimas 24h con el promedio diario histórico."
        />
      </div>

      {/* Effectiveness Panel */}
      <EffectivenessPanel
        mergeRate={prs.mergeRate}
        rejectionRate={prs.rejectionRate}
        pendingRate={prs.pendingRate}
      />

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <TopItemsChart title="Top 10 Repositorios" data={prs.topRepos} />
        <TrendChart title="Tendencia Semanal de PRs" weeklyData={prs.weeklyStats} />
      </div>
    </div>
  );
}
