import { useState, useEffect, useCallback, useRef } from 'react';
import { wsService, KPIData } from '../services/websocket';
import { DashboardData } from '../types';

interface WebSocketState {
  // Connection state
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected';

  // Data state
  data: DashboardData | null;
  kpis: KPIData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  error: string | null;

  // Metadata
  lastUpdated: Date | null;
  fetchTime: number | null;
  connectedClients: number;

  // Actions
  refresh: () => void;
  connect: () => void;
  disconnect: () => void;
}

/**
 * React hook for WebSocket connection and data management
 * Provides real-time dashboard data with progressive loading
 */
export function useWebSocket(): WebSocketState {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Data state
  const [data, setData] = useState<DashboardData | null>(null);
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Metadata
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchTime, setFetchTime] = useState<number | null>(null);
  const [connectedClients, setConnectedClients] = useState(0);

  // Rate limit state
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);

  // Refs for cleanup
  const unsubscribesRef = useRef<Array<() => void>>([]);

  // Setup event listeners
  useEffect(() => {
    // Connected event
    const unsubConnected = wsService.on('connected', () => {
      setIsConnected(true);
      setConnectionState('connected');
      setError(null);
      console.log('[Hook] WebSocket connected');
    });

    // Disconnected event
    const unsubDisconnected = wsService.on('disconnected', () => {
      setIsConnected(false);
      setConnectionState('disconnected');
      console.log('[Hook] WebSocket disconnected');
    });

    // KPIs received (fast initial data)
    const unsubKpis = wsService.on<KPIData>('kpis', (kpiData) => {
      setKpis(kpiData);
      setIsLoading(false);
      console.log('[Hook] KPIs received');
    });

    // Full data received
    const unsubData = wsService.on<{
      data: DashboardData;
      isStale?: boolean;
      fetchTime?: number;
    }>('data', ({ data: newData, isStale: stale, fetchTime: time }) => {
      setData(newData);
      setIsLoading(false);
      setIsRefreshing(false);
      setIsStale(stale || false);
      setLastUpdated(new Date());
      if (time) setFetchTime(time);
      console.log(`[Hook] Data received (stale: ${stale}, fetchTime: ${time}ms)`);
    });

    // Refreshing started
    const unsubRefreshing = wsService.on('refreshing', () => {
      setIsRefreshing(true);
    });

    // Error received
    const unsubError = wsService.on<{ message: string; code?: string }>('error', ({ message }) => {
      setError(message);
      setIsRefreshing(false);
      console.error('[Hook] Error:', message);
    });

    // Rate limit
    const unsubRateLimit = wsService.on<{ retryAfter: number; message: string }>(
      'rate_limit',
      ({ retryAfter, message }) => {
        setRateLimitedUntil(Date.now() + retryAfter * 1000);
        setError(message);
        setIsRefreshing(false);

        // Clear rate limit after timeout
        setTimeout(() => {
          setRateLimitedUntil(null);
          setError(null);
        }, retryAfter * 1000);
      }
    );

    // Heartbeat (for connection status and client count)
    const unsubHeartbeat = wsService.on<{ timestamp: number; clients: number }>(
      'heartbeat',
      ({ clients }) => {
        setConnectedClients(clients);
      }
    );

    // Store unsubscribe functions
    unsubscribesRef.current = [
      unsubConnected,
      unsubDisconnected,
      unsubKpis,
      unsubData,
      unsubRefreshing,
      unsubError,
      unsubRateLimit,
      unsubHeartbeat
    ];

    // Connect to WebSocket
    setConnectionState('connecting');
    wsService.connect();

    // Cleanup on unmount
    return () => {
      unsubscribesRef.current.forEach((unsub) => unsub());
      // Don't disconnect on unmount - keep connection alive for other components
    };
  }, []);

  // Refresh action
  const refresh = useCallback(() => {
    // Check rate limit
    if (rateLimitedUntil && Date.now() < rateLimitedUntil) {
      const seconds = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
      setError(`Por favor espera ${seconds} segundos antes de actualizar`);
      return;
    }

    setError(null);
    wsService.requestRefresh();
  }, [rateLimitedUntil]);

  // Connect action
  const connect = useCallback(() => {
    setConnectionState('connecting');
    wsService.connect();
  }, []);

  // Disconnect action
  const disconnect = useCallback(() => {
    wsService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  return {
    isConnected,
    connectionState,
    data,
    kpis,
    isLoading,
    isRefreshing,
    isStale,
    error,
    lastUpdated,
    fetchTime,
    connectedClients,
    refresh,
    connect,
    disconnect
  };
}

/**
 * Hook for just the connection status (lightweight)
 */
export function useWebSocketStatus(): {
  isConnected: boolean;
  state: 'connecting' | 'connected' | 'disconnected';
} {
  const [isConnected, setIsConnected] = useState(wsService.isConnected());
  const [state, setState] = useState(wsService.getState());

  useEffect(() => {
    const unsubConnected = wsService.on('connected', () => {
      setIsConnected(true);
      setState('connected');
    });

    const unsubDisconnected = wsService.on('disconnected', () => {
      setIsConnected(false);
      setState('disconnected');
    });

    return () => {
      unsubConnected();
      unsubDisconnected();
    };
  }, []);

  return { isConnected, state };
}
