// WebSocket Message Types

export interface WSMessage {
  type: string;
  [key: string]: unknown;
}

// Client -> Server messages
export interface SubscribeMessage extends WSMessage {
  type: 'subscribe';
  channel: 'dashboard' | 'kpis' | 'prs';
}

export interface RefreshMessage extends WSMessage {
  type: 'refresh';
}

export interface PingMessage extends WSMessage {
  type: 'ping';
}

// Server -> Client messages
export interface InitialDataMessage extends WSMessage {
  type: 'initial';
  phase: 'kpis' | 'partial' | 'complete';
  data: unknown;
  timestamp: number;
}

export interface UpdateMessage extends WSMessage {
  type: 'update';
  phase: 'kpis' | 'prs' | 'complete';
  data: unknown;
  timestamp: number;
}

export interface HeartbeatMessage extends WSMessage {
  type: 'heartbeat';
  timestamp: number;
  clients: number;
}

export interface ErrorMessage extends WSMessage {
  type: 'error';
  message: string;
  code?: string;
}

export interface RateLimitMessage extends WSMessage {
  type: 'rate_limit';
  retryAfter: number;
}

// Dashboard Data Types (mirrored from frontend)
export interface SeatsStats {
  totalSeats: number;
  totalUsers: number;
  withActivity: number;
  withoutActivity: number;
  active24h: number;
  active7d: number;
  active30d: number;
  byEditor: Array<{ name: string; count: number }>;
  byPlan: Array<{ name: string; count: number }>;
  adoptionRate: number;
  activeRate7d: number;
}

export interface PRStats {
  total: number;
  open: number;
  closed: number;
  merged: number;
  rejected: number;
  mergeRate: number;
  rejectionRate: number;
  pendingRate: number;
  avgDaysToClose: number | string;
  minDaysToClose: number | string;
  maxDaysToClose: number | string;
  topRepos: Array<{ name: string; count: number }>;
  topAgents: Array<{ name: string; count: number }>;
  uniqueAgents: number;
  withAgent: number;
  withoutAgent: number;
  weeklyStats: Array<{ week: string; start: string; end: string; count: number }>;
  monthlyStats: Array<{ month: string; count: number }>;
  agentEffectiveness: Array<{
    agent: string;
    total: number;
    open: number;
    merged: number;
    rejected: number;
    mergeRate: number;
  }>;
  repoEffectiveness: Array<{
    repo: string;
    total: number;
    open: number;
    merged: number;
    rejected: number;
    mergeRate: number;
  }>;
  totalComments: number;
  avgComments: number;
}

export interface ProcessedSeat {
  login: string;
  name?: string;
  email?: string;
  planType: string;
  createdAt: string;
  lastAuthenticatedAt: string;
  lastActivityAt: string;
  lastActivityEditor: string;
  isActive: boolean;
  avatarUrl?: string;
  prCount?: number;
  agentUsageCount?: number;
}

export interface ProcessedPR {
  number: number;
  title: string;
  state: 'open' | 'closed';
  isMerged: boolean;
  repository: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
  daysToClose: number | null;
  url: string;
  customAgent: string;
  labels: string;
  comments: number;
  assignees: string[];
}

export interface LanguageStats {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface TimezoneActivity {
  timezone: string;
  activity: number;
  users: number;
}

export interface DashboardData {
  seats: SeatsStats | null;
  seatsList: ProcessedSeat[];
  prs: PRStats;
  prList: ProcessedPR[];
  languages: LanguageStats[];
  timezones: TimezoneActivity[];
  lastUpdated: string;
  isLiveData: boolean;
  dataSource: string;
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

// Cache entry with metadata
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Client tracking
export interface ClientInfo {
  id: string;
  subscriptions: Set<string>;
  lastRefresh: number;
  connectionTime: number;
}

// Repository Contributors
export interface RepoContributor {
  login: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  commits: number;
  prs: number;
  total: number;
}

export interface RepoContributorsData {
  repository: string;
  contributors: RepoContributor[];
  totalCommits: number;
  totalPRs: number;
}

// PR Reviewers
export interface PRReviewer {
  login: string;
  name?: string;
  avatarUrl?: string;
  reviewCount: number;
  approvedCount: number;
  changesRequestedCount: number;
  commentedCount: number;
}

export interface PRReviewersData {
  reviewers: PRReviewer[];
  totalReviews: number;
}
