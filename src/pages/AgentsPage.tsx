import { useOutletContext } from 'react-router-dom';
import { MaterialIcon } from '../components/MaterialIcon';
import { DashboardData } from '../types';
import { 
  AgentDistributionChart, AgentEffectivenessChart, 
  AgentUsageBarChart, AgentRadarChart,
  AgentEffectiveness, StitchAgentGrid, StitchKPISummary,
  CommunityInsights, SectionDivider
} from '../components';

export function AgentsPage() {
  const data = useOutletContext<DashboardData>();
  const { prs, seats, languages, timezones } = data;

  // Calculate total PRs with agents
  const totalPRsWithAgents = prs.agentEffectiveness.reduce((sum, a) => sum + a.total, 0);
  // Simulate time saved (average 15 min per PR with agent assistance)
  const timeSavedHours = Math.round((totalPRsWithAgents * 15) / 60);
  // Get total users from seats data
  const totalUsers = seats?.totalUsers || seats?.totalSeats || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header - Stitch Light Design */}
      <div className="stitch-page-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="stitch-icon-container bg-[#F3E5FF]">
              <MaterialIcon icon="smart_toy" size={28} className="text-[#A100FF]" />
            </div>
            <div>
              <h1 className="stitch-page-title">Custom Agents & Extension Analytics</h1>
              <p className="stitch-page-subtitle">Ecosystem performance and usage trends across developer communities</p>
            </div>
          </div>
          {/* Filter Bar */}
          <button className="stitch-filter-bar">
            <MaterialIcon icon="calendar_today" size={18} />
            <span>Last 30 Days</span>
            <MaterialIcon icon="expand_more" size={18} />
          </button>
        </div>
      </div>

      {/* Stitch KPI Summary */}
      <StitchKPISummary 
        totalDevelopers={totalUsers}
        timeSaved={`${timeSavedHours}h`}
        activeAgents={prs.uniqueAgents}
        totalPRs={totalPRsWithAgents}
      />

      {/* Stitch Agent Grid */}
      <StitchAgentGrid data={prs.agentEffectiveness} />

      {/* Community Insights */}
      <CommunityInsights 
        languages={languages} 
        timezones={timezones}
        totalDevelopers={totalUsers} 
      />

      {/* Divider */}
      <SectionDivider variant="tech" icon="trending" text="Detailed Analysis" />

      {/* Distribution Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <AgentDistributionChart 
          data={prs.topAgents}
          withAgent={prs.withAgent}
          withoutAgent={prs.withoutAgent}
          uniqueAgents={prs.uniqueAgents}
        />
        <AgentUsageBarChart data={prs.agentEffectiveness.map(a => ({ name: a.agent, count: a.total }))} />
      </div>

      {/* Effectiveness Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <AgentEffectivenessChart data={prs.agentEffectiveness} />
        <AgentRadarChart data={prs.agentEffectiveness} />
      </div>

      {/* Effectiveness Tables */}
      <AgentEffectiveness 
        agentData={prs.agentEffectiveness}
        repoData={prs.repoEffectiveness}
      />
    </div>
  );
}
