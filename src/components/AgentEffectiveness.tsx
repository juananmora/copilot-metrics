import { MaterialIcon } from './MaterialIcon';

interface AgentData {
  agent: string;
  total: number;
  open: number;
  merged: number;
  rejected: number;
  mergeRate: number;
}

interface RepoData {
  repo: string;
  total: number;
  open: number;
  merged: number;
  rejected: number;
  mergeRate: number;
}

interface AgentEffectivenessProps {
  agentData: AgentData[];
  repoData: RepoData[];
}

function getMergeRateClass(rate: number) {
  if (rate >= 70) return 'text-[#00A551] bg-[#00A551]/10 border border-[#00A551]/20';
  if (rate >= 50) return 'text-amber-500 bg-amber-500/10 border border-amber-500/20';
  return 'text-red-500 bg-red-500/10 border border-red-500/20';
}

function getMergeRateIcon(rate: number) {
  if (rate >= 70) return <MaterialIcon icon="trending_up" size={16} />;
  if (rate >= 50) return <MaterialIcon icon="trending_flat" size={16} />;
  return <MaterialIcon icon="trending_down" size={16} />;
}

export function AgentEffectiveness({ agentData, repoData }: AgentEffectivenessProps) {
  const thBase = 'py-2.5 px-2 font-semibold text-gray-500 text-[11px] uppercase tracking-wider whitespace-nowrap';
  const tdBase = 'py-2.5 px-2 font-medium';

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Agent Effectiveness */}
      <div className="stitch-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-[#A100FF]/10 flex items-center justify-center">
            <MaterialIcon icon="smart_toy" size={20} className="text-[#A100FF]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Efectividad por Agente</h3>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <colgroup>
              <col />
              <col style={{ width: 46 }} />
              <col style={{ width: 46 }} />
              <col style={{ width: 52 }} />
              <col style={{ width: 52 }} />
              <col style={{ width: 78 }} />
            </colgroup>
            <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
              <tr>
                <th className={`text-left ${thBase} pl-3`}>Agente</th>
                <th className={`text-center ${thBase}`}>Total</th>
                <th className={`text-center ${thBase}`}>Open</th>
                <th className={`text-center ${thBase}`}>Merg.</th>
                <th className={`text-center ${thBase}`}>Rej.</th>
                <th className={`text-right ${thBase} pr-3`}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agentData.slice(0, 15).map((item, index) => (
                <tr key={index} className="hover:bg-[#A100FF]/[0.03] transition-colors">
                  <td className={`${tdBase} pl-3`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MaterialIcon icon="smart_toy" size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 truncate" title={item.agent}>
                        {item.agent}
                      </span>
                    </div>
                  </td>
                  <td className={`text-center ${tdBase} text-gray-500`}>{item.total}</td>
                  <td className={`text-center ${tdBase} text-amber-500`}>{item.open}</td>
                  <td className={`text-center ${tdBase} text-[#00A551]`}>{item.merged}</td>
                  <td className={`text-center ${tdBase} text-red-500`}>{item.rejected}</td>
                  <td className={`text-right ${tdBase} pr-3`}>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-semibold text-xs ${getMergeRateClass(item.mergeRate)}`}>
                      {getMergeRateIcon(item.mergeRate)}
                      {item.mergeRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {agentData.length === 0 && (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-2">
              <MaterialIcon icon="smart_toy" size={32} className="text-gray-300" />
              No hay datos de agentes disponibles
            </div>
          )}
        </div>
      </div>
      
      {/* Repository Effectiveness */}
      <div className="stitch-card rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-[#A100FF]/10 flex items-center justify-center">
            <MaterialIcon icon="analytics" size={20} className="text-[#A100FF]" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Efectividad por Repositorio</h3>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <colgroup>
              <col />
              <col style={{ width: 46 }} />
              <col style={{ width: 46 }} />
              <col style={{ width: 52 }} />
              <col style={{ width: 52 }} />
              <col style={{ width: 78 }} />
            </colgroup>
            <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
              <tr>
                <th className={`text-left ${thBase} pl-3`}>Repositorio</th>
                <th className={`text-center ${thBase}`}>Total</th>
                <th className={`text-center ${thBase}`}>Open</th>
                <th className={`text-center ${thBase}`}>Merg.</th>
                <th className={`text-center ${thBase}`}>Rej.</th>
                <th className={`text-right ${thBase} pr-3`}>Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repoData.map((item, index) => (
                <tr key={index} className="hover:bg-[#A100FF]/[0.03] transition-colors">
                  <td className={`${tdBase} pl-3`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MaterialIcon icon="folder" size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-900 truncate" title={item.repo}>
                        {item.repo.split('/')[1] || item.repo}
                      </span>
                    </div>
                  </td>
                  <td className={`text-center ${tdBase} text-gray-500`}>{item.total}</td>
                  <td className={`text-center ${tdBase} text-amber-500`}>{item.open}</td>
                  <td className={`text-center ${tdBase} text-[#00A551]`}>{item.merged}</td>
                  <td className={`text-center ${tdBase} text-red-500`}>{item.rejected}</td>
                  <td className={`text-right ${tdBase} pr-3`}>
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-semibold text-xs ${getMergeRateClass(item.mergeRate)}`}>
                      {getMergeRateIcon(item.mergeRate)}
                      {item.mergeRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {repoData.length === 0 && (
            <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-2">
              <MaterialIcon icon="folder_off" size={32} className="text-gray-300" />
              No hay datos de repositorios disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
