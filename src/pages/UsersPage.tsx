import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardData } from '../types';
import { AdoptionPanel, EditorDistribution, TopUsersTable, RepoContributorsRanking } from '../components';
import { MaterialIcon } from '../components/MaterialIcon';
import { fetchRepoContributors, fetchOrgRepos } from '../services/github';

export function UsersPage() {
  const data = useOutletContext<DashboardData>();
  const { seats, seatsList, prs } = data;
  const [selectedRepo, setSelectedRepo] = useState('');

  // Fetch real repos from the organization
  const { data: orgRepos } = useQuery({
    queryKey: ['orgRepos'],
    queryFn: () => fetchOrgRepos(),
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1,
  });

  // Build repo list: org repos + any extra repos from PR data (deduplicated)
  const allRepos = useMemo(() => {
    const repoMap = new Map<string, { value: string; label: string }>();

    // Add repos from the organization (real data)
    if (orgRepos && orgRepos.length > 0) {
      for (const repo of orgRepos) {
        repoMap.set(repo.name, { value: repo.name, label: repo.name });
      }
    }

    // Add repos that appear in PR data (also real data)
    if (prs?.topRepos) {
      for (const repo of prs.topRepos) {
        const repoName = repo.name.split('/').pop() || repo.name;
        if (!repoMap.has(repoName)) {
          repoMap.set(repoName, { value: repoName, label: repoName });
        }
      }
    }

    // Sort alphabetically
    return Array.from(repoMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [orgRepos, prs?.topRepos]);

  // Auto-select the first repo once the list is available
  const isSelectedRepoValid = selectedRepo ? allRepos.some(r => r.value === selectedRepo) : false;
  const effectiveRepo = isSelectedRepoValid
    ? selectedRepo
    : allRepos[0]?.value || '';

  // Fetch contributors for selected repository (directly via GitHub service)
  const { data: contributorsData, isLoading: contributorsLoading } = useQuery({
    queryKey: ['contributors', effectiveRepo],
    queryFn: () => fetchRepoContributors(effectiveRepo),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: !!effectiveRepo,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Stitch Style */}
      <div className="stitch-page-header">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-gradient-to-r from-[#00A551] to-[#06b6d4] p-3 rounded-xl shadow-lg shadow-green-200/50">
            <MaterialIcon icon="group" size={28} className="text-white" />
          </div>
          <div>
            <h1 className="stitch-page-title">Developer Performance Profile</h1>
            <p className="stitch-page-subtitle">Copilot adoption analytics and user engagement insights</p>
          </div>
        </div>
      </div>

      {/* Adoption Panel */}
      {seats && (
        <AdoptionPanel stats={seats} />
      )}

      {/* Editor Distribution */}
      {seats && seats.byEditor.length > 0 && (
        <EditorDistribution 
          data={seats.byEditor} 
          totalWithActivity={seats.withActivity} 
        />
      )}

      {/* Top Users Table */}
      {seatsList && seatsList.length > 0 && (
        <TopUsersTable users={seatsList} isLiveData={data.isLiveData} dataSource={data.dataSource} />
      )}

      {/* Repository Contributors Ranking */}
      <RepoContributorsRanking 
        data={contributorsData || null} 
        isLoading={contributorsLoading}
        availableRepos={allRepos}
        selectedRepo={effectiveRepo}
        onRepoChange={setSelectedRepo}
      />
    </div>
  );
}
