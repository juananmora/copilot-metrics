import { useState, useMemo } from 'react';
import { MaterialIcon } from './MaterialIcon';
import type { ProcessedPR } from '../types';

interface PRTableProps {
  prs: ProcessedPR[];
}

export function PRTable({ prs }: PRTableProps) {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get unique agents for the dropdown
  const uniqueAgents = useMemo(() => {
    const agents = new Set<string>();
    prs.forEach(pr => {
      if (pr.customAgent && pr.customAgent !== '-') {
        agents.add(pr.customAgent);
      }
    });
    return Array.from(agents).sort();
  }, [prs]);

  const filteredPRs = useMemo(() => {
    return prs.filter(pr => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (!pr.title.toLowerCase().includes(searchLower) && 
            !pr.repository.toLowerCase().includes(searchLower) &&
            !pr.customAgent.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // State filter
      if (stateFilter !== 'all' && pr.state !== stateFilter) {
        return false;
      }
      
      // Agent filter
      if (selectedAgent === 'with-agent' && pr.customAgent === '-') {
        return false;
      }
      if (selectedAgent === 'without-agent' && pr.customAgent !== '-') {
        return false;
      }
      if (selectedAgent !== 'all' && selectedAgent !== 'with-agent' && selectedAgent !== 'without-agent') {
        if (pr.customAgent !== selectedAgent) {
          return false;
        }
      }
      
      return true;
    });
  }, [prs, search, stateFilter, selectedAgent]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPRs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPRs = filteredPRs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, stateFilter, selectedAgent, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const formatDate = (dateStr: string) => {
    if (dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStateIcon = (state: string, isMerged: boolean) => {
    if (state === 'open') return <MaterialIcon icon="schedule" size={16} className="text-amber-500" />;
    if (isMerged) return <MaterialIcon icon="check_circle" size={16} className="text-[#A100FF]" />;
    return <MaterialIcon icon="cancel" size={16} className="text-red-500" />;
  };

  const getStateBadge = (state: string, isMerged: boolean) => {
    if (state === 'open') {
      return <span className="badge-open">Abierta</span>;
    }
    if (isMerged) {
      return <span className="badge-merged">Merged</span>;
    }
    return <span className="badge-closed">Rechazada</span>;
  };

  return (
    <div className="stitch-card !rounded-2xl overflow-hidden !p-0">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A100FF]/10 flex items-center justify-center">
              <MaterialIcon icon="commit" size={20} className="text-[#A100FF]" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Pull Requests de Copilot</h2>
            <span className="bg-[#A100FF]/8 text-[#A100FF] px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {filteredPRs.length} de {prs.length}
            </span>
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 
                         text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#A100FF]/20 focus:border-[#A100FF]/40"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-gray-500 text-sm">por página</span>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MaterialIcon icon="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, repositorio o agente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 
                         text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A100FF]/20 focus:border-[#A100FF]/40"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <MaterialIcon icon="filter_list" size={18} className="text-gray-500" />
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as typeof stateFilter)}
              className="px-3 py-2 rounded-lg bg-white border border-gray-200 
                         text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#A100FF]/20 focus:border-[#A100FF]/40"
            >
              <option value="all">Todos los estados</option>
              <option value="open">Abiertas</option>
              <option value="closed">Cerradas</option>
            </select>
            
            {/* Agent filter with specific agents */}
            <div className="flex items-center gap-1">
              <MaterialIcon icon="smart_toy" size={18} className="text-gray-500" />
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white border border-gray-200 
                           text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#A100FF]/20 focus:border-[#A100FF]/40 max-w-[200px]"
              >
                <option value="all">Todos los agentes</option>
                <option value="with-agent">✓ Con Custom Agent</option>
                <option value="without-agent">✗ Sin Custom Agent</option>
                {uniqueAgents.length > 0 && (
                  <option disabled>──────────</option>
                )}
                {uniqueAgents.map(agent => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="stitch-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Repositorio</th>
              <th>Título</th>
              <th className="w-28">Estado</th>
              <th className="w-40">Agente</th>
              <th className="w-28">Fecha</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedPRs.map((pr, index) => (
              <tr key={`${pr.repository}-${pr.number}`}>
                <td className="text-gray-400 font-mono text-xs">{startIndex + index + 1}</td>
                <td>
                  <span className="text-sm font-medium text-gray-900 truncate block max-w-[200px]" title={pr.repository}>
                    {pr.repository.split('/')[1] || pr.repository}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-gray-500 truncate block max-w-[350px]" title={pr.title}>
                    {pr.title}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {getStateIcon(pr.state, pr.isMerged)}
                    {getStateBadge(pr.state, pr.isMerged)}
                  </div>
                </td>
                <td>
                  {pr.customAgent !== '-' ? (
                    <button
                      onClick={() => setSelectedAgent(pr.customAgent)}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-[#A100FF]/8 
                                 text-[#A100FF] text-xs font-medium truncate max-w-[130px] 
                                 hover:bg-[#A100FF]/15 transition-colors cursor-pointer border border-[#A100FF]/20"
                      title={`Filtrar por: ${pr.customAgent}`}
                    >
                      {pr.customAgent}
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="text-sm text-gray-500">
                  {formatDate(pr.createdAt)}
                </td>
                <td>
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-[#A100FF]/8 transition-colors inline-flex"
                    title="Ver en GitHub"
                  >
                    <MaterialIcon icon="open_in_new" size={16} className="text-[#A100FF]" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredPRs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <MaterialIcon icon="commit" size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">No se encontraron PRs con los filtros aplicados</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredPRs.length > 0 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
          {/* Info */}
          <div className="text-sm text-gray-500">
            Mostrando <span className="font-semibold text-gray-900">{startIndex + 1}</span> a{' '}
            <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredPRs.length)}</span> de{' '}
            <span className="font-semibold text-gray-900">{filteredPRs.length}</span> resultados
            {selectedAgent !== 'all' && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-[#A100FF]/8 rounded-full text-xs text-[#A100FF] font-medium">
                <MaterialIcon icon="smart_toy" size={12} />
                {selectedAgent === 'with-agent' ? 'Con Custom Agent' : 
                 selectedAgent === 'without-agent' ? 'Sin Custom Agent' : selectedAgent}
                <button 
                  onClick={() => setSelectedAgent('all')}
                  className="ml-1 hover:text-red-500 transition-colors"
                  title="Quitar filtro"
                >
                  <MaterialIcon icon="close" size={12} />
                </button>
              </span>
            )}
          </div>
          
          {/* Pagination controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Primera página"
            >
              <MaterialIcon icon="first_page" size={18} className="text-gray-600" />
            </button>
            
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <MaterialIcon icon="chevron_left" size={18} className="text-gray-600" />
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
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
                    onClick={() => goToPage(pageNum)}
                    className={`min-w-[32px] h-8 rounded-lg font-medium text-sm transition-colors
                      ${currentPage === pageNum 
                        ? 'bg-[#A100FF] text-white' 
                        : 'hover:bg-gray-100 text-gray-600'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
            >
              <MaterialIcon icon="chevron_right" size={18} className="text-gray-600" />
            </button>
            
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Última página"
            >
              <MaterialIcon icon="last_page" size={18} className="text-gray-600" />
            </button>
          </div>
          
          {/* Quick jump */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Ir a:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-200 bg-white rounded-lg text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A100FF]/20"
            />
            <span>de {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
}
