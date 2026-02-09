import { MaterialIcon } from './MaterialIcon';

interface AgentData {
  agent: string;
  total: number;
  open: number;
  merged: number;
  rejected: number;
  mergeRate: number;
}

interface StitchAgentCardProps {
  name: string;
  description: string;
  category: string;
  successRate: number;
  usageCount: number;
  trend: number;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'amber' | 'cyan';
}

const colorMap = {
  purple: {
    iconBg: 'bg-[#F3E5FF]',
    iconText: 'text-[#A100FF]',
    badge: 'bg-[rgba(161,0,255,0.06)] text-[#A100FF] border border-[rgba(161,0,255,0.15)]',
  },
  blue: {
    iconBg: 'bg-[#E8F4FD]',
    iconText: 'text-[#0070AD]',
    badge: 'bg-[rgba(0,112,173,0.06)] text-[#0070AD] border border-[rgba(0,112,173,0.15)]',
  },
  green: {
    iconBg: 'bg-[#E6F9EF]',
    iconText: 'text-[#00A551]',
    badge: 'bg-[rgba(0,165,81,0.06)] text-[#00A551] border border-[rgba(0,165,81,0.15)]',
  },
  amber: {
    iconBg: 'bg-[#FFF8E6]',
    iconText: 'text-[#B88600]',
    badge: 'bg-[rgba(255,184,0,0.06)] text-[#B88600] border border-[rgba(255,184,0,0.15)]',
  },
  cyan: {
    iconBg: 'bg-[#E6F7FB]',
    iconText: 'text-[#0891B2]',
    badge: 'bg-[rgba(8,145,178,0.06)] text-[#0891B2] border border-[rgba(8,145,178,0.15)]',
  },
};

// Map agent names to Material icons, categories and colors
function getAgentMeta(agentName: string): {
  icon: string;
  category: string;
  color: 'purple' | 'blue' | 'green' | 'amber' | 'cyan';
  description: string;
} {
  const name = agentName.toLowerCase();

  if (name.includes('refactor') || name.includes('code')) {
    return {
      icon: 'code_blocks',
      category: 'BACKEND SYSTEMS',
      color: 'blue',
      description: 'Specialized in tech debt reduction and code refactoring',
    };
  }
  if (name.includes('security') || name.includes('seguridad') || name.includes('owasp')) {
    return {
      icon: 'security',
      category: 'CYBER QA',
      color: 'purple',
      description: 'Vulnerability scanning and security analysis',
    };
  }
  if (name.includes('test') || name.includes('qa') || name.includes('bug')) {
    return {
      icon: 'bug_report',
      category: 'QUALITY ASSURANCE',
      color: 'green',
      description: 'Automated testing and bug detection',
    };
  }
  if (name.includes('doc') || name.includes('readme')) {
    return {
      icon: 'description',
      category: 'DOCUMENTATION',
      color: 'amber',
      description: 'Technical documentation generation',
    };
  }
  if (name.includes('review') || name.includes('pr')) {
    return {
      icon: 'rate_review',
      category: 'CODE REVIEW',
      color: 'cyan',
      description: 'Pull request review and improvement',
    };
  }
  if (name.includes('api') || name.includes('schema')) {
    return {
      icon: 'schema',
      category: 'API DESIGN',
      color: 'blue',
      description: 'API design and schema validation',
    };
  }
  if (name.includes('ui') || name.includes('frontend') || name.includes('design')) {
    return {
      icon: 'palette',
      category: 'UI/UX',
      color: 'purple',
      description: 'UI component generation and design systems',
    };
  }
  if (name.includes('cloud') || name.includes('deploy') || name.includes('infra')) {
    return {
      icon: 'cloud_done',
      category: 'CLOUD OPS',
      color: 'cyan',
      description: 'Cloud infrastructure and deployment automation',
    };
  }

  // Default
  return {
    icon: 'smart_toy',
    category: 'AI AGENT',
    color: 'purple',
    description: 'Custom productivity agent',
  };
}

