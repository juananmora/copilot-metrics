import copilotLogo from '../assets/images/copilot.jpg';
import { MaterialIcon } from './MaterialIcon';

interface AIBannerProps {
  totalPRs: number;
  withAgent: number;
  mergeRate: number;
  uniqueAgents: number;
  merged?: number;
  avgDaysToClose?: number | string;
  open?: number;
  rejectionRate?: number;
}

export function AIBanner({
  totalPRs,
  withAgent,
  mergeRate,
  uniqueAgents,
  merged = 0,
  avgDaysToClose = 0,
}: AIBannerProps) {
  const metrics = [
    {
      icon: 'commit',
      value: totalPRs,
      label: 'Total PRs',
      color: '#A100FF',
    },
    {
      icon: 'smart_toy',
      value: withAgent,
      label: 'With Agent',
      color: '#7500C0',
    },
    {
      icon: 'merge',
      value: `${mergeRate}%`,
      label: 'Merge Rate',
      color: '#00A551',
    },
    {
      icon: 'hub',
      value: uniqueAgents,
      label: 'Unique Agents',
      color: '#A100FF',
    },
    {
      icon: 'check_circle',
      value: merged,
      label: 'Merged',
      color: '#00A551',
    },
    {
      icon: 'schedule',
      value: avgDaysToClose,
      label: 'Avg Days to Close',
      color: '#7500C0',
    },
  ];

  const features = [
    { icon: 'auto_fix_high', label: 'Intelligent Automation' },
    { icon: 'code', label: 'Automated Code Review' },
    { icon: 'psychology', label: 'Proactive Suggestions' },
    { icon: 'security', label: 'Quality & Security' },
    { icon: 'speed', label: 'Faster Delivery' },
  ];

  return (
    <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-card stitch-card-accent">

      <div className="p-6 md:p-8">
        <div className="flex flex-col xl:flex-row items-start xl:items-center gap-8">
          {/* Left side - Logo + Title + Description */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={copilotLogo}
                  alt="GitHub Copilot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-xl font-bold text-black tracking-tight">
                  Copilot SWE Agent Analytics
                </h2>
                <span className="stitch-badge bg-purple-50 text-accenture-purple">AI-Powered</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
                Real-time performance metrics and sentiment analysis across the ecosystem.
              </p>
            </div>
          </div>

          {/* Right side - 3x2 metric grid */}
          <div className="grid grid-cols-3 gap-2.5 w-full xl:w-auto xl:min-w-[440px]">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-white rounded-xl p-3.5 border border-gray-200 hover:border-accenture-purple hover:shadow-card-hover transition-all group/card"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110"
                    style={{ backgroundColor: `${metric.color}12` }}
                  >
                    <MaterialIcon
                      icon={metric.icon}
                      size={16}
                      style={{ color: metric.color }}
                    />
                  </div>
                </div>
                <div className="text-2xl font-black text-black tracking-tight leading-none mb-1 counter-value">
                  {metric.value}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom - Feature pills */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-2.5">
          {features.map((feature) => (
            <span
              key={feature.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 hover:border-[#A100FF]/20 hover:bg-[#A100FF]/[0.03] hover:text-gray-700 transition-all duration-200"
            >
              <MaterialIcon icon={feature.icon} size={14} className="text-[#A100FF]/60" />
              {feature.label}
            </span>
          ))}

          <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#A100FF]/70 bg-[#A100FF]/[0.04] border border-[#A100FF]/10">
            Powered by GitHub Copilot Enterprise
            <MaterialIcon icon="arrow_forward" size={13} className="text-[#A100FF]/50" />
          </span>
        </div>
      </div>
    </div>
  );
}
