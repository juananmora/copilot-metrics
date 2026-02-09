import { useQuery } from '@tanstack/react-query';
import { 
  GitPullRequest, 
  GitMerge, 
  GitPullRequestClosed, 
  Clock,
  Bot,
  Users
} from 'lucide-react';
import { fetchDashboardData, fetchRepoContributors } from './services/github';
import {
  Header,
  Footer,
  AIBanner,
  SectionDivider,
  KPICard,
  EffectivenessPanel,
  TopItemsChart,
  TrendChart,
  EditorDistribution,
  AdoptionPanel,
  PRTable,
  AgentEffectiveness,
  TimeStats,
  Loading,
  ErrorState,
  TopUsersTable,
  AgentDistributionChart,
  AgentEffectivenessChart,
  AgentUsageBarChart,
  AgentRadarChart,
  AgentSummaryCards,
  RepoContributorsRanking
} from './components';

function App() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch contributors for copilot-instructions repository
  const { data: contributorsData, isLoading: contributorsLoading } = useQuery({
    queryKey: ['contributors', 'copilot-instructions'],
    queryFn: () => fetchRepoContributors('copilot-instructions'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!data, // Only fetch after main data is loaded
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error instanceof Error ? error.message : 'Error desconocido'} 
        onRetry={() => refetch()} 
      />
    );
  }

  if (!data) {
    return <Loading />;
  }

  const { seats, seatsList, prs, prList, lastUpdated, isLiveData, dataSource } = data;

  return (
    <div className="min-h-screen bg-white">
      <Header 
        lastUpdated={lastUpdated} 
        onRefresh={() => refetch()} 
        isLoading={isFetching}
        isLiveData={isLiveData}
        dataSource={dataSource}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* AI Innovation Banner */}
        <section className="animate-fade-in">
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
        </section>
        
        {/* Divider after AI Banner */}
        <SectionDivider variant="tech" icon="sparkles" text="Adopción" />
        
        {/* Adoption Section - Only if seats data is available */}
        {seats && (
          <section className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <AdoptionPanel stats={seats} />
          </section>
        )}
        
        {/* Editor Distribution */}
        {seats && seats.byEditor.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <EditorDistribution 
              data={seats.byEditor} 
              totalWithActivity={seats.withActivity} 
            />
          </section>
        )}

        {/* Top Users Table */}
        {seatsList && seatsList.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: '0.12s' }}>
            <TopUsersTable users={seatsList} />
          </section>
        )}

        {/* Repository Contributors Ranking */}
        <section className="animate-fade-in" style={{ animationDelay: '0.13s' }}>
          <RepoContributorsRanking 
            data={contributorsData || null} 
            isLoading={contributorsLoading} 
          />
        </section>
        
        {/* Divider before PR KPIs */}
        <SectionDivider variant="gradient" />
        
        {/* PR KPIs */}
        <section className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <GitPullRequest className="w-7 h-7 text-[#A100FF]" />
            Pull Requests por Copilot
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              title="Total PRs"
              value={prs.total}
              icon={<GitPullRequest className="w-6 h-6" />}
              color="blue"
            />
            <KPICard
              title="PRs Abiertas"
              value={prs.open}
              icon={<Clock className="w-6 h-6" />}
              color="orange"
            />
            <KPICard
              title="PRs Merged"
              value={prs.merged}
              icon={<GitMerge className="w-6 h-6" />}
              color="purple"
            />
            <KPICard
              title="PRs Rechazadas"
              value={prs.rejected}
              icon={<GitPullRequestClosed className="w-6 h-6" />}
              color="red"
            />
            <KPICard
              title="Custom Agents"
              value={prs.uniqueAgents}
              subtitle="Agentes distintos usados"
              icon={<Bot className="w-6 h-6" />}
              color="aqua"
            />
            <KPICard
              title="Con Custom Agent"
              value={prs.withAgent}
              subtitle={`${Math.round((prs.withAgent / prs.total) * 100)}% con agente asignado`}
              icon={<Users className="w-6 h-6" />}
              color="green"
            />
          </div>
        </section>
        
        {/* Effectiveness Dashboard */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <EffectivenessPanel 
            mergeRate={prs.mergeRate}
            rejectionRate={prs.rejectionRate}
            pendingRate={prs.pendingRate}
          />
        </section>
        
        {/* Divider */}
        <SectionDivider variant="dots" icon="zap" />
        
        {/* Time Stats */}
        <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <TimeStats
            avgDaysToClose={prs.avgDaysToClose}
            minDaysToClose={prs.minDaysToClose}
            maxDaysToClose={prs.maxDaysToClose}
            totalComments={prs.totalComments}
            avgComments={prs.avgComments}
          />
        </section>
        
        {/* Divider */}
        <SectionDivider variant="wave" icon="trending" />
        
        {/* Charts Section */}
        <section className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <TopItemsChart 
            title="Top 10 Repositorios" 
            data={prs.topRepos} 
          />
          <TrendChart 
            title="Tendencia Semanal de PRs" 
            weeklyData={prs.weeklyStats} 
          />
        </section>
        
        {/* Divider before Agent Analytics */}
        <SectionDivider variant="tech" icon="bot" text="Custom Agents" />
        
        {/* ========== AGENT ANALYTICS SECTION ========== */}
        <section className="animate-fade-in" style={{ animationDelay: '0.55s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Análisis de Custom Agents</h2>
              <p className="text-gray-500 text-sm">Métricas detalladas del uso de agentes personalizados</p>
            </div>
          </div>
          
          {/* Agent Summary Cards */}
          <AgentSummaryCards 
            data={prs.agentEffectiveness}
            topAgents={prs.topAgents}
            uniqueAgents={prs.uniqueAgents}
          />
        </section>
        
        {/* Agent Charts Row 1 */}
        <section className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <AgentDistributionChart 
            data={prs.topAgents}
            withAgent={prs.withAgent}
            withoutAgent={prs.withoutAgent}
            uniqueAgents={prs.uniqueAgents}
          />
          <AgentUsageBarChart data={prs.agentEffectiveness.map(a => ({ name: a.agent, count: a.total }))} />
        </section>
        
        {/* Agent Charts Row 2 */}
        <section className="grid md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.65s' }}>
          <AgentEffectivenessChart data={prs.agentEffectiveness} />
          <AgentRadarChart data={prs.agentEffectiveness} />
        </section>
        
        {/* Divider */}
        <SectionDivider variant="dots" icon="target" />
        
        {/* Agent and Repo Effectiveness Tables */}
        <section className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <AgentEffectiveness 
            agentData={prs.agentEffectiveness}
            repoData={prs.repoEffectiveness}
          />
        </section>
        
        {/* Divider before PR Table */}
        <SectionDivider variant="tech" icon="git" text="Pull Requests" />
        
        {/* PR Table */}
        <section className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <PRTable prs={prList} />
        </section>
      </main>
      
      {/* Accenture Footer */}
      <Footer />
    </div>
  );
}

export default App;
