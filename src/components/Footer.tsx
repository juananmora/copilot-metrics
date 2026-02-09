import { AccentureLogo } from '../assets/images/AccentureLogo';
import { MaterialIcon } from './MaterialIcon';

export function Footer() {
  const links = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Documentation', href: '#' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-[1600px] mx-auto px-10 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Branding */}
          <div className="flex items-center gap-3">
            <AccentureLogo size="sm" variant="full" color="#A100FF" />
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <MaterialIcon icon="bolt" size={16} className="text-accenture-purple" />
              <span className="text-sm font-medium text-gray-600">Copilot Metrics</span>
            </div>
          </div>

          {/* Center - Links */}
          <nav className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-500 hover:text-accenture-purple transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right - Copyright */}
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Accenture Global Dev Analytics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
