import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light',
  storageKey = 'copilot-metrics-theme' 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored && ['dark', 'light', 'system'].includes(stored)) {
        return stored as Theme;
      }
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme as 'dark' | 'light');
      }
    };

    updateResolvedTheme();
    mediaQuery.addEventListener('change', updateResolvedTheme);
    
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme]);

  // Aplicar clase al documento
  useEffect(() => {
    const root = document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Actualizar meta theme-color para móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#0f0f1a' : '#ffffff');
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

interface ThemeToggleProps {
  variant?: 'button' | 'switch' | 'dropdown';
  className?: string;
}

export function ThemeToggle({ variant = 'button', className = '' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative w-16 h-8 rounded-full transition-all duration-500 overflow-hidden
                    ${resolvedTheme === 'dark' 
                      ? 'bg-gradient-to-r from-indigo-900 to-purple-900' 
                      : 'bg-gradient-to-r from-sky-400 to-blue-500'
                    } ${className}`}
        aria-label="Toggle theme"
      >
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Stars (dark mode) */}
          {resolvedTheme === 'dark' && (
            <>
              <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-pulse" />
              <div className="absolute top-3 left-4 w-0.5 h-0.5 bg-white/70 rounded-full" />
              <div className="absolute top-2 left-8 w-0.5 h-0.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
          
          {/* Clouds (light mode) */}
          {resolvedTheme === 'light' && (
            <>
              <div className="absolute top-1 right-2 w-4 h-2 bg-white/50 rounded-full" />
              <div className="absolute bottom-1 right-4 w-3 h-1.5 bg-white/40 rounded-full" />
            </>
          )}
        </div>
        
        {/* Toggle indicator */}
        <div 
          className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center
                      ${resolvedTheme === 'dark' 
                        ? 'left-1 bg-slate-200' 
                        : 'left-9 bg-yellow-300'
                      }`}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-900" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-yellow-600" />
          )}
        </div>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 
                     border border-white/10 transition-all duration-300"
        >
          {theme === 'dark' && <Moon className="w-4 h-4 text-blue-400" />}
          {theme === 'light' && <Sun className="w-4 h-4 text-yellow-400" />}
          {theme === 'system' && <Monitor className="w-4 h-4 text-gray-400" />}
          <span className="text-sm text-white capitalize">{theme}</span>
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute top-full mt-2 right-0 z-50 bg-[#1f2937] border border-[#374151] 
                            rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
              {[
                { value: 'dark' as Theme, icon: Moon, label: 'Oscuro', color: 'text-blue-400' },
                { value: 'light' as Theme, icon: Sun, label: 'Claro', color: 'text-yellow-400' },
                { value: 'system' as Theme, icon: Monitor, label: 'Sistema', color: 'text-gray-400' },
              ].map(({ value, icon: Icon, label, color }) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors
                              ${theme === value ? 'bg-white/5' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-sm text-white">{label}</span>
                  {theme === value && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-[#04E26A]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default: simple button
  return (
    <button
      onClick={toggleTheme}
      className={`p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 
                  transition-all duration-300 group ${className}`}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-yellow-400 transition-all duration-500
                      ${resolvedTheme === 'light' 
                        ? 'rotate-0 scale-100 opacity-100' 
                        : 'rotate-90 scale-0 opacity-0'
                      }`} 
        />
        {/* Moon icon */}
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-500
                      ${resolvedTheme === 'dark' 
                        ? 'rotate-0 scale-100 opacity-100' 
                        : '-rotate-90 scale-0 opacity-0'
                      }`} 
        />
      </div>
    </button>
  );
}

// CSS Variables for theme
export const themeStyles = `
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --bg-tertiary: #f3f4f6;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --border-color: #e5e7eb;
    --accent-color: #A100FF;
  }
  
  :root.dark {
    --bg-primary: #0f0f1a;
    --bg-secondary: #1a1a2e;
    --bg-tertiary: #25253d;
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
    --border-color: #374151;
    --accent-color: #A100FF;
  }
`;
