import { DashboardData } from '../types';

// WebSocket message types
interface WSMessage {
  type: string;
  [key: string]: unknown;
}

interface InitialMessage extends WSMessage {
  type: 'initial';
  phase: 'kpis' | 'partial' | 'complete';
  data: Partial<DashboardData>;
  timestamp: number;
  isStale?: boolean;
}

interface UpdateMessage extends WSMessage {
  type: 'update';
  phase: 'kpis' | 'prs' | 'complete';
  data: Partial<DashboardData>;
  timestamp: number;
  fetchTime?: number;
}

interface HeartbeatMessage extends WSMessage {
  type: 'heartbeat';
  timestamp: number;
  clients: number;
}

interface ErrorMessage extends WSMessage {
  type: 'error';
  message: string;
  code?: string;
}

interface RateLimitMessage extends WSMessage {
  type: 'rate_limit';
  retryAfter: number;
  message: string;
}

interface ConnectedMessage extends WSMessage {
  type: 'connected';
  clientId: string;
  timestamp: number;
}

// KPIs for fast initial load
export interface KPIData {
  totalSeats: number;
  withActivity: number;
  adoptionRate: number;
  totalPRs: number;
  merged: number;
  mergeRate: number;
  uniqueAgents: number;
  withAgent: number;
  avgDaysToClose: number | string;
  lastUpdated: string;
}

// Event types
export type WebSocketEvent =
  | 'connected'
  | 'disconnected'
  | 'kpis'
  | 'data'
  | 'refreshing'
  | 'error'
  | 'rate_limit'
  | 'heartbeat';

type EventCallback<T = unknown> = (data: T) => void;

// WebSocket configuration
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL_MS = 25000;

/**
 * WebSocket service for real-time dashboard updates
 * Handles connection management, reconnection, and event dispatch
 */
class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isIntentionalClose = false;
  private eventListeners: Map<WebSocketEvent, Set<EventCallback>> = new Map();
  private lastData: DashboardData | null = null;
  private lastKPIs: KPIData | null = null;

  constructor() {
    // Initialize event listener maps
    const events: WebSocketEvent[] = [
      'connected',
      'disconnected',
      'kpis',
      'data',
      'refreshing',
      'error',
      'rate_limit',
      'heartbeat'
    ];
    events.forEach((event) => this.eventListeners.set(event, new Set()));
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }

    console.log(`[WS] Connecting to ${WS_URL}...`);
    this.isIntentionalClose = false;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('[WS] Connected');
        this.reconnectAttempts = 0;

        // Subscribe to dashboard channel
        this.send({ type: 'subscribe', channel: 'dashboard' });

        // Start ping interval
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSMessage;
          this.handleMessage(message);
        } catch (error) {
          console.error('[WS] Error parsing message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`[WS] Disconnected (code: ${event.code})`);
        this.stopPingInterval();
        this.emit('disconnected', { code: event.code, reason: event.reason });

        // Attempt reconnection unless intentionally closed
        if (!this.isIntentionalClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
        this.emit('error', { message: 'Error de conexión WebSocket' });
      };
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionalClose = true;
    this.stopPingInterval();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    console.log('[WS] Disconnected intentionally');
  }

  /**
   * Request a manual refresh of data
   */
  requestRefresh(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot refresh: not connected');
      this.emit('error', { message: 'No conectado al servidor' });
      return;
    }

    this.send({ type: 'refresh' });
    this.emit('refreshing', {});
  }

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: WebSocketEvent, callback: EventCallback<T>): () => void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(callback as EventCallback);
    }

    // Return unsubscribe function
    return () => {
      listeners?.delete(callback as EventCallback);
    };
  }

  /**
   * Get last received data
   */
  getLastData(): DashboardData | null {
    return this.lastData;
  }

  /**
   * Get last received KPIs
   */
  getLastKPIs(): KPIData | null {
    return this.lastKPIs;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): 'connecting' | 'connected' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      default:
        return 'disconnected';
    }
  }

  // Private methods

  private send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: WSMessage): void {
    switch (message.type) {
      case 'connected': {
        const connMsg = message as ConnectedMessage;
        this.emit('connected', { clientId: connMsg.clientId });
        break;
      }

      case 'initial':
      case 'update': {
        const dataMsg = message as InitialMessage | UpdateMessage;

        if (dataMsg.phase === 'kpis') {
          this.lastKPIs = dataMsg.data as unknown as KPIData;
          this.emit('kpis', this.lastKPIs);
        } else if (dataMsg.phase === 'complete') {
          this.lastData = dataMsg.data as DashboardData;
          this.emit('data', {
            data: this.lastData,
            isStale: (dataMsg as InitialMessage).isStale,
            fetchTime: (dataMsg as UpdateMessage).fetchTime
          });
        }
        break;
      }

      case 'refreshing': {
        this.emit('refreshing', {});
        break;
      }

      case 'heartbeat': {
        const hbMsg = message as HeartbeatMessage;
        this.emit('heartbeat', { timestamp: hbMsg.timestamp, clients: hbMsg.clients });
        break;
      }

      case 'error': {
        const errMsg = message as ErrorMessage;
        this.emit('error', { message: errMsg.message, code: errMsg.code });
        break;
      }

      case 'rate_limit': {
        const rlMsg = message as RateLimitMessage;
        this.emit('rate_limit', { retryAfter: rlMsg.retryAfter, message: rlMsg.message });
        break;
      }

      case 'pong':
        // Ping response received
        break;

      case 'server_shutdown':
        console.log('[WS] Server shutting down, will reconnect...');
        break;

      default:
        console.log('[WS] Unknown message type:', message.type);
    }
  }

  private emit<T>(event: WebSocketEvent, data: T): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WS] Error in ${event} listener:`, error);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('[WS] Max reconnect attempts reached');
      this.emit('error', {
        message: 'No se pudo reconectar al servidor. Por favor recarga la página.'
      });
      return;
    }

    const delay = RECONNECT_DELAY_MS * Math.pow(1.5, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(
      `[WS] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, PING_INTERVAL_MS);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Singleton instance
export const wsService = new WebSocketService();

// React hook for using WebSocket
export function useWebSocketStatus(): {
  isConnected: boolean;
  state: 'connecting' | 'connected' | 'disconnected';
} {
  // This is a simple implementation - for a full React hook, use useState/useEffect
  return {
    isConnected: wsService.isConnected(),
    state: wsService.getState()
  };
}
