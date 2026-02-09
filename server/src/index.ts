import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cron from 'node-cron';

import { cache, CACHE_KEYS, extractKPIs, hasSignificantChanges } from './cache.js';
import { fetchDashboardData, fetchRepoContributors, fetchPRReviewers } from './githubService.js';
import {
  ClientInfo,
  DashboardData,
  KPIData,
  WSMessage,
  SubscribeMessage,
  RepoContributorsData,
  PRReviewersData
} from './types.js';

// Configuration
const PORT = parseInt(process.env.PORT || '3001');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const REFRESH_INTERVAL = parseInt(process.env.REFRESH_INTERVAL || '30');
const RATE_LIMIT_MS = 10000; // 10 seconds between manual refreshes

// Express app
const app = express();
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Client tracking
const clients = new Map<WebSocket, ClientInfo>();

// Generate unique client ID
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Broadcast to all subscribed clients
function broadcast(channel: string, message: WSMessage): void {
  const messageStr = JSON.stringify(message);
  let sentCount = 0;

  clients.forEach((info, ws) => {
    if (ws.readyState === WebSocket.OPEN && info.subscriptions.has(channel)) {
      ws.send(messageStr);
      sentCount++;
    }
  });

  console.log(`[WS] Broadcast to ${sentCount} clients on channel "${channel}"`);
}

