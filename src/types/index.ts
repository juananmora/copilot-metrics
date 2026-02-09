// GitHub API Types

export interface CopilotSeat {
  assignee: {
    login: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  plan_type: string;
  created_at: string;
  last_authenticated_at: string | null;
  last_activity_at: string | null;
  last_activity_editor: string | null;
}

export interface CopilotSeatsResponse {
  total_seats: number;
  seats: CopilotSeat[];
}

export interface PullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string | null;
  comments: number;
  labels: Array<{ name: string; color: string }>;
  pull_request?: {
    merged_at: string | null;
  };
  assignees?: Array<{ login: string }>;
  assignee?: { login: string } | null;
  user?: { login: string };
}

export interface SearchResponse {
  total_count: number;
  items: PullRequest[];
}

// Processed Data Types

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
  prCount?: number;  // Number of PRs created by this user
  agentUsageCount?: number;  // Number of agent usages by this user
}

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
  assignees: string[];  // Users assigned to this PR
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
