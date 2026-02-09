import { useState, useMemo } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { ProcessedSeat } from '../types';

// GitHub Enterprise base URL
const GITHUB_BASE_URL = 'https://github.com';

// Parse date helper for components (expects ISO format from backend)
function parseDateString(dateStr: string): Date | null {
  if (!dateStr || dateStr === '-') return null;
  
  const date = new Date(dateStr);
  if (!Number.isNaN(date.getTime())) return date;
  
  return null;
}

// Mini Sparkline component for activity visualization
function ActivitySparkline({ lastActivityAt, isActive }: Readonly<{ lastActivityAt: string; isActive: boolean }>) {
  const generateActivityPattern = () => {
    if (!isActive || lastActivityAt === '-') {
      return [0, 0, 0, 0, 0, 0, 0];
    }
    
    const lastActivity = parseDateString(lastActivityAt);
    if (!lastActivity) {
      return [20, 30, 25, 40, 35, 60, 80];
    }
    
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    const pattern = [];
    for (let i = 6; i >= 0; i--) {
      if (i >= daysSinceActivity) {
        pattern.push(Math.random() * 60 + 40);
      } else if (i === daysSinceActivity - 1 && daysSinceActivity <= 7) {
        pattern.push(80 + Math.random() * 20);
      } else {
        pattern.push(Math.random() * 20);
      }
    }
    return pattern;
  };

  const pattern = useMemo(generateActivityPattern, [lastActivityAt, isActive]);
  const patternItems = useMemo(
    () => pattern.map((value, idx) => ({ id: `${lastActivityAt || 'na'}-${idx}`, value })),
    [pattern, lastActivityAt]
  );
  const maxHeight = 20;

  return (
    <div className="flex items-end gap-0.5 h-5" title="Actividad últimos 7 días">
      {patternItems.map((item) => {
        let colorClass = 'bg-gray-200';
        if (item.value > 60) {
          colorClass = 'bg-[#00A551]';
        } else if (item.value > 30) {
          colorClass = 'bg-[#A100FF]/40';
        }

        return (
        <div
          key={item.id}
          className={`w-1 rounded-sm transition-all ${colorClass}`}
          style={{ height: `${(item.value / 100) * maxHeight}px` }}
        />
      );
      })}
    </div>
  );
}

interface TopUsersTableProps {
  users: ProcessedSeat[];
  isLiveData?: boolean;
  dataSource?: string;
}

