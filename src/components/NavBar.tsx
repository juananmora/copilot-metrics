import { NavLink } from 'react-router-dom';
import { AccentureLogo } from '../assets/images/AccentureLogo';
import copilotLogo from '../assets/images/copilot.jpg';
import { MaterialIcon } from './MaterialIcon';
import { ThemeToggle } from './ThemeToggle';

interface NavBarProps {
  lastUpdated: string;
  onRefresh: () => void;
  isLoading: boolean;
  isLiveData: boolean;
  dataSource: string;
  isWebSocket?: boolean;
  isConnected?: boolean;
  connectedClients?: number;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/pull-requests', label: 'Pull Requests', icon: 'commit' },
  { path: '/agents', label: 'Custom Agents', icon: 'smart_toy' },
  { path: '/users', label: 'Usuarios', icon: 'group' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export function NavBar({ 
  lastUpdated, 
  onRefresh, 
  isLoading, 
  isLiveData, 
  dataSource,
  isWebSocket = false,
  isConnected = true,
  connectedClients = 0
}: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Main header row */}
      <div className="flex items-center justify-between whitespace-nowrap px-10 py-4">
        {/* Left — Logo + Title */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="size-8 flex items-center justify-center bg-accenture-purple rounded-md shadow-md">
              <img src={copilotLogo} alt="Copilot" className="w-full h-full object-cover rounded-md" />
            </div>
            <h2 className="text-black text-xl font-bold leading-tight tracking-[-0.015em]">
              Copilot Metrics
            </h2>
          </div>

          {/* Search */}
          <label className="flex flex-col min-w-64 !h-10 hidden lg:flex">
            <div className="flex w-full flex-1 items-stretch rounded-md h-full border border-gray-200 bg-gray-50 focus-within:border-accenture-purple focus-within:ring-1 focus-within:ring-accenture-purple transition-all">
              <div className="text-gray-400 flex bg-transparent items-center justify-center pl-3">
                <MaterialIcon icon="search" size={20} />
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-black focus:outline-none border-none bg-transparent h-full placeholder:text-gray-400 px-3 text-sm font-normal leading-normal"
                placeholder="Search insights..."
              />
            </div>
          </label>
        </div>

        {/* Right — Nav links + Actions */}
        <div className="flex flex-1 justify-end gap-8 items-center">
          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `text-sm font-semibold leading-normal transition-colors ${
                    isActive
                      ? 'text-accenture-purple font-bold border-b-2 border-accenture-purple pb-1'
                      : 'text-gray-600 hover:text-accenture-purple'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-3">
            <span
              className="hidden xl:inline-flex text-xs text-gray-400"
              title={`Actualizado: ${lastUpdated} • ${dataSource}`}
            >
              {lastUpdated}
            </span>

            {isWebSocket && (
              <div
                className={`stitch-filter-bar !px-2.5 !py-1 text-xs ${
                  isConnected ? '!border-accenture-purple/20 !bg-accenture-purple/5' : '!border-amber-200 !bg-amber-50'
                }`}
                title={isConnected ? `${connectedClients} clientes conectados` : 'Reconectando...'}
              >
                <span className={`block w-2 h-2 rounded-full ${isConnected ? 'bg-accenture-purple animate-pulse' : 'bg-amber-400'}`} />
                <span className={`font-bold ${isConnected ? 'text-accenture-purple' : 'text-amber-600'}`}>
                  {isConnected ? 'WS' : '...'}
                </span>
              </div>
            )}

            {isLiveData ? (
              <span className="stitch-badge bg-[#e7f6ed] text-[#078847]">LIVE</span>
            ) : (
              <span className="stitch-badge bg-amber-100 text-amber-700">DEMO</span>
            )}

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center justify-center rounded-full size-10 hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <MaterialIcon icon="refresh" size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* Notifications */}
            <button className="flex items-center justify-center rounded-full size-10 hover:bg-gray-100 text-gray-600 transition-colors">
              <MaterialIcon icon="notifications" size={20} />
            </button>

            <ThemeToggle variant="switch" />

            {/* Avatar */}
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-gray-200 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #A100FF, #C966FF)' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <AccentureLogo size="sm" variant="mark" color="#FFFFFF" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation (below lg) */}
      <nav className="lg:hidden border-t border-gray-200">
        <div className="px-4">
          <ul className="flex items-center gap-0.5 overflow-x-auto -mb-px">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-[3px] whitespace-nowrap ${
                      isActive ? 'active' : ''
                    }`
                  }
                >
                  <MaterialIcon icon={item.icon} size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
