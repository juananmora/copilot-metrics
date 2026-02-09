# Copilot Metrics WebSocket Server

Backend server for real-time dashboard updates using WebSocket.

## Features

- **WebSocket Server**: Real-time data streaming to connected clients
- **Scheduled Refresh**: Automatic data refresh every 30 seconds (configurable)
- **In-Memory Cache**: Fast data retrieval with TTL-based invalidation
- **Progressive Loading**: KPIs delivered first, full data follows
- **Rate Limiting**: Prevents abuse of manual refresh requests
- **Health Check Endpoint**: Monitor server status

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your GitHub token:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GITHUB_TOKEN=your_github_enterprise_token
GITHUB_API_URL=https://bbva.ghe.com/api/v3
GITHUB_ORG=copilot-full-capacity
PORT=3001
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3001` with WebSocket at `ws://localhost:3001/ws`.

## Running with Frontend

From the root project directory:

```bash
# Run both frontend and backend concurrently
npm run dev:all

# Or run separately:
npm run dev         # Frontend only
npm run dev:server  # Backend only
```

## API Endpoints

### REST (Fallback)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health and stats |
| `/api/dashboard` | GET | Full dashboard data |
| `/api/kpis` | GET | Quick KPIs only |

### WebSocket Messages

#### Client → Server

```typescript
// Subscribe to updates
{ "type": "subscribe", "channel": "dashboard" }

// Request manual refresh
{ "type": "refresh" }

// Keep-alive ping
{ "type": "ping" }
```

#### Server → Client

```typescript
// Connection confirmed
{ "type": "connected", "clientId": "..." }

// Initial/update data
{ "type": "initial" | "update", "phase": "kpis" | "complete", "data": {...} }

// Refresh in progress
{ "type": "refreshing" }

// Heartbeat (every 30s)
{ "type": "heartbeat", "timestamp": ..., "clients": ... }

// Rate limited
{ "type": "rate_limit", "retryAfter": 10 }

// Error
{ "type": "error", "message": "...", "code": "..." }
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `GITHUB_TOKEN` | - | GitHub Enterprise token |
| `GITHUB_API_URL` | `https://bbva.ghe.com/api/v3` | GitHub API URL |
| `GITHUB_ORG` | `copilot-full-capacity` | Organization name |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `CACHE_TTL` | `30` | Cache TTL in seconds |
| `REFRESH_INTERVAL` | `30` | Auto-refresh interval in seconds |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │◄────│   WS Server     │◄────│  GitHub API     │
│  (React + WS)   │────►│  (Express + WS) │────►│  (Enterprise)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  In-Memory      │
                        │  Cache (30s)    │
                        └─────────────────┘
```

## License

Internal use only - BBVA