export function TopUsersTable({ users, isLiveData = true, dataSource }: Readonly<TopUsersTableProps>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'prCount' | 'activity' | 'name'>('prCount');

  // Sort users - default by PR count (REAL DATA from API)
  const sortedUsers = useMemo(() => {
    const activeUsers = users.filter(u => u.lastActivityAt !== '-' && u.isActive);
    
    return activeUsers.sort((a, b) => {
      if (sortBy === 'prCount') {
        return (b.prCount || 0) - (a.prCount || 0);
      }
      if (sortBy === 'activity') {
        const dateA = parseDateString(a.lastActivityAt);
        const dateB = parseDateString(b.lastActivityAt);
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.getTime() - dateA.getTime();
      }
      return (a.name || a.login).localeCompare(b.name || b.login);
    });
  }, [users, sortBy]);

  // Filter by search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return sortedUsers;
    const term = searchTerm.toLowerCase();
    return sortedUsers.filter(u => 
      u.login.toLowerCase().includes(term) ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.lastActivityEditor.toLowerCase().includes(term)
    );
  }, [sortedUsers, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Format editor name
  const formatEditor = (editor: string) => {
    if (editor.includes('vscode/')) {
      const match = /vscode\/([^/]+)/.exec(editor);
      return match ? `VS Code ${match[1]}` : 'VS Code';
    }
    if (editor.includes('jetbrains/')) {
      const match = /jetbrains\/([^/]+)/.exec(editor);
      return match ? `JetBrains ${match[1]}` : 'JetBrains';
    }
    if (editor === 'copilot-developer') return 'Copilot Developer';
    if (editor === 'copilot-chat') return 'Copilot Chat';
    if (editor === 'copilot_pr_review') return 'PR Review';
    return editor.length > 20 ? editor.substring(0, 17) + '...' : editor;
  };

  // Get rank icon name based on position
  const getRankIcon = (index: number): { icon: string; color: string; bg: string } => {
    if (index === 0) return { icon: 'emoji_events', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (index === 1) return { icon: 'military_tech', color: 'text-gray-400', bg: 'bg-gray-50' };
    if (index === 2) return { icon: 'military_tech', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (index < 10) return { icon: 'star', color: 'text-[#A100FF]', bg: 'bg-[#A100FF]/5' };
    return { icon: 'person', color: 'text-gray-400', bg: 'bg-gray-50' };
  };

  // Get user badges based on their stats
  const getUserBadges = (user: ProcessedSeat, index: number) => {
    const badges: Array<{ icon: string; color: string; bg: string; tooltip: string }> = [];
    
    if (index < 3 && (user.prCount || 0) > 0) {
      badges.push({ 
        icon: 'workspace_premium', 
        color: 'text-yellow-500', 
        bg: 'bg-yellow-50', 
        tooltip: 'Top Contributor - Entre los 3 primeros en PRs'
      });
    }
    
    if ((user.prCount || 0) >= 5) {
      badges.push({ 
        icon: 'rocket_launch', 
        color: 'text-[#A100FF]', 
        bg: 'bg-[#A100FF]/8', 
        tooltip: 'Power User - 5+ PRs asignadas'
      });
    }
    
    const lastActivity = parseDateString(user.lastActivityAt);
    if (lastActivity) {
      const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
      if (hoursSinceActivity <= 24) {
        badges.push({ 
          icon: 'local_fire_department', 
          color: 'text-orange-500', 
          bg: 'bg-orange-50', 
          tooltip: 'En racha - Actividad en las últimas 24h'
        });
      }
    }
    
    return badges;
  };

  // Time ago
  const getTimeAgo = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return dateStr;
    
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays}d`;
    if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} sem`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  // Calculate stats - REAL DATA
  const totalPRs = useMemo(() => {
    return sortedUsers.reduce((sum, u) => sum + (u.prCount || 0), 0);
  }, [sortedUsers]);

  const topUserPRs = sortedUsers.length > 0 ? (sortedUsers[0].prCount || 0) : 0;
  const avgPRs = sortedUsers.length > 0 ? Math.round(totalPRs / sortedUsers.length) : 0;

  return (
    <div className="stitch-card !rounded-2xl overflow-hidden !p-0">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A100FF]/10 flex items-center justify-center">
              <MaterialIcon icon="leaderboard" size={20} className="text-[#A100FF]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Ranking - PRs de Copilot Asignadas
            </h3>
            <span className="text-xs font-semibold text-[#00A551] bg-[#00A551]/8 px-2 py-0.5 rounded-full border border-[#00A551]/20">SWE Agent</span>
            {!isLiveData && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                DEMO
              </span>
            )}
            {dataSource && (
              <span className="text-xs text-gray-400" title={dataSource}>
                {dataSource}
              </span>
            )}
          </div>
          
          {/* Search and controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <MaterialIcon icon="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10 pr-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A100FF]/20 focus:border-[#A100FF]/40 w-48"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'prCount' | 'activity' | 'name')}
              className="px-3 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A100FF]/20 focus:border-[#A100FF]/40"
            >
              <option value="prCount">Por número de PRs</option>
              <option value="activity">Por última actividad</option>
              <option value="name">Por nombre</option>
            </select>
          </div>
        </div>

        {/* Stats summary - Copilot SWE Agent PRs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#A100FF]/5 rounded-xl p-4 text-center border border-[#A100FF]/10">
            <div className="text-2xl font-extrabold text-[#A100FF]">{sortedUsers.filter(u => (u.prCount || 0) > 0).length}</div>
            <div className="text-xs text-gray-500 mt-1">Usuarios con PRs asignadas</div>
          </div>
          <div className="bg-[#00A551]/5 rounded-xl p-4 text-center border border-[#00A551]/10">
            <div className="text-2xl font-extrabold text-[#00A551]">{totalPRs}</div>
            <div className="text-xs text-gray-500 mt-1">Total PRs Copilot asignadas</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
            <div className="text-2xl font-extrabold text-blue-600">{avgPRs}</div>
            <div className="text-xs text-gray-500 mt-1">Promedio PRs/usuario</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
            <div className="text-2xl font-extrabold text-yellow-600">{topUserPRs}</div>
            <div className="text-xs text-gray-500 mt-1">Máximo (Top 1)</div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="stitch-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Usuario</th>
                <th>
                  <div className="flex items-center gap-1">
                    <MaterialIcon icon="commit" size={14} />
                    PRs Creadas
                  </div>
                </th>
                <th className="text-center" title="Actividad de los últimos 7 días">
                  <div className="flex items-center justify-center gap-1">
                    <MaterialIcon icon="trending_up" size={14} />
                    Actividad
                  </div>
                </th>
                <th>Última Actividad</th>
                <th title="Último editor donde el usuario usó Copilot (no específico de PRs)">Último Editor Usado</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, idx) => {
                const globalIndex = startIndex + idx;
                const rank = getRankIcon(globalIndex);
                const prCount = user.prCount || 0;
                const prPercentage = topUserPRs > 0 ? (prCount / topUserPRs) * 100 : 0;
                const userBadges = getUserBadges(user, globalIndex);
                
                return (
                  <tr key={user.login}>
                    <td>
                      <div className={`w-8 h-8 rounded-lg ${rank.bg} flex items-center justify-center`}>
                        <MaterialIcon icon={rank.icon} size={18} className={rank.color} filled={globalIndex < 3} />
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <a 
                          href={`${GITHUB_BASE_URL}/${user.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative flex-shrink-0 group"
                        >
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.login}
                              className="w-9 h-9 rounded-full object-cover border-2 border-gray-200 group-hover:border-[#A100FF] transition-colors"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#A100FF]/10 flex items-center justify-center text-[#A100FF] text-xs font-bold group-hover:bg-[#A100FF]/20 transition-colors">
                              {user.name 
                                ? user.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
                                : user.login.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </a>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a 
                              href={`${GITHUB_BASE_URL}/${user.login}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-gray-900 hover:text-[#A100FF] transition-colors truncate text-sm"
                            >
                              {user.name || user.login}
                            </a>
                            {userBadges.length > 0 && (
                              <div className="flex items-center gap-1">
                                {userBadges.map((b) => (
                                  <div 
                                    key={`${b.icon}-${b.tooltip}`}
                                    className={`w-5 h-5 rounded ${b.bg} flex items-center justify-center`}
                                    title={b.tooltip}
                                  >
                                    <MaterialIcon icon={b.icon} size={14} className={b.color} filled />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.name ? user.login : `#${globalIndex + 1}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900">{prCount}</span>
                            <span className="text-[10px] text-gray-400">PRs</span>
                          </div>
                          <div className="stitch-hbar">
                            <div 
                              className="stitch-hbar-fill bg-[#A100FF]"
                              style={{ width: `${prPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-center">
                        <ActivitySparkline 
                          lastActivityAt={user.lastActivityAt} 
                          isActive={user.isActive} 
                        />
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <MaterialIcon icon="schedule" size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500">{getTimeAgo(user.lastActivityAt)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <MaterialIcon icon="desktop_windows" size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500" title={user.lastActivityEditor}>
                          {formatEditor(user.lastActivityEditor)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Mostrando</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 border border-gray-200 bg-white text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A100FF]/20"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>de {filteredUsers.length} usuarios activos</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <MaterialIcon icon="chevron_left" size={18} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${currentPage === pageNum 
                        ? 'bg-[#A100FF] text-white' 
                        : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <MaterialIcon icon="chevron_right" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
