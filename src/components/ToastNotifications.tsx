import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, GitPullRequest, Zap, TrendingUp } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'pr_merged' | 'agent_task' | 'milestone';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  prMerged: (prTitle: string, repo?: string) => void;
  agentTask: (taskName: string, status?: string) => void;
  milestone: (title: string, value?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/50',
    iconColor: 'text-green-400',
    progressColor: 'bg-green-500',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-gradient-to-r from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-400',
    progressColor: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
    borderColor: 'border-yellow-500/50',
    iconColor: 'text-yellow-400',
    progressColor: 'bg-yellow-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/50',
    iconColor: 'text-blue-400',
    progressColor: 'bg-blue-500',
  },
  pr_merged: {
    icon: GitPullRequest,
    bgColor: 'bg-gradient-to-r from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/50',
    iconColor: 'text-purple-400',
    progressColor: 'bg-purple-500',
  },
  agent_task: {
    icon: Zap,
    bgColor: 'bg-gradient-to-r from-[#04E26A]/20 to-emerald-500/20',
    borderColor: 'border-[#04E26A]/50',
    iconColor: 'text-[#04E26A]',
    progressColor: 'bg-[#04E26A]',
  },
  milestone: {
    icon: TrendingUp,
    bgColor: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/50',
    iconColor: 'text-amber-400',
    progressColor: 'bg-amber-500',
  },
};

interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastProvider({ children, position = 'top-right' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Helper functions
  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const prMerged = useCallback((prTitle: string, repo?: string) => {
    addToast({ 
      type: 'pr_merged', 
      title: 'PR Mergeada', 
      message: `${prTitle}${repo ? ` en ${repo}` : ''}` 
    });
  }, [addToast]);

  const agentTask = useCallback((taskName: string, status?: string) => {
    addToast({ 
      type: 'agent_task', 
      title: 'Tarea de Agente', 
      message: `${taskName}${status ? ` - ${status}` : ''}` 
    });
  }, [addToast]);

  const milestone = useCallback((title: string, value?: string) => {
    addToast({ 
      type: 'milestone', 
      title: '🎉 Milestone Alcanzado', 
      message: `${title}${value ? `: ${value}` : ''}`,
      duration: 8000,
    });
  }, [addToast]);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <ToastContext.Provider value={{ 
      toasts, addToast, removeToast, 
      success, error, warning, info,
      prMerged, agentTask, milestone 
    }}>
      {children}
      
      {/* Toast Container */}
      <div className={`fixed ${positionClasses[position]} z-[9999] flex flex-col gap-3 pointer-events-none`}>
        {toasts.map((toast, index) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onClose={() => removeToast(toast.id)}
            index={index}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
  index: number;
}

function ToastItem({ toast, onClose, index }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (!toast.duration) return;

    const startTime = Date.now();
    const duration = toast.duration;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    const progressFrame = requestAnimationFrame(updateProgress);

    const timeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(progressFrame);
    };
  }, [toast.duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        pointer-events-auto w-80 md:w-96 
        ${config.bgColor} backdrop-blur-md
        border ${config.borderColor}
        rounded-xl shadow-2xl overflow-hidden
        transform transition-all duration-300 ease-out
        ${isExiting 
          ? 'translate-x-full opacity-0 scale-95' 
          : 'translate-x-0 opacity-100 scale-100'
        }
      `}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-2 rounded-lg bg-black/20 ${config.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm">{toast.title}</h4>
            {toast.message && (
              <p className="text-gray-300 text-sm mt-0.5 line-clamp-2">{toast.message}</p>
            )}
            
            {/* Action button */}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className={`mt-2 text-sm font-medium ${config.iconColor} hover:underline`}
              >
                {toast.action.label}
              </button>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-black/20">
        <div 
          className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Demo component for testing
export function ToastDemo() {
  const toast = useToast();
  
  return (
    <div className="flex flex-wrap gap-2">
      <button 
        onClick={() => toast.success('Operación exitosa', 'Los cambios se guardaron correctamente')}
        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
      >
        Success
      </button>
      <button 
        onClick={() => toast.error('Error', 'No se pudo conectar con el servidor')}
        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
      >
        Error
      </button>
      <button 
        onClick={() => toast.prMerged('Fix authentication bug', 'cells-starter-factoria')}
        className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30"
      >
        PR Merged
      </button>
      <button 
        onClick={() => toast.milestone('100 PRs Mergeadas', '¡Felicitaciones al equipo!')}
        className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30"
      >
        Milestone
      </button>
    </div>
  );
}
