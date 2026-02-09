import { WifiOff, Wifi, Clock, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getCacheAge } from '../services/offlineCache';

interface OfflineBannerProps {
  onRetry?: () => void;
  isLoading?: boolean;
  isCachedData?: boolean;
}

export function OfflineBanner({ onRetry, isLoading, isCachedData }: OfflineBannerProps) {
  const { isOnline, wasOffline } = useOnlineStatus();
  const cacheAge = getCacheAge();

  // Show "back online" notification
  if (wasOffline && isOnline) {
    return (
      <div className="bg-[#04E26A] text-white px-4 py-2 flex items-center justify-center gap-2 text-sm animate-slide-down">
        <Wifi className="w-4 h-4" />
        <span className="font-medium">Conexión restaurada</span>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar datos
          </button>
        )}
      </div>
    );
  }

  // Show offline banner
  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm">
        <WifiOff className="w-4 h-4" />
        <span className="font-medium">Sin conexión</span>
        {cacheAge && isCachedData && (
          <span className="flex items-center gap-1 text-white/80">
            <Clock className="w-3 h-3" />
            Datos de {cacheAge}
          </span>
        )}
      </div>
    );
  }

  // Show cached data indicator when online but using cached data
  if (isCachedData && cacheAge) {
    return (
      <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm">
        <Clock className="w-4 h-4" />
        <span>Mostrando datos en caché de {cacheAge}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        )}
      </div>
    );
  }

  return null;
}
