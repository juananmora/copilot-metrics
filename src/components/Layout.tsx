import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { Loading, ErrorState } from './Loading';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { OfflineBanner } from './OfflineBanner';
import { ActivityTicker } from './ActivityTicker';
import { useToast } from './ToastNotifications';
import { fetchDashboardDataWithOffline } from '../services/github';
import { useWebSocket } from '../hooks/useWebSocket';
import { DashboardData } from '../types';

// Feature flag for WebSocket mode
const USE_WEBSOCKET = import.meta.env.VITE_USE_WEBSOCKET === 'true';

/**
 * Layout component with WebSocket support for real-time updates
 * Falls back to React Query polling if WebSocket is disabled
 */
export function Layout() {
  if (USE_WEBSOCKET) {
    return <WebSocketLayout />;
  }
  return <PollingLayout />;
}

/**
 * WebSocket-based Layout - Real-time updates
 */
function WebSocketLayout() {
  const {
    data,
    kpis,
    isLoading,
    isRefreshing,
    isConnected,
    connectionState,
    isStale,
    error,
    refresh,
    connectedClients
  } = useWebSocket();

  // Show loading screen while waiting for initial data
  if (isLoading && !data && !kpis) {
    return <Loading />;
  }

  // Show error state if disconnected and no data
  if (!isConnected && !data && error) {
    return (
      <ErrorState 
        message={error || 'Error de conexión'} 
        onRetry={refresh} 
      />
    );
  }

  // If we only have KPIs (fast initial load), show partial data
  if (!data && kpis) {
    // Create partial data from KPIs for progressive loading
    const partialData: DashboardData = {
      seats: {
        totalSeats: kpis.totalSeats,
        totalUsers: kpis.totalSeats,
        withActivity: kpis.withActivity,
        withoutActivity: kpis.totalSeats - kpis.withActivity,
        active24h: 0,
        active7d: 0,
        active30d: 0,
        byEditor: [],
        byPlan: [],
        adoptionRate: kpis.adoptionRate,
        activeRate7d: 0
      },
      seatsList: [],
      prs: {
        total: kpis.totalPRs,
        open: 0,
        closed: 0,
        merged: kpis.merged,
        rejected: 0,
        mergeRate: kpis.mergeRate,
        rejectionRate: 0,
        pendingRate: 0,
        avgDaysToClose: kpis.avgDaysToClose,
        minDaysToClose: '-',
        maxDaysToClose: '-',
        topRepos: [],
        topAgents: [],
        uniqueAgents: kpis.uniqueAgents,
        withAgent: kpis.withAgent,
        withoutAgent: 0,
        weeklyStats: [],
        monthlyStats: [],
        agentEffectiveness: [],
        repoEffectiveness: [],
        totalComments: 0,
        avgComments: 0
      },
      prList: [],
      languages: [],
      timezones: [],
      lastUpdated: kpis.lastUpdated,
      isLiveData: true,
      dataSource: 'WebSocket (cargando...)'
    };

    return (
      <LayoutShell
        data={partialData}
        isCachedData={false}
        isFetching={true}
        onRefresh={refresh}
        isWebSocket={true}
        isConnected={isConnected}
        connectionState={connectionState}
        connectedClients={connectedClients}
        isPartialData={true}
      />
    );
  }

  if (!data) {
    return <Loading />;
  }

  return (
    <LayoutShell
      data={data}
      isCachedData={isStale}
      isFetching={isRefreshing}
      onRefresh={refresh}
      isWebSocket={true}
      isConnected={isConnected}
      connectionState={connectionState}
      connectedClients={connectedClients}
    />
  );
}

/**
 * Polling-based Layout - Original implementation with React Query
 */
function PollingLayout() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardDataWithOffline,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error instanceof Error ? error.message : 'Error desconocido'} 
        onRetry={() => refetch()} 
      />
    );
  }

  if (!data) {
    return <Loading />;
  }

  const isCachedData = 'isCached' in data && data.isCached === true;

  return (
    <LayoutShell
      data={data}
      isCachedData={isCachedData}
      isFetching={isFetching}
      onRefresh={() => refetch()}
      isWebSocket={false}
    />
  );
}

interface LayoutShellProps {
  data: DashboardData;
  isCachedData: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  isWebSocket?: boolean;
  isConnected?: boolean;
  connectionState?: 'connecting' | 'connected' | 'disconnected';
  connectedClients?: number;
  isPartialData?: boolean;
}

function LayoutShell({ 
  data, 
  isCachedData, 
  isFetching, 
  onRefresh,
  isWebSocket = false,
  isConnected = true,
  connectionState = 'connected',
  connectedClients = 0,
  isPartialData = false
}: LayoutShellProps) {
  const toast = useToast();
  const wasFetching = useRef(false);
  const wasConnected = useRef(isConnected);

  // Toast on data refresh
  useEffect(() => {
    if (!wasFetching.current && isFetching) {
      wasFetching.current = true;
      return;
    }

    if (wasFetching.current && !isFetching && !isPartialData) {
      toast.success('Dashboard actualizado', data.isLiveData ? 'Datos en vivo sincronizados' : 'Actualizado con datos demo');
      wasFetching.current = false;
    }
  }, [isFetching, toast, data.isLiveData, isPartialData]);

  // Toast on WebSocket connection changes
  useEffect(() => {
    if (isWebSocket) {
      if (!wasConnected.current && isConnected) {
        toast.success('Conectado', 'Actualizaciones en tiempo real activas');
      } else if (wasConnected.current && !isConnected) {
        toast.warning('Desconectado', 'Reconectando...');
      }
      wasConnected.current = isConnected;
    }
  }, [isConnected, isWebSocket, toast]);

  // Determine data source label
  const dataSourceLabel = isWebSocket 
    ? (isConnected ? 'WebSocket (En vivo)' : 'WebSocket (Reconectando...)')
    : data.dataSource;

  return (
    <div className="min-h-screen app-shell flex flex-col">
      {/* Offline/Cache/WebSocket Banner */}
      <OfflineBanner 
        onRetry={onRefresh} 
        isLoading={isFetching}
        isCachedData={isCachedData}
      />

      {/* WebSocket connection indicator */}
      {isWebSocket && connectionState !== 'connected' && (
        <div className="bg-amber-500/90 text-white text-center py-1 text-xs font-medium animate-pulse">
          {connectionState === 'connecting' ? 'Conectando al servidor...' : 'Reconectando...'}
        </div>
      )}
      
      <NavBar 
        lastUpdated={data.lastUpdated} 
        onRefresh={onRefresh} 
        isLoading={isFetching || isPartialData}
        isLiveData={data.isLiveData}
        dataSource={dataSourceLabel}
        isWebSocket={isWebSocket}
        isConnected={isConnected}
        connectedClients={connectedClients}
      />
      
      {/* Activity Ticker - Real PR data */}
      <ActivityTicker 
        prList={data.prList} 
        activeUsers={data.seats?.active24h || 0}
        speed={100}
      />

      {/* Partial data indicator */}
      {isPartialData && (
        <div className="bg-blue-600/90 text-white text-center py-2 text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Cargando datos completos...
          </span>
        </div>
      )}
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet context={data} />
      </main>
      
      <Footer />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
