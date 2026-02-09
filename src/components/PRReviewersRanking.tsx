import { Trophy, Award, Star, Eye, CheckCircle, XCircle, MessageSquare, ExternalLink } from 'lucide-react';
import { PRReviewer } from '../services/github';

// GitHub Enterprise base URL
const GITHUB_BASE_URL = 'https://github.com';

interface PRReviewersRankingProps {
  data: {
    reviewers: PRReviewer[];
    totalReviews: number;
  } | null;
  isLoading?: boolean;
  isLive?: boolean;
}

export function PRReviewersRanking({ data, isLoading, isLive }: PRReviewersRankingProps) {
  const hasReviewers = data && data.reviewers.length > 0;

  // Get badge for position
  const getBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    if (index === 1) return { icon: Award, color: 'text-gray-400', bg: 'bg-gray-400/20' };
    if (index === 2) return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/20' };
    return { icon: Star, color: 'text-[#06b6d4]', bg: 'bg-[#06b6d4]/20' };
  };

  const topReviewers = hasReviewers ? data.reviewers.slice(0, 10) : [];
  const maxReviews = topReviewers[0]?.reviewCount || 1;

  return (
    <div className="relative bg-gradient-to-br from-[#FFFFFF] to-[#F9FAFB] rounded-2xl shadow-xl overflow-hidden border border-[#E5E7EB]">
      {/* Top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#06b6d4] via-[#00A551] to-[#06b6d4]"></div>
      
      <div className="p-6">
        {/* Header - ALWAYS visible */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#00A551] flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Ranking de Revisores
              </h3>
              <p className="text-sm text-gray-400">
                Quién ha revisado más PRs de Copilot SWE Agent
              </p>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="animate-pulse flex flex-col items-center justify-center h-32">
            <div className="w-10 h-10 bg-[#E5E7EB] rounded-full mb-3"></div>
            <div className="h-3 bg-[#E5E7EB] rounded w-48 mb-2"></div>
            <div className="h-2 bg-[#E5E7EB] rounded w-32"></div>
          </div>
        )}

        {/* Empty state - only show when not loading */}
        {!isLoading && !hasReviewers && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Eye className="w-10 h-10 mb-3 opacity-50" />
            {isLive === false ? (
              <>
                <p className="text-sm">Datos de revisores no disponibles en modo demo</p>
                <p className="text-xs mt-1 text-gray-400">Configura un token en Ajustes para ver datos reales</p>
              </>
            ) : (
              <>
                <p className="text-sm">No se encontraron revisores en las PRs analizadas</p>
                <p className="text-xs mt-1 text-gray-400">Las PRs de Copilot SWE Agent aún no tienen reviews</p>
              </>
            )}
          </div>
        )}

        {/* Data content */}
        {!isLoading && hasReviewers && (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#06b6d4]/10 to-[#06b6d4]/20 rounded-xl p-4 text-center border border-[#06b6d4]/20">
                <div className="text-2xl font-extrabold text-[#06b6d4]">{data.reviewers.length}</div>
                <div className="text-xs text-gray-500 font-medium">Revisores</div>
              </div>
              <div className="bg-gradient-to-br from-[#00A551]/10 to-[#00A551]/20 rounded-xl p-4 text-center border border-[#00A551]/20">
                <div className="text-2xl font-extrabold text-[#00A551]">{data.totalReviews}</div>
                <div className="text-xs text-gray-500 font-medium">Total Reviews</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/20 rounded-xl p-4 text-center border border-green-500/20">
                <div className="text-2xl font-extrabold text-green-500">
                  {data.reviewers.reduce((sum, r) => sum + r.approvedCount, 0)}
                </div>
                <div className="text-xs text-gray-500 font-medium">Aprobaciones</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/20 rounded-xl p-4 text-center border border-orange-500/20">
                <div className="text-2xl font-extrabold text-orange-500">
                  {data.reviewers.reduce((sum, r) => sum + r.changesRequestedCount, 0)}
                </div>
                <div className="text-xs text-gray-500 font-medium">Cambios Pedidos</div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Revisor</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" />
                        Reviews
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Aprobados
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="w-3 h-3 text-orange-500" />
                        Cambios
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                        Comentarios
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topReviewers.map((reviewer, idx) => {
                    const badge = getBadge(idx);
                    const BadgeIcon = badge.icon;
                    const percentage = (reviewer.reviewCount / maxReviews) * 100;
                    
                    return (
                      <tr 
                        key={reviewer.login} 
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
                              href={`${GITHUB_BASE_URL}/${reviewer.login}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative flex-shrink-0"
                            >
                              {reviewer.avatarUrl ? (
                                <img 
                                  src={reviewer.avatarUrl} 
                                  alt={reviewer.login}
                                  className="w-10 h-10 rounded-full border-2 border-[#E5E7EB] hover:border-[#06b6d4] transition-colors"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#00A551] flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-[#06b6d4] transition-all">
                                  {reviewer.name 
                                    ? reviewer.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
                                    : reviewer.login.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#F9FAFB] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="w-2.5 h-2.5 text-[#06b6d4]" />
                              </div>
                            </a>
                            <div>
                              <a 
                                href={`${GITHUB_BASE_URL}/${reviewer.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-gray-900 hover:text-[#06b6d4] transition-colors"
                              >
                                {reviewer.name || reviewer.login}
                              </a>
                              <div className="text-xs text-gray-500">
                                {reviewer.name ? reviewer.login : `#${idx + 1}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-bold text-[#06b6d4]">{reviewer.reviewCount}</span>
                            <div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#06b6d4] to-[#00A551] rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-green-500">{reviewer.approvedCount}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-orange-500">{reviewer.changesRequestedCount}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-sm font-bold text-blue-400">{reviewer.commentedCount}</span>
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