// Send to single client
function sendToClient(ws: WebSocket, message: WSMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Handle WebSocket connection
wss.on('connection', async (ws: WebSocket) => {
  const clientInfo: ClientInfo = {
    id: generateClientId(),
    subscriptions: new Set(),
    lastRefresh: 0,
    connectionTime: Date.now()
  };

  clients.set(ws, clientInfo);
  console.log(`[WS] Client connected: ${clientInfo.id} (${clients.size} total)`);

  // Send welcome message
  sendToClient(ws, {
    type: 'connected',
    clientId: clientInfo.id,
    timestamp: Date.now()
  });

  // Handle messages from client
  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString()) as WSMessage;
      const info = clients.get(ws);

      if (!info) return;

      switch (message.type) {
        case 'subscribe': {
          const subMsg = message as SubscribeMessage;
          info.subscriptions.add(subMsg.channel);
          console.log(`[WS] Client ${info.id} subscribed to "${subMsg.channel}"`);

          // Send initial data immediately
          if (subMsg.channel === 'dashboard') {
            await sendInitialData(ws);
          }
          break;
        }

        case 'refresh': {
          // Rate limiting check
          const now = Date.now();
          if (now - info.lastRefresh < RATE_LIMIT_MS) {
            const retryAfter = Math.ceil((RATE_LIMIT_MS - (now - info.lastRefresh)) / 1000);
            sendToClient(ws, {
              type: 'rate_limit',
              retryAfter,
              message: `Por favor espera ${retryAfter} segundos antes de actualizar`
            });
            return;
          }

          info.lastRefresh = now;
          console.log(`[WS] Client ${info.id} requested refresh`);

          // Trigger refresh for all clients
          await refreshDashboardData(true);
          break;
        }

        case 'ping': {
          sendToClient(ws, {
            type: 'pong',
            timestamp: Date.now()
          });
          break;
        }

        default:
          console.log(`[WS] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('[WS] Error processing message:', error);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    const info = clients.get(ws);
    if (info) {
      console.log(`[WS] Client disconnected: ${info.id} (${clients.size - 1} remaining)`);
    }
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('[WS] Client error:', error);
    clients.delete(ws);
  });
});

// Send initial data to a newly connected client (progressive loading)
async function sendInitialData(ws: WebSocket): Promise<void> {
  // Phase 1: Send cached KPIs immediately (fast)
  const cachedKPIs = cache.get<KPIData>(CACHE_KEYS.KPIS);
  if (cachedKPIs) {
    sendToClient(ws, {
      type: 'initial',
      phase: 'kpis',
      data: cachedKPIs,
      timestamp: Date.now()
    });
  }

  // Phase 2: Send full cached data if available
  const { data: cachedData, isStale } = cache.getStale<DashboardData>(CACHE_KEYS.DASHBOARD);
  if (cachedData) {
    sendToClient(ws, {
      type: 'initial',
      phase: 'complete',
      data: cachedData,
      timestamp: Date.now(),
      isStale
    });
    // NO auto-refresh - user must click refresh button
  }
  // If no cached data, wait for user to click refresh
}

// Refresh dashboard data and broadcast to all clients
async function refreshDashboardData(notifyProgress: boolean = false): Promise<void> {
  console.log('[Data] Refreshing dashboard data...');

  try {
    // Notify clients that refresh started
    if (notifyProgress) {
      broadcast('dashboard', {
        type: 'refreshing',
        timestamp: Date.now()
      });
    }

    const startTime = Date.now();
    const newData = await fetchDashboardData();
    const elapsed = Date.now() - startTime;

    console.log(`[Data] Dashboard data fetched in ${elapsed}ms`);

    // Check if data changed significantly
    const oldData = cache.get<DashboardData>(CACHE_KEYS.DASHBOARD);
    const hasChanges = hasSignificantChanges(oldData, newData);

    // Update cache
    cache.set(CACHE_KEYS.DASHBOARD, newData);
    cache.set(CACHE_KEYS.KPIS, extractKPIs(newData));

    // Broadcast update if data changed or if this was a manual refresh
    if (hasChanges || notifyProgress) {
      broadcast('dashboard', {
        type: 'update',
        phase: 'complete',
        data: newData,
        timestamp: Date.now(),
        fetchTime: elapsed
      });

      console.log(`[Data] Broadcast update to clients (changes: ${hasChanges})`);
    }
  } catch (error) {
    console.error('[Data] Error refreshing data:', error);

    broadcast('dashboard', {
      type: 'error',
      message: 'Error al actualizar datos',
      code: 'FETCH_ERROR'
    });
  }
}

// REST API endpoints (fallback for non-WS clients)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    clients: clients.size,
    cacheStats: cache.getStats(),
    uptime: process.uptime()
  });
});

app.get('/api/dashboard', async (req, res) => {
  try {
    // Try cache first
    const cached = cache.get<DashboardData>(CACHE_KEYS.DASHBOARD);
    if (cached) {
      return res.json(cached);
    }

    // Fetch fresh data
    const data = await fetchDashboardData();
    cache.set(CACHE_KEYS.DASHBOARD, data);
    cache.set(CACHE_KEYS.KPIS, extractKPIs(data));
    res.json(data);
  } catch (error) {
    console.error('[API] Error fetching dashboard:', error);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

app.get('/api/kpis', (req, res) => {
  const kpis = cache.get<KPIData>(CACHE_KEYS.KPIS);
  if (kpis) {
    return res.json(kpis);
  }
  res.status(404).json({ error: 'KPIs not available' });
});

// Contributors endpoint - fetches from GitHub API using server token
app.get('/api/contributors/:repo', async (req, res) => {
  const { repo } = req.params;
  
  if (!repo) {
    return res.status(400).json({ error: 'Repository name required' });
  }

  try {
    // Check cache first
    const cacheKey = `contributors_${repo}`;
    const cached = cache.get<RepoContributorsData>(cacheKey);
    if (cached) {
      console.log(`[API] Serving cached contributors for ${repo}`);
      return res.json(cached);
    }

    console.log(`[API] Fetching contributors for ${repo}`);
    const data = await fetchRepoContributors(repo);
    
    // Cache for 10 minutes
    cache.set(cacheKey, data, 10 * 60 * 1000);
    
    res.json(data);
  } catch (error) {
    console.error(`[API] Error fetching contributors for ${repo}:`, error);
    res.status(500).json({ error: 'Error fetching contributors' });
  }
});

// PR Reviewers endpoint - analyzes reviewers from cached PRs
app.get('/api/reviewers', async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'pr_reviewers';
    const cached = cache.get<PRReviewersData>(cacheKey);
    if (cached) {
      console.log('[API] Serving cached reviewers data');
      return res.json(cached);
    }

    // Get PRs from cache
    const dashboardData = cache.get<DashboardData>(CACHE_KEYS.DASHBOARD);
    if (!dashboardData?.prList || dashboardData.prList.length === 0) {
      return res.json({ reviewers: [], totalReviews: 0 });
    }

    console.log(`[API] Fetching reviewers for ${dashboardData.prList.length} PRs`);
    const data = await fetchPRReviewers(dashboardData.prList);
    
    // Cache for 15 minutes
    cache.set(cacheKey, data, 15 * 60 * 1000);
    
    res.json(data);
  } catch (error) {
    console.error('[API] Error fetching reviewers:', error);
    res.status(500).json({ error: 'Error fetching reviewers' });
  }
});

// Scheduled refresh DISABLED - only manual refresh via button
// cron.schedule(`*/${REFRESH_INTERVAL} * * * * *`, () => {
//   console.log(`[Cron] Scheduled refresh (every ${REFRESH_INTERVAL}s)`);
//   refreshDashboardData(false);
// });

// Heartbeat DISABLED - user controls refresh manually
// setInterval(() => {
//   broadcast('dashboard', {
//     type: 'heartbeat',
//     timestamp: Date.now(),
//     clients: clients.size
//   });
// }, 30000);

// Initial data fetch on startup
(async () => {
  console.log('[Server] Performing initial data fetch...');
  await refreshDashboardData(false);
  
  // Pre-load reviewers data in background (takes ~30-60s)
  setTimeout(async () => {
    const dashboardData = cache.get<DashboardData>(CACHE_KEYS.DASHBOARD);
    if (dashboardData?.prList && dashboardData.prList.length > 0) {
      console.log('[Server] Pre-loading reviewers data...');
      try {
        const reviewersData = await fetchPRReviewers(dashboardData.prList);
        cache.set('pr_reviewers', reviewersData, 15 * 60 * 1000); // 15 min cache
        console.log(`[Server] Reviewers pre-loaded: ${reviewersData.reviewers.length} reviewers, ${reviewersData.totalReviews} merges`);
      } catch (error) {
        console.error('[Server] Error pre-loading reviewers:', error);
      }
    }
  }, 2000); // Wait 2s after dashboard loads
})();

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       Copilot Metrics WebSocket Server                     ║
╠════════════════════════════════════════════════════════════╣
║  HTTP Server:    http://localhost:${PORT}                     ║
║  WebSocket:      ws://localhost:${PORT}/ws                    ║
║  Health Check:   http://localhost:${PORT}/api/health          ║
║  CORS Origin:    ${FRONTEND_URL.padEnd(30)}       ║
║  Refresh:        Manual (user controlled)                   ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down...');

  // Close all WebSocket connections
  clients.forEach((info, ws) => {
    sendToClient(ws, {
      type: 'server_shutdown',
      message: 'Servidor reiniciando'
    });
    ws.close();
  });

  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });
});
