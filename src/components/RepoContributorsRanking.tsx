import { useState } from 'react';
import { Trophy, GitCommit, GitPullRequest, Award, Star, Users, ExternalLink, FolderGit2 } from 'lucide-react';

// GitHub Enterprise base URL
const GITHUB_BASE_URL = 'https://github.com';

export interface Contributor {
  login: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  commits: number;
  prs: number;
  total: number;
}

export interface RepoContributorsData {
  repository: string;
  contributors: Contributor[];
  totalCommits: number;
  totalPRs: number;
}

interface RepoOption {
  value: string;
  label: string;
}

interface RepoContributorsRankingProps {
  data: RepoContributorsData | null;
  isLoading?: boolean;
  availableRepos?: RepoOption[];
  selectedRepo?: string;
  onRepoChange?: (repo: string) => void;
}

export function RepoContributorsRanking({ 
  data, 
  isLoading, 
  availableRepos = [],
  selectedRepo,
  onRepoChange 
}: RepoContributorsRankingProps) {
  const [sortBy, setSortBy] = useState<'total' | 'commits' | 'prs'>('total');

  const hasContributors = data && data.contributors.length > 0;

  // Sort contributors
  const sortedContributors = hasContributors
    ? [...data.contributors].sort((a, b) => {
        if (sortBy === 'commits') return b.commits - a.commits;
        if (sortBy === 'prs') return b.prs - a.prs;
        return b.total - a.total;
      })
    : [];

  // Get badge for position
  const getBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    if (index === 1) return { icon: Award, color: 'text-gray-400', bg: 'bg-gray-400/20' };
    if (index === 2) return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/20' };
    return { icon: Star, color: 'text-[#00A551]', bg: 'bg-[#00A551]/20' };
  };

  // Extract repo name for display
  const repoName = data?.repository?.split('/').pop() || selectedRepo || '';

  return (
    <div className="relative bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-xl overflow-hidden border border-[#E5E7EB]">
      {/* Top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#7500C0] via-[#ec4899] to-[#7500C0]"></div>
      
      <div className="p-6">
        {/* Header - ALWAYS visible with selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7500C0] to-[#ec4899] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Ranking de Contribuciones
              </h3>
              {repoName && (
                <a 
                  href={`${GITHUB_BASE_URL}/copilot-full-capacity/${repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#7500C0] hover:text-[#A100FF] flex items-center gap-1 transition-colors"
                >
                  {repoName}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          
          {/* Controls - ALWAYS visible */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Repository selector */}
            {availableRepos.length > 0 && onRepoChange && (
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedRepo}
                  onChange={(e) => onRepoChange(e.target.value)}
                  className="px-3 py-2 border border-[#E5E7EB] bg-[#F9FAFB] text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7500C0]/30 max-w-[220px]"
                >
                  {availableRepos.map(repo => (
                    <option key={repo.value} value={repo.value}>{repo.label}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Sort controls - only when there's data */}
            {hasContributors && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'total' | 'commits' | 'prs')}
                  className="px-3 py-2 border border-[#E5E7EB] bg-[#F9FAFB] text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7500C0]/30"
                >
                  <option value="total">Total</option>
                  <option value="commits">Commits</option>
                  <option value="prs">PRs</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="animate-pulse flex flex-col items-center justify-center h-32">
            <div className="w-10 h-10 bg-[#E5E7EB] rounded-full mb-3"></div>
            <div className="h-3 bg-[#E5E7EB] rounded w-40 mb-2"></div>
            <div className="h-2 bg-[#E5E7EB] rounded w-28"></div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !hasContributors && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Users className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">No hay contribuciones en este repositorio</p>
            <p className="text-xs mt-1 text-gray-400">Selecciona otro repositorio del desplegable</p>
          </div>
        )}

        {/* Data content */}
        {!isLoading && hasContributors && (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#7500C0]/10 to-[#7500C0]/20 rounded-xl p-4 text-center border border-[#7500C0]/20">
                <div className="text-2xl font-extrabold text-[#7500C0]">{data.contributors.length}</div>
                <div className="text-xs text-gray-500 font-medium">Contribuidores</div>
              </div>
              <div className="bg-gradient-to-br from-[#00A551]/10 to-[#00A551]/20 rounded-xl p-4 text-center border border-[#00A551]/20">
                <div className="text-2xl font-extrabold text-[#00A551]">{data.totalCommits}</div>
                <div className="text-xs text-gray-500 font-medium">Total Commits</div>
              </div>
              <div className="bg-gradient-to-br from-[#ec4899]/10 to-[#ec4899]/20 rounded-xl p-4 text-center border border-[#ec4899]/20">
                <div className="text-2xl font-extrabold text-[#ec4899]">{data.totalPRs}</div>
                <div className="text-xs text-gray-500 font-medium">Total PRs</div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contribuidor</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <GitCommit className="w-3 h-3" />
                        Commits
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <GitPullRequest className="w-3 h-3" />
                        PRs
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedContributors.map((contributor, idx) => {
                    const badge = getBadge(idx);
                    const BadgeIcon = badge.icon;
                    const maxTotal = sortedContributors[0]?.total || 1;
                    const percentage = (contributor.total / maxTotal) * 100;
                    
                    return (
                      <tr 
                        key={contributor.login} 
                        className="border-b border-[#E5E7EB]/50 hover:bg-[#F9FAFB]/50 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-lg ${badge.bg} flex items-center justify-center`}>
                            <BadgeIcon className={`w-4 h-4 ${badge.color}`} />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <a 
                              href={`${GITHUB_BASE_URL}/${contributor.login}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative flex-shrink-0"
                            >
                              {contributor.avatarUrl ? (
                                <img 
                                  src={contributor.avatarUrl} 
                                  alt={contributor.login}
                                  className="w-10 h-10 rounded-full border-2 border-[#E5E7EB] hover:border-[#7500C0] transition-colors"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7500C0] to-[#ec4899] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-[#7500C0] transition-all">
                                  {contributor.name 
                                    ? contributor.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
                                    : contributor.login.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#F9FAFB] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="w-2.5 h-2.5 text-[#7500C0]" />
                              </div>
                            </a>
                            <div>
                              <a 
                                href={`${GITHUB_BASE_URL}/${contributor.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-gray-900 hover:text-[#7500C0] transition-colors"
                              >
                                {contributor.name || contributor.login}
                              </a>
                              <div className="text-xs text-gray-500">
                                {contributor.name ? contributor.login : `#${idx + 1}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-[#00A551]">{contributor.commits}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-[#ec4899]">{contributor.prs}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 justify-center">
                            <div className="flex-1 max-w-[80px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-[#7500C0]">{contributor.total}</span>
                              </div>
                              <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#7500C0] to-[#ec4899] rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