function StitchAgentCard({
  name,
  description,
  category,
  successRate,
  usageCount,
  trend,
  icon,
  color,
}: StitchAgentCardProps) {
  const colors = colorMap[color];
  const trendPositive = trend >= 0;

  return (
    <div className="stitch-agent-card p-5">
      {/* Header row: icon + success rate */}
      <div className="flex items-start justify-between mb-4">
        <div className={`stitch-icon-container ${colors.iconBg} rounded-xl`}>
          <MaterialIcon icon={icon} size={26} className={colors.iconText} />
        </div>
        <span className="stitch-success-badge">
          <MaterialIcon icon="check_circle" size={14} />
          {successRate}%
        </span>
      </div>

      {/* Title */}
      <h4 className="text-base font-bold text-[#111827] mb-1 line-clamp-1" title={name}>
        {name}
      </h4>

      {/* Description */}
      <p className="text-sm text-[#9CA3AF] mb-4 line-clamp-2">{description}</p>

      {/* Usage + Trend */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl font-extrabold text-[#111827]">{usageCount.toLocaleString()}</span>
        <span className="text-xs text-[#9CA3AF]">uses</span>
        <span
          className={`ml-auto inline-flex items-center gap-0.5 text-xs font-bold ${
            trendPositive ? 'text-[#00A551]' : 'text-[#E4002B]'
          }`}
        >
          <MaterialIcon icon={trendPositive ? 'trending_up' : 'trending_down'} size={14} />
          {trendPositive ? '+' : ''}
          {trend}%
        </span>
      </div>

      {/* Footer: category badge + response time */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${colors.badge}`}>
          {category}
        </span>
        <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
          <MaterialIcon icon="schedule" size={14} />
          <span>~{(1 + Math.random() * 2).toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Grid ────────────────────────────────────────────

interface StitchAgentGridProps {
  data: AgentData[];
}

export function StitchAgentGrid({ data }: StitchAgentGridProps) {
  const topAgents = data.slice(0, 6);

  return (
    <div className="stitch-card rounded-2xl p-6">
      {/* Section Header */}
      <div className="stitch-section-header">
        <div className="stitch-icon-container bg-[#F3E5FF] rounded-xl">
          <MaterialIcon icon="hub" size={28} className="text-[#A100FF]" />
        </div>
        <div>
          <h3 className="stitch-section-title">Custom Agent Deep Dive</h3>
          <p className="stitch-section-subtitle">Real-time performance of AI-powered agents</p>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topAgents.map((agent, index) => {
          const meta = getAgentMeta(agent.agent);
          // Simulate trend from merge rate deviation
          const avgRate = data.reduce((s, a) => s + a.mergeRate, 0) / data.length;
          const trend = Math.round(agent.mergeRate - avgRate);

          return (
            <StitchAgentCard
              key={index}
              name={agent.agent}
              description={meta.description}
              category={meta.category}
              successRate={agent.mergeRate}
              usageCount={agent.total}
              trend={trend}
              icon={meta.icon}
              color={meta.color}
            />
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
        <div className="grid grid-cols-3 gap-4">
          <div className="stitch-kpi-card text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MaterialIcon icon="groups" size={20} className="text-[#A100FF]" />
            </div>
            <div className="text-2xl font-extrabold text-[#111827]">{data.length}</div>
            <div className="text-xs text-[#9CA3AF] font-medium">Active Agents</div>
          </div>
          <div className="stitch-kpi-card text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MaterialIcon icon="verified" size={20} className="text-[#00A551]" />
            </div>
            <div className="text-2xl font-extrabold text-[#00A551]">
              {Math.round(data.reduce((sum, a) => sum + a.mergeRate, 0) / data.length)}%
            </div>
            <div className="text-xs text-[#9CA3AF] font-medium">Avg Success Rate</div>
          </div>
          <div className="stitch-kpi-card text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MaterialIcon icon="merge_type" size={20} className="text-[#A100FF]" />
            </div>
            <div className="text-2xl font-extrabold text-[#A100FF]">
              {data.reduce((sum, a) => sum + a.total, 0).toLocaleString()}
            </div>
            <div className="text-xs text-[#9CA3AF] font-medium">Total PRs</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Summary Row ───────────────────────────────────────

interface StitchKPISummaryProps {
  totalDevelopers: number;
  timeSaved: string;
  activeAgents: number;
  totalPRs: number;
}

const kpiConfig = [
  {
    key: 'developers',
    icon: 'people',
    label: 'Active Developers',
    sublabel: 'Using AI agents',
    iconBg: 'bg-[#F3E5FF]',
    iconColor: 'text-[#A100FF]',
    valueColor: 'text-[#111827]',
    trendLabel: '+12%',
  },
  {
    key: 'timeSaved',
    icon: 'schedule',
    label: 'Time Saved',
    sublabel: 'This period',
    iconBg: 'bg-[#E6F9EF]',
    iconColor: 'text-[#00A551]',
    valueColor: 'text-[#111827]',
    trendLabel: 'This month',
  },
  {
    key: 'agents',
    icon: 'smart_toy',
    label: 'AI Agents',
    sublabel: 'Custom agents active',
    iconBg: 'bg-[#E8F4FD]',
    iconColor: 'text-[#0070AD]',
    valueColor: 'text-[#111827]',
    trendLabel: 'Active',
  },
  {
    key: 'prs',
    icon: 'merge_type',
    label: 'Total PRs',
    sublabel: 'With AI agents',
    iconBg: 'bg-[#FFF8E6]',
    iconColor: 'text-[#B88600]',
    valueColor: 'text-[#111827]',
    trendLabel: 'All time',
  },
] as const;

export function StitchKPISummary({
  totalDevelopers,
  timeSaved,
  activeAgents,
  totalPRs,
}: StitchKPISummaryProps) {
  const values: Record<string, string> = {
    developers: totalDevelopers.toLocaleString(),
    timeSaved,
    agents: activeAgents.toString(),
    prs: totalPRs.toLocaleString(),
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpiConfig.map((kpi) => (
        <div key={kpi.key} className="stitch-kpi">
          <div className="flex items-center justify-between mb-4">
            <div className={`stitch-icon-container ${kpi.iconBg} rounded-xl`}>
              <MaterialIcon icon={kpi.icon} size={24} className={kpi.iconColor} />
            </div>
            <span className="stitch-trend-neutral">
              {kpi.trendLabel}
            </span>
          </div>
          <div className={`text-3xl font-extrabold ${kpi.valueColor} mb-1`}>
            {values[kpi.key]}
          </div>
          <div className="text-sm font-semibold text-[#374151]">{kpi.label}</div>
          <div className="text-xs text-[#9CA3AF] mt-0.5">{kpi.sublabel}</div>
        </div>
      ))}
    </div>
  );
}
