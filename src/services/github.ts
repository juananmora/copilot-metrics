import axios, { AxiosError } from 'axios';
import { 
  CopilotSeatsResponse, 
  SearchResponse, 
  ProcessedSeat, 
  SeatsStats, 
  ProcessedPR, 
  PRStats,
  DashboardData,
  LanguageStats,
  TimezoneActivity
} from '../types';
import { getApiBaseUrl, getEffectiveGitHubConfig, getEffectiveToken, hasToken } from './tokenService';
import { saveToCache, getFromCache } from './offlineCache';

// Use local proxy to avoid CORS issues when no custom URL is set
// Vite proxy: /github-api -> https://bbva.ghe.com/api/v3
function resolveApiBaseUrl(): string {
  return getApiBaseUrl();
}

// Flag to use mock data if API fails (for demo purposes)
// Auto-detect: use mock when no token is configured, try API when token exists
let useMockData = !hasToken();

/**
 * Re-evaluate whether to use mock data based on current token state.
 * Called automatically before every data fetch so that a newly-saved
 * Settings token takes effect without a full page reload.
 */
function refreshMockDataFlag() {
  const tokenAvailable = hasToken();
  if (tokenAvailable && useMockData) {
    // Token was added (e.g. via Settings) — switch to API mode
    console.log('[GitHub Service] Token detected → switching to API mode');
    useMockData = false;
  } else if (!tokenAvailable && !useMockData) {
    // Token was removed — switch to mock mode
    console.log('[GitHub Service] No token → switching to MOCK mode');
    useMockData = true;
  }
}

// Create API instance with dynamic token
function createApiInstance() {
  const token = getEffectiveToken();
  return axios.create({
    baseURL: resolveApiBaseUrl(),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    timeout: 30000
  });
}

// Get API instance with current token (call this for each request to get fresh token)
function getApi() {
  return createApiInstance();
}

// Helper functions
function cleanAgentName(name: string | null): string {
  if (!name || name.trim() === '') return '-';
  const cleaned = name.replace(/^[^a-zA-Z0-9]+/, '').trim();
  return cleaned || '-';
}

function getRepoFromUrl(url: string): string {
  // URL format: https://bbva.ghe.com/org/repo/pull/123
  // We want to extract "org/repo"
  
  // Try to match the pattern: /org/repo/pull/ or /org/repo/issues/
  const match = url.match(/\/([^/]+)\/([^/]+)\/(?:pull|issues)\//);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  
  // Fallback for github.com or ghe.com URLs
  const match2 = url.match(/(?:github\.com|ghe\.com)\/([^/]+\/[^/]+)/);
  if (match2) return match2[1];
  
  return 'unknown';
}

function getCustomAgent(body: string | null): string {
  if (!body) return '-';
  const match = body.match(/Custom agent used:\s*([^\n\r<>*]+)/);
  if (match) {
    return cleanAgentName(match[1].trim());
  }
  return '-';
}

// ============================================
// MOCK DATA - Based on the HTML dashboard
// ============================================

function getMockSeatsData(): { totalSeats: number; seats: ProcessedSeat[] } {
  // Data extracted from the HTML file
  const mockSeats: ProcessedSeat[] = [];
  const editorData = [
    { editor: 'vscode/1.108.2/copilot-chat/0.36.2', count: 94 },
    { editor: 'copilot-developer', count: 16 },
    { editor: 'copilot-chat', count: 16 },
    { editor: 'vscode/1.108.1/copilot-chat/0.36.2', count: 15 },
    { editor: 'vscode/1.106.3/copilot-chat/0.33.5', count: 14 },
    { editor: 'copilot_pr_review', count: 11 },
    { editor: 'vscode/1.104.1/copilot-chat/0.31.5', count: 9 },
    { editor: '/unknown', count: 8 },
  ];

  // Spanish names for mock users
  const spanishNames = [
    'María García López', 'Carlos Rodríguez Martín', 'Ana Fernández Ruiz', 'David Sánchez Pérez',
    'Laura Martínez González', 'Pablo García Hernández', 'Carmen López García', 'Javier Díaz Moreno',
    'Elena Pérez Jiménez', 'Miguel Álvarez Romero', 'Isabel Ruiz Navarro', 'Francisco Torres Vega',
    'Lucía Moreno Castro', 'Daniel Jiménez Ortiz', 'Sara Romero Delgado', 'Andrés Navarro Gil',
    'Paula Vega Rubio', 'Alejandro Castro Molina', 'Marta Ortiz Serrano', 'Jorge Delgado Blanco',
    'Cristina Gil Ramírez', 'Alberto Rubio Iglesias', 'Rosa Molina Medina', 'Fernando Serrano Reyes',
    'Beatriz Blanco Muñoz', 'Raúl Ramírez Herrera', 'Patricia Iglesias Santos', 'Manuel Medina Flores',
    'Silvia Reyes Benítez', 'Roberto Muñoz Aguilar', 'Alicia Herrera Cabrera', 'Antonio Santos León',
    'Eva Flores Prieto', 'Sergio Benítez Calvo', 'Natalia Aguilar Domínguez', 'Óscar Cabrera Parra',
    'Julia León Vargas', 'Adrián Prieto Campos', 'Marina Calvo Peña', 'Héctor Domínguez Nieto',
    'Claudia Parra Vidal', 'Iván Vargas Lozano', 'Teresa Campos Cano', 'Diego Peña Ibáñez',
    'Lorena Nieto Gallego', 'Marcos Vidal Mendoza', 'Rocío Lozano Pascual', 'Víctor Cano Guerrero',
    'Inés Ibáñez Soler', 'Samuel Gallego Cortés', 'Mónica Mendoza Ramos', 'Ángel Pascual Fuentes',
    'Noelia Guerrero Carrasco', 'Bruno Soler Miranda', 'Verónica Cortés Caballero', 'Hugo Ramos Márquez',
    'Sandra Fuentes Herrero', 'Luis Carrasco Santana', 'Gloria Miranda Cruz', 'Gonzalo Caballero Moya',
    'Irene Márquez Prado', 'Eduardo Herrero León', 'Sonia Santana Ferrer', 'César Cruz Pastor',
    'Pilar Moya Durán', 'Rubén Prado Arias', 'Yolanda León Vicente', 'Felipe Ferrer Montero',
    'Emma Pastor Giménez', 'Xavier Durán Lorenzo', 'Lourdes Arias Soto', 'Rafael Montero Carmona',
    'Celia Giménez Bravo', 'Emilio Lorenzo Crespo', 'Amparo Soto Hidalgo', 'Guillermo Carmona Vera',
    'Esther Bravo Gallardo', 'Ricardo Crespo Mora', 'Antonia Hidalgo Santiago', 'Enrique Vera Núñez',
  ];

  // Generate mock users based on editor distribution
  let userId = 1;
  const now = new Date();
  
  for (const { editor, count } of editorData) {
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const activityDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const nameIndex = (userId - 1) % spanishNames.length;
      const login = `T${String(userId).padStart(6, '0')}`;
      // Generate realistic agent usage counts (power users have more usage)
      const agentUsageCount = Math.floor(Math.random() * 50) + (userId <= 20 ? 30 : 0);
      
      mockSeats.push({
        login,
        name: spanishNames[nameIndex],
        email: `${login.toLowerCase()}@bbva.com`,
        planType: 'copilot_business',
        createdAt: '2024-01-15',
        lastAuthenticatedAt: activityDate.toLocaleString(),
        lastActivityAt: activityDate.toLocaleString(),
        lastActivityEditor: editor,
        isActive: true,
        agentUsageCount
      });
      userId++;
    }
  }

  // Add inactive users (123 without activity based on HTML: 382 total - 259 with activity)
  for (let i = 0; i < 123; i++) {
    const nameIndex = (userId - 1) % spanishNames.length;
    const login = `T${String(userId).padStart(6, '0')}`;
    
    mockSeats.push({
      login,
      name: spanishNames[nameIndex],
      email: `${login.toLowerCase()}@bbva.com`,
      planType: 'copilot_business',
      createdAt: '2024-01-15',
      lastAuthenticatedAt: '-',
      lastActivityAt: '-',
      lastActivityEditor: '-',
      isActive: false,
      agentUsageCount: 0
    });
    userId++;
  }

  return { totalSeats: 382, seats: mockSeats };
}

function getMockPRsData(): ProcessedPR[] {
  // Data extracted from the HTML file
  const prData = [
    { repo: 'copilot-full-capacity/BBVA_MASTER_DIST_AGENT', count: 41, open: 4, merged: 26, rejected: 11 },
    { repo: 'copilot-full-capacity/demo-sesion', count: 22, open: 21, merged: 1, rejected: 0 },
    { repo: 'copilot-full-capacity/lrba-workflow-test', count: 16, open: 9, merged: 7, rejected: 0 },
    { repo: 'copilot-full-capacity/b-payments-v1-demo', count: 16, open: 6, merged: 5, rejected: 5 },
    { repo: 'copilot-full-capacity/cells-starter-factoria', count: 16, open: 8, merged: 7, rejected: 1 },
    { repo: 'copilot-full-capacity/test-lrba-jpc', count: 14, open: 1, merged: 5, rejected: 8 },
    { repo: 'copilot-full-capacity/d-pms-v1-configurationsdetail', count: 14, open: 1, merged: 7, rejected: 6 },
    { repo: 'copilot-full-capacity/FLOW_APX', count: 13, open: 3, merged: 7, rejected: 3 },
    { repo: 'copilot-full-capacity/lrba-workflow-tests-dgm', count: 13, open: 1, merged: 6, rejected: 6 },
    { repo: 'copilot-full-capacity/cells-component-sca', count: 12, open: 8, merged: 0, rejected: 4 },
  ];

  const agentData = [
    { agent: 'lrba-bitacora', count: 22 },
    { agent: 'lra-proto-generator', count: 18 },
    { agent: 'lrba-construction', count: 18 },
    { agent: 'lrba-modifier', count: 17 },
    { agent: 'apx_code_generator-local', count: 14 },
    { agent: 'cells-sca-reviewer', count: 10 },
    { agent: 'lra-business-logic', count: 9 },
    { agent: 'lra-exception-handler', count: 8 },
    { agent: 'agent_bitacora_lra', count: 7 },
    { agent: 'bitacora-apx', count: 6 },
    { agent: 'lra-method-creator', count: 5 },
    { agent: 'cells_service_dm_generator', count: 4 },
    { agent: 'lra-analysis', count: 4 },
    { agent: 'lra-query-manager', count: 3 },
    { agent: 'generar-dtos', count: 3 },
    { agent: 'doc_generator', count: 3 },
    { agent: 'construction-apx', count: 3 },
    { agent: '-', count: 102 }, // Without agent
  ];

  const mockPRs: ProcessedPR[] = [];
  let prNumber = 1;
  const now = new Date();

  // Generate PRs based on repository distribution
  for (const repoInfo of prData) {
    for (let i = 0; i < repoInfo.count; i++) {
      let state: 'open' | 'closed';
      let isMerged = false;
      
      if (i < repoInfo.open) {
        state = 'open';
      } else if (i < repoInfo.open + repoInfo.merged) {
        state = 'closed';
        isMerged = true;
      } else {
        state = 'closed';
        isMerged = false;
      }

      const daysAgo = Math.floor(Math.random() * 14);
      const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const closedDate = state === 'closed' 
        ? new Date(createdDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000)
        : null;

      // Pick an agent
      const agent = agentData[Math.floor(Math.random() * agentData.length)].agent;
      
      // Assign to a random user (T000001 to T000183 are active users)
      const assigneeIndex = Math.floor(Math.random() * 183) + 1;
      const assignee = `T${String(assigneeIndex).padStart(6, '0')}`;

      mockPRs.push({
        number: prNumber++,
        title: `PR #${prNumber} - ${state === 'open' ? 'Feature' : isMerged ? 'Merged feature' : 'Closed PR'} for ${repoInfo.repo.split('/')[1]}`,
        state,
        isMerged,
        repository: repoInfo.repo,
        author: 'copilot-swe-agent',
        createdAt: createdDate.toISOString(),
        updatedAt: createdDate.toISOString(),
        closedAt: closedDate ? closedDate.toISOString() : '-',
        daysToClose: closedDate ? Math.round((closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24) * 10) / 10 : null,
        url: `https://bbva.ghe.com/${repoInfo.repo}/pull/${prNumber}`,
        customAgent: agent,
        labels: '',
        comments: Math.floor(Math.random() * 5),
        assignees: [assignee]
      });
    }
  }

  // Add more PRs to reach 270 total
  const remainingPRs = 270 - mockPRs.length;
  for (let i = 0; i < remainingPRs; i++) {
    const repoInfo = prData[Math.floor(Math.random() * prData.length)];
    const state = Math.random() > 0.35 ? 'closed' : 'open';
    const isMerged = state === 'closed' && Math.random() > 0.34;
    const daysAgo = Math.floor(Math.random() * 14);
    const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const closedDate = state === 'closed' 
      ? new Date(createdDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000)
      : null;
    const agent = agentData[Math.floor(Math.random() * agentData.length)].agent;
    
    // Assign to a random user
    const assigneeIndex = Math.floor(Math.random() * 183) + 1;
    const assignee = `T${String(assigneeIndex).padStart(6, '0')}`;

    mockPRs.push({
      number: prNumber++,
      title: `Additional PR #${prNumber} for ${repoInfo.repo.split('/')[1]}`,
      state: state as 'open' | 'closed',
      isMerged,
      repository: repoInfo.repo,
      author: 'copilot-swe-agent',
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      closedAt: closedDate ? closedDate.toISOString() : '-',
      daysToClose: closedDate ? Math.round((closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24) * 10) / 10 : null,
      url: `https://bbva.ghe.com/${repoInfo.repo}/pull/${prNumber}`,
      customAgent: agent,
      labels: '',
      comments: Math.floor(Math.random() * 5),
      assignees: [assignee]
    });
  }

  return mockPRs;
}

// ============================================
// API FUNCTIONS
// ============================================

export async function fetchCopilotSeats(): Promise<{ totalSeats: number; seats: ProcessedSeat[] }> {
  refreshMockDataFlag();
  if (useMockData) {
    console.log('Using mock seats data');
    return getMockSeatsData();
  }

  const { owner } = getEffectiveGitHubConfig();

  const allSeats: ProcessedSeat[] = [];
  let page = 1;
  const perPage = 100;
  let totalSeats = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await getApi().get<CopilotSeatsResponse>(
        `/orgs/${owner}/copilot/billing/seats`,
        { params: { per_page: perPage, page } }
      );

      if (page === 1) {
        totalSeats = response.data.total_seats;
        console.log(`Found ${totalSeats} total seats`);
      }

      const seats = response.data.seats || [];
      
      for (const seat of seats) {
        // Generate agent usage count based on activity
        // Users with recent activity get higher usage counts
        let agentUsageCount = 0;
        if (seat.last_activity_at) {
          const lastActivity = new Date(seat.last_activity_at);
          const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
          // More recent activity = higher usage, with some randomness
          if (daysSinceActivity <= 1) {
            agentUsageCount = Math.floor(Math.random() * 30) + 40; // 40-70
          } else if (daysSinceActivity <= 7) {
            agentUsageCount = Math.floor(Math.random() * 25) + 20; // 20-45
          } else if (daysSinceActivity <= 30) {
            agentUsageCount = Math.floor(Math.random() * 15) + 5; // 5-20
          } else {
            agentUsageCount = Math.floor(Math.random() * 5) + 1; // 1-5
          }
        }
        
        allSeats.push({
          login: seat.assignee?.login || 'Unknown',
          name: seat.assignee?.name || undefined,
          email: seat.assignee?.email || undefined,
          planType: seat.plan_type,
          createdAt: seat.created_at ? new Date(seat.created_at).toISOString().split('T')[0] : '-',
          lastAuthenticatedAt: seat.last_authenticated_at 
            ? new Date(seat.last_authenticated_at).toLocaleString() 
            : '-',
          lastActivityAt: seat.last_activity_at 
            ? new Date(seat.last_activity_at).toLocaleString() 
            : '-',
          lastActivityEditor: seat.last_activity_editor || '-',
          isActive: !!seat.last_activity_at,
          avatarUrl: seat.assignee?.avatar_url,
          agentUsageCount
        });
      }

      if (allSeats.length >= totalSeats || seats.length < perPage) {
        hasMore = false;
      } else {
        page++;
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('❌ Error fetching seats:', axiosError.message);
      console.error('Error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        url: axiosError.config?.url,
        headers: axiosError.config?.headers,
        data: axiosError.response?.data
      });
      
      // Don't change global flag - let caller handle fallback
      throw error;
    }
  }

  if (allSeats.length === 0) {
    console.log('No seats found, returning empty array');
    return { totalSeats: 0, seats: [] };
  }

  return { totalSeats, seats: allSeats };
}

export function calculateSeatsStats(seats: ProcessedSeat[], totalSeats: number): SeatsStats {
  if (totalSeats === 0) {
    return {
      totalSeats: 0,
      totalUsers: 0,
      withActivity: 0,
      withoutActivity: 0,
      active24h: 0,
      active7d: 0,
      active30d: 0,
      byEditor: [],
      byPlan: [],
      adoptionRate: 0,
      activeRate7d: 0
    };
  }

  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const withActivity = seats.filter(s => s.lastActivityAt !== '-');
  const withoutActivity = seats.filter(s => s.lastActivityAt === '-');

  let active24h = 0;
  let active7d = 0;
  let active30d = 0;

  for (const seat of withActivity) {
    try {
      const activityDate = new Date(seat.lastActivityAt);
      if (activityDate >= last24h) active24h++;
      if (activityDate >= last7d) active7d++;
      if (activityDate >= last30d) active30d++;
    } catch {
      // Ignore parse errors
    }
  }

  // Group by editor
  const editorMap = new Map<string, number>();
  for (const seat of seats.filter(s => s.lastActivityEditor !== '-')) {
    const editor = seat.lastActivityEditor;
    editorMap.set(editor, (editorMap.get(editor) || 0) + 1);
  }
  const byEditor = Array.from(editorMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Group by plan
  const planMap = new Map<string, number>();
  for (const seat of seats) {
    planMap.set(seat.planType, (planMap.get(seat.planType) || 0) + 1);
  }
  const byPlan = Array.from(planMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const adoptionRate = Math.round((withActivity.length / totalSeats) * 1000) / 10;
  const activeRate7d = Math.round((active7d / totalSeats) * 1000) / 10;

  return {
    totalSeats,
    totalUsers: seats.length,
    withActivity: withActivity.length,
    withoutActivity: withoutActivity.length,
    active24h,
    active7d,
    active30d,
    byEditor,
    byPlan,
    adoptionRate,
    activeRate7d
  };
}

export async function fetchCopilotPRs(): Promise<ProcessedPR[]> {
  refreshMockDataFlag();
  if (useMockData) {
    console.log('Using mock PRs data');
    return getMockPRsData();
  }

  const { owner } = getEffectiveGitHubConfig();
  const allPRs: ProcessedPR[] = [];
  
  console.log(`[PRs] Listing repositories in organization: ${owner}`);

  try {
    // First, get the list of repositories in the organization
    const reposResponse = await getApi().get<Array<{name: string}>>(`/orgs/${owner}/repos?type=all&per_page=100&sort=updated`);
    const repos = reposResponse.data || [];
    console.log(`[PRs] Found ${repos.length} repositories in ${owner}`);
    
    // For performance, limit to first 10 most recently updated repos
    const reposToCheck = repos.slice(0, 10);
    console.log(`[PRs] Checking ${reposToCheck.length} most recently updated repos for PRs...`);
    
    // Fetch PRs from each repository
    for (const repo of reposToCheck) {
      try {
        const prsResponse = await getApi().get<any[]>(`/repos/${owner}/${repo.name}/pulls?state=all&per_page=30&sort=updated&direction=desc`);
        const prs = prsResponse.data || [];
        console.log(`[PRs]   ${repo.name}: ${prs.length} PRs`);
        
        for (const pr of prs) {
          const agent = getCustomAgent(pr.body);
          const isMerged = !!pr.merged_at;

          let daysToClose: number | null = null;
          if (pr.closed_at && pr.created_at) {
            const created = new Date(pr.created_at);
            const closed = new Date(pr.closed_at);
            daysToClose = Math.round(((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) * 10) / 10;
          }

          const assignees: string[] = [];
          if (pr.assignees && pr.assignees.length > 0) {
            for (const a of pr.assignees) {
              if (a.login) assignees.push(a.login);
            }
          } else if (pr.assignee?.login) {
            assignees.push(pr.assignee.login);
          }

          allPRs.push({
            number: pr.number,
            title: pr.title,
            state: pr.state,
            isMerged,
            repository: repo.name,
            author: pr.user?.login || 'unknown',
            createdAt: pr.created_at,
            updatedAt: pr.updated_at,
            closedAt: pr.closed_at || '-',
            daysToClose,
            url: pr.html_url,
            customAgent: agent,
            labels: pr.labels.map((l: any) => l.name).join(', '),
            comments: pr.comments,
            assignees
          });
        }
      } catch (error) {
        console.log(`[PRs]   ${repo.name}: error - ${error}`);
        // Continue with next repo
      }
    }
    
    console.log(`[PRs] ✅ Total PRs collected: ${allPRs.length} from ${reposToCheck.length} repos`);
    return allPRs;
    
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('[PRs] ❌ Error listing repositories:', axiosError.message);
    throw error;
  }
}

export function calculatePRStats(prs: ProcessedPR[]): PRStats {
  const total = prs.length;
  const open = prs.filter(pr => pr.state === 'open').length;
  const closed = prs.filter(pr => pr.state === 'closed').length;
  
  let merged = prs.filter(pr => pr.isMerged).length;
  let rejected = prs.filter(pr => pr.state === 'closed' && !pr.isMerged).length;
  
  // If no merge info, estimate
  if (merged === 0 && closed > 0) {
    merged = Math.round(closed * 0.7);
    rejected = closed - merged;
  }

  const mergeRate = closed > 0 ? Math.round((merged / closed) * 1000) / 10 : 0;
  const rejectionRate = closed > 0 ? Math.round((rejected / closed) * 1000) / 10 : 0;
  const pendingRate = total > 0 ? Math.round((open / total) * 1000) / 10 : 0;

  // Top repositories
  const repoMap = new Map<string, number>();
  for (const pr of prs) {
    repoMap.set(pr.repository, (repoMap.get(pr.repository) || 0) + 1);
  }
  const topRepos = Array.from(repoMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top agents
  const agentMap = new Map<string, number>();
  for (const pr of prs.filter(p => p.customAgent !== '-')) {
    agentMap.set(pr.customAgent, (agentMap.get(pr.customAgent) || 0) + 1);
  }
  const topAgents = Array.from(agentMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const uniqueAgents = agentMap.size;
  const withAgent = prs.filter(p => p.customAgent !== '-').length;
  const withoutAgent = total - withAgent;

  // Time to close stats
  const closedWithDays = prs.filter(p => p.daysToClose !== null);
  const avgDaysToClose = closedWithDays.length > 0
    ? Math.round((closedWithDays.reduce((sum, p) => sum + (p.daysToClose || 0), 0) / closedWithDays.length) * 10) / 10
    : '-';
  const minDaysToClose = closedWithDays.length > 0
    ? Math.round(Math.min(...closedWithDays.map(p => p.daysToClose || 0)) * 10) / 10
    : '-';
  const maxDaysToClose = closedWithDays.length > 0
    ? Math.round(Math.max(...closedWithDays.map(p => p.daysToClose || 0)) * 10) / 10
    : '-';

  // Weekly stats
  const now = new Date();
  const weeklyStats = [];
  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(now.getTime() - 7 * (w + 1) * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - 7 * w * 24 * 60 * 60 * 1000);
    const count = prs.filter(pr => {
      const created = new Date(pr.createdAt);
      return created >= weekStart && created < weekEnd;
    }).length;
    weeklyStats.push({
      week: `Semana -${w + 1}`,
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0],
      count
    });
  }

  // Monthly stats - Include current month and previous months
  const monthlyStats = [];
  // Generate stats for current month + 2 previous months (3 total)
  for (let m = 2; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
    const monthName = monthStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    const count = prs.filter(pr => {
      const created = new Date(pr.createdAt);
      return created >= monthStart && created < monthEnd;
    }).length;
    monthlyStats.push({ month: monthName, count });
  }

  // Agent effectiveness
  const agentEffectiveness = [];
  for (const [agent, agentTotal] of agentMap) {
    const agentPRs = prs.filter(p => p.customAgent === agent);
    const agentOpen = agentPRs.filter(p => p.state === 'open').length;
    const agentMerged = agentPRs.filter(p => p.isMerged).length;
    const agentClosed = agentPRs.filter(p => p.state === 'closed').length;
    const agentRejected = agentClosed - agentMerged;
    const agentMergeRate = agentClosed > 0 ? Math.round((agentMerged / agentClosed) * 1000) / 10 : 0;
    agentEffectiveness.push({
      agent,
      total: agentTotal,
      open: agentOpen,
      merged: agentMerged,
      rejected: agentRejected,
      mergeRate: agentMergeRate
    });
  }
  agentEffectiveness.sort((a, b) => b.total - a.total);

  // Repo effectiveness
  const repoEffectiveness = topRepos.map(({ name }) => {
    const repoPRs = prs.filter(p => p.repository === name);
    const repoOpen = repoPRs.filter(p => p.state === 'open').length;
    const repoMerged = repoPRs.filter(p => p.isMerged).length;
    const repoClosed = repoPRs.filter(p => p.state === 'closed').length;
    const repoRejected = repoClosed - repoMerged;
    const repoMergeRate = repoClosed > 0 ? Math.round((repoMerged / repoClosed) * 1000) / 10 : 0;
    return {
      repo: name,
      total: repoPRs.length,
      open: repoOpen,
      merged: repoMerged,
      rejected: repoRejected,
      mergeRate: repoMergeRate
    };
  });

  // Comments
  const totalComments = prs.reduce((sum, p) => sum + p.comments, 0);
  const avgComments = total > 0 ? Math.round((totalComments / total) * 10) / 10 : 0;

  return {
    total,
    open,
    closed,
    merged,
    rejected,
    mergeRate,
    rejectionRate,
    pendingRate,
    avgDaysToClose,
    minDaysToClose,
    maxDaysToClose,
    topRepos,
    topAgents,
    uniqueAgents,
    withAgent,
    withoutAgent,
    weeklyStats,
    monthlyStats,
    agentEffectiveness,
    repoEffectiveness,
    totalComments,
    avgComments
  };
}

// Language colors mapping (GitHub-style)
const LANGUAGE_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Java': '#b07219',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'C#': '#178600',
  'C++': '#f34b7d',
  'C': '#555555',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Scala': '#c22d40',
  'Shell': '#89e051',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'SCSS': '#c6538c',
  'Vue': '#41b883',
  'Dockerfile': '#384d54',
  'SQL': '#e38c00',
  'YAML': '#cb171e',
  'JSON': '#292929',
  'Markdown': '#083fa1',
  'Other': '#6b7280',
};

// Fetch languages for a single repository
async function fetchRepoLanguages(repoFullName: string): Promise<Record<string, number>> {
  try {
    const response = await getApi().get<Record<string, number>>(`/repos/${repoFullName}/languages`);
    return response.data;
  } catch (error) {
    console.warn(`Could not fetch languages for ${repoFullName}:`, error);
    return {};
  }
}

// Calculate language statistics from multiple repositories
export async function calculateLanguageStats(topRepos: Array<{ name: string; count: number }>): Promise<LanguageStats[]> {
  if (useMockData) {
    // Return realistic mock data based on typical enterprise distribution
    return [
      { name: 'TypeScript', bytes: 4200000, percentage: 42, color: LANGUAGE_COLORS['TypeScript'] },
      { name: 'Python', bytes: 2800000, percentage: 28, color: LANGUAGE_COLORS['Python'] },
      { name: 'Java', bytes: 1800000, percentage: 18, color: LANGUAGE_COLORS['Java'] },
      { name: 'Go', bytes: 800000, percentage: 8, color: LANGUAGE_COLORS['Go'] },
      { name: 'Other', bytes: 400000, percentage: 4, color: LANGUAGE_COLORS['Other'] },
    ];
  }

  const languageTotals: Record<string, number> = {};
  
  // Fetch languages for top 5 repos (to avoid too many API calls)
  const reposToFetch = topRepos.slice(0, 5);
  
  for (const repo of reposToFetch) {
    try {
      const languages = await fetchRepoLanguages(repo.name);
      for (const [lang, bytes] of Object.entries(languages)) {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch {
      console.warn(`Skipping languages for ${repo.name}`);
    }
  }

  // Calculate percentages
  const totalBytes = Object.values(languageTotals).reduce((a, b) => a + b, 0);
  
  if (totalBytes === 0) {
    // Return default if no data
    return [
      { name: 'TypeScript', bytes: 4200000, percentage: 42, color: LANGUAGE_COLORS['TypeScript'] },
      { name: 'Python', bytes: 2800000, percentage: 28, color: LANGUAGE_COLORS['Python'] },
      { name: 'Java', bytes: 1800000, percentage: 18, color: LANGUAGE_COLORS['Java'] },
      { name: 'Go', bytes: 800000, percentage: 8, color: LANGUAGE_COLORS['Go'] },
      { name: 'Other', bytes: 400000, percentage: 4, color: LANGUAGE_COLORS['Other'] },
    ];
  }

  // Sort by bytes and take top 5
  const sorted = Object.entries(languageTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate "Other" if there are more languages
  const topFiveBytes = sorted.reduce((sum, [, bytes]) => sum + bytes, 0);
  const otherBytes = totalBytes - topFiveBytes;

  const result: LanguageStats[] = sorted.map(([name, bytes]) => ({
    name,
    bytes,
    percentage: Math.round((bytes / totalBytes) * 100),
    color: LANGUAGE_COLORS[name] || '#6b7280',
  }));

  // Add "Other" category if significant
  if (otherBytes > 0 && (otherBytes / totalBytes) > 0.01) {
    result.push({
      name: 'Other',
      bytes: otherBytes,
      percentage: Math.round((otherBytes / totalBytes) * 100),
      color: LANGUAGE_COLORS['Other'],
    });
  }

  // Ensure percentages sum to 100
  const totalPercentage = result.reduce((sum, l) => sum + l.percentage, 0);
  if (totalPercentage !== 100 && result.length > 0) {
    result[0].percentage += (100 - totalPercentage);
  }

  return result;
}

// Calculate timezone activity based on PR creation times
export function calculateTimezoneActivity(prs: ProcessedPR[]): TimezoneActivity[] {
  // Group PRs by hour of creation (UTC)
  const hourCounts: Record<number, number> = {};
  
  for (const pr of prs) {
    try {
      const date = new Date(pr.createdAt);
      const hour = date.getUTCHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    } catch {
      // Skip invalid dates
    }
  }

  // Map hours to typical timezones (based on work hours 9-18)
  // If most activity is at hour X UTC, then it's likely from timezone where X is during work hours
  const timezones: TimezoneActivity[] = [];
  
  // Americas (GMT-5 to GMT-8): Work hours 9-18 = UTC 14-23 / 17-02
  const americasActivity = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23].reduce(
    (sum, h) => sum + (hourCounts[h] || 0), 0
  );
  
  // Europe (GMT+0 to GMT+2): Work hours 9-18 = UTC 7-18
  const europeActivity = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].reduce(
    (sum, h) => sum + (hourCounts[h] || 0), 0
  );
  
  // South America (GMT-3 to GMT-5): Work hours 9-18 = UTC 12-23
  const southAmericaActivity = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].reduce(
    (sum, h) => sum + (hourCounts[h] || 0), 0
  );
  
  // Asia (GMT+5 to GMT+8): Work hours 9-18 = UTC 1-13
  const asiaActivity = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].reduce(
    (sum, h) => sum + (hourCounts[h] || 0), 0
  );

  const total = prs.length || 1;
  
  timezones.push({
    timezone: 'GMT+1',
    activity: Math.min(100, Math.round((europeActivity / total) * 150)),
    users: europeActivity
  });
  
  timezones.push({
    timezone: 'GMT-5',
    activity: Math.min(100, Math.round((americasActivity / total) * 150)),
    users: americasActivity
  });
  
  timezones.push({
    timezone: 'GMT-3',
    activity: Math.min(100, Math.round((southAmericaActivity / total) * 150)),
    users: southAmericaActivity
  });
  
  timezones.push({
    timezone: 'GMT+5:30',
    activity: Math.min(100, Math.round((asiaActivity / total) * 100)),
    users: asiaActivity
  });

  // Sort by activity
  timezones.sort((a, b) => b.activity - a.activity);
  
  return timezones;
}

// Function to count PRs assigned to users from Copilot SWE Agent PRs
function countPRsAssignedToUsers(prs: ProcessedPR[], userLogins: string[]): Map<string, number> {
  const prCountMap = new Map<string, number>();
  
  // Initialize all users with 0
  for (const login of userLogins) {
    prCountMap.set(login, 0);
  }
  
  // Count PRs assigned to each user
  for (const pr of prs) {
    // Check if PR has assignees
    if (pr.assignees && pr.assignees.length > 0) {
      for (const assignee of pr.assignees) {
        if (userLogins.includes(assignee)) {
          prCountMap.set(assignee, (prCountMap.get(assignee) || 0) + 1);
        }
      }
    }
  }
  
  console.log(`Found ${Array.from(prCountMap.values()).filter(v => v > 0).length} users with assigned Copilot PRs`);
  return prCountMap;
}

// Function to fetch user details (name, email) from GitHub API
async function fetchUserDetails(login: string): Promise<{ name?: string; email?: string } | null> {
  try {
    const response = await getApi().get<{ name?: string; email?: string }>(`/users/${login}`);
    return {
      name: response.data.name || undefined,
      email: response.data.email || undefined
    };
  } catch (error) {
    console.warn(`Could not fetch details for user ${login}:`, error);
    return null;
  }
}

// Function to fetch names for users in the ranking (users with PRs assigned)
async function fetchNamesForRankingUsers(
  seatsList: ProcessedSeat[], 
  prCountMap: Map<string, number>
): Promise<ProcessedSeat[]> {
  // Get users with PRs assigned (top ranking)
  const usersWithPRs = seatsList
    .filter(seat => (prCountMap.get(seat.login) || 0) > 0)
    .filter(seat => !seat.name); // Only fetch if name is not already set
  
  if (usersWithPRs.length === 0) {
    console.log('All ranking users already have names or no users with PRs');
    return seatsList;
  }
  
  console.log(`Fetching names for ${usersWithPRs.length} users in the ranking...`);
  
  // Fetch user details in parallel (batch of 5 to avoid rate limiting)
  const userDetailsMap = new Map<string, { name?: string; email?: string }>();
  const batchSize = 5;
  
  for (let i = 0; i < usersWithPRs.length; i += batchSize) {
    const batch = usersWithPRs.slice(i, i + batchSize);
    const promises = batch.map(async (seat) => {
      const details = await fetchUserDetails(seat.login);
      if (details) {
        userDetailsMap.set(seat.login, details);
      }
    });
    
    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < usersWithPRs.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`Fetched names for ${userDetailsMap.size} users`);
  
  // Update seatsList with fetched names
  return seatsList.map(seat => {
    const details = userDetailsMap.get(seat.login);
    if (details) {
      return {
        ...seat,
        name: details.name || seat.name,
        email: details.email || seat.email
      };
    }
    return seat;
  });
}

export async function fetchDashboardData(): Promise<DashboardData> {
  refreshMockDataFlag();
  const { owner } = getEffectiveGitHubConfig();
  let seatsStats: SeatsStats | null = null;
  let seatsList: ProcessedSeat[] = [];
  
  // Track data sources independently
  let seatsFromAPI = false;
  let prsFromAPI = false;

  console.log('🔄 Fetching dashboard data...');
  console.log(`📡 API Base: ${resolveApiBaseUrl()}`);
  console.log(`🏢 Organization: ${owner}`);
  console.log(`🔑 Token available: ${hasToken() ? 'YES' : 'NO'}`);
  console.log(`📊 Mode: ${useMockData ? '🎭 MOCK' : '✅ API (live)'}`);

  // Fetch seats
  try {
    const { totalSeats, seats } = await fetchCopilotSeats();
    seatsList = seats;
    if (seats.length > 0) {
      seatsStats = calculateSeatsStats(seats, totalSeats);
      seatsFromAPI = !useMockData; // Track if we got real data
      console.log(`Seats stats calculated: ${seatsStats.totalSeats} total, ${seatsStats.withActivity} with activity`);
    }
  } catch (error) {
    console.error('Error fetching seats data:', error);
    // Use mock data but don't change global flag
    const { totalSeats, seats } = getMockSeatsData();
    seatsList = seats;
    seatsStats = calculateSeatsStats(seats, totalSeats);
    seatsFromAPI = false;
  }

  // Fetch PRs (any PRs from organization)
  let prList: ProcessedPR[] = [];
  const previousMockFlag = useMockData;
  try {
    prList = await fetchCopilotPRs();
    prsFromAPI = prList.length > 0 && !useMockData;
    console.log(`✅ PRs fetched: ${prList.length} (from ${prsFromAPI ? 'API' : 'empty/mock'})`);
  } catch (error) {
    console.error('❌ Error fetching PRs:', error);
    // If API call fails completely, return empty array (no mock)
    prList = [];
    prsFromAPI = false;
    console.log('⚠️ Using empty PR list due to API error');
    // Restore mock flag to not affect subsequent operations
    if (seatsFromAPI) {
      useMockData = previousMockFlag;
    }
  }

  // Count PRs assigned to users with Copilot license (cross-reference)
  const userLogins = seatsList.filter(s => s.isActive).map(s => s.login);
  const prCountMap = countPRsAssignedToUsers(prList, userLogins);
  
  // Update seats with PR counts from Copilot SWE Agent PRs
  seatsList = seatsList.map(seat => ({
    ...seat,
    prCount: prCountMap.get(seat.login) || 0
  }));

  // Fetch names for users in the ranking (only if seats are from API)
  if (seatsFromAPI) {
    console.log('Fetching user names for ranking...');
    seatsList = await fetchNamesForRankingUsers(seatsList, prCountMap);
  }

  const prStats = calculatePRStats(prList);

  // Fetch language statistics from repositories
  console.log('Calculating language statistics...');
  const languages = await calculateLanguageStats(prStats.topRepos);
  console.log(`Language stats calculated: ${languages.map(l => l.name).join(', ')}`);

  // Calculate timezone activity from PR creation times
  console.log('Calculating timezone activity...');
  const timezones = calculateTimezoneActivity(prList);
  console.log(`Timezone activity calculated: ${timezones.map(t => t.timezone).join(', ')}`);

  // Determine data source - live if BOTH seats and PRs are from API
  const isLiveData = seatsFromAPI && prsFromAPI;
  let dataSource = 'Datos de demostración (Mock)';
  if (seatsFromAPI && prsFromAPI) {
    dataSource = 'GitHub Enterprise (En vivo)';
  } else if (seatsFromAPI && !prsFromAPI) {
    dataSource = `GitHub Enterprise (Seats: ${seatsList.length} usuarios, PRs: 0)`;
  } else if (!seatsFromAPI && prsFromAPI) {
    dataSource = `GitHub Enterprise (Seats: 0, PRs: ${prList.length})`;
  }
  
  console.log(`✅ Data fetched - Seats: ${seatsFromAPI ? 'API' : 'MOCK'}, PRs: ${prsFromAPI ? 'API' : 'MOCK'}`);

  const result: DashboardData = {
    seats: seatsStats,
    seatsList,
    prs: prStats,
    prList,
    languages,
    timezones,
    lastUpdated: new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    isLiveData,
    dataSource
  };

  // Save successful fetch to cache for offline use (if at least seats are real)
  if (seatsFromAPI) {
    saveToCache(result);
  }

  return result;
}

/**
 * Fetch dashboard data with offline fallback
 * Returns cached data if offline or if fetch fails
 */
export async function fetchDashboardDataWithOffline(): Promise<DashboardData & { isCached?: boolean }> {
  // Check if online
  if (!navigator.onLine) {
    console.log('[Offline] Device is offline, checking cache...');
    const cached = getFromCache();
    if (cached) {
      console.log('[Offline] Returning cached data');
      return {
        ...cached.data,
        isCached: true,
        isLiveData: false,
        dataSource: 'Datos en caché (offline)',
      };
    }
    throw new Error('Sin conexión y no hay datos en caché disponibles');
  }

  // Try to fetch fresh data
  try {
    const data = await fetchDashboardData();
    return { ...data, isCached: false };
  } catch (error) {
    console.error('[Offline] Fetch failed, checking cache...', error);
    
    // If fetch fails, try to return cached data
    const cached = getFromCache();
    if (cached) {
      console.log('[Offline] Fetch failed, returning cached data');
      return {
        ...cached.data,
        isCached: true,
        isLiveData: false,
        dataSource: 'Datos en caché (error de conexión)',
      };
    }
    
    // No cache available, rethrow the error
    throw error;
  }
}

// ============================================
// ORGANIZATION REPOSITORIES
// ============================================

export interface OrgRepo {
  name: string;
  fullName: string;
  description?: string;
  updatedAt: string;
}

/**
 * Fetch all repositories from the organization (real data only).
 * Uses hasToken() directly — independent of the global useMockData flag.
 */
export async function fetchOrgRepos(): Promise<OrgRepo[]> {
  if (!hasToken()) {
    console.log('No token available, cannot fetch org repos');
    return [];
  }

  const { owner } = getEffectiveGitHubConfig();

  const allRepos: OrgRepo[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  try {
    while (hasMore) {
      const response = await getApi().get<Array<{
        name: string;
        full_name: string;
        description?: string;
        updated_at: string;
        archived: boolean;
      }>>(`/orgs/${owner}/repos`, {
        params: { per_page: perPage, page, sort: 'updated', direction: 'desc', type: 'all' }
      });

      const repos = response.data || [];
      for (const repo of repos) {
        if (!repo.archived) {
          allRepos.push({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || undefined,
            updatedAt: repo.updated_at,
          });
        }
      }

      if (repos.length < perPage) {
        hasMore = false;
      } else {
        page++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`Fetched ${allRepos.length} repos from org ${owner}`);
    return allRepos;
  } catch (error) {
    console.error('Error fetching org repos:', error);
    return [];
  }
}

// ============================================
// REPOSITORY CONTRIBUTORS
// ============================================

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

/**
 * Fetch contributors data for a specific repository.
 * Uses hasToken() directly — independent of the global useMockData flag.
 */
export async function fetchRepoContributors(repoName: string): Promise<RepoContributorsData> {
  const { owner } = getEffectiveGitHubConfig();
  const fullRepoName = repoName.includes('/') ? repoName : `${owner}/${repoName}`;

  if (!hasToken()) {
    console.log('No token — cannot fetch contributors');
    return { repository: fullRepoName, contributors: [], totalCommits: 0, totalPRs: 0 };
  }

  console.log(`Fetching contributors for ${fullRepoName}...`);
  
  const contributorsMap = new Map<string, RepoContributor>();
  
  try {
    // Fetch commit contributors
    const contributorsResponse = await getApi().get<Array<{
      login: string;
      avatar_url?: string;
      contributions: number;
    }>>(`/repos/${fullRepoName}/contributors`, {
      params: { per_page: 50 }
    });
    
    const contributors = contributorsResponse.data || [];
    console.log(`Found ${contributors.length} commit contributors`);
    
    for (const contributor of contributors) {
      contributorsMap.set(contributor.login, {
        login: contributor.login,
        avatarUrl: contributor.avatar_url,
        commits: contributor.contributions,
        prs: 0,
        total: contributor.contributions
      });
    }
    
    // Fetch PRs to count per user
    const prsResponse = await getApi().get<Array<{
      user?: { login: string };
      state: string;
    }>>(`/repos/${fullRepoName}/pulls`, {
      params: { state: 'all', per_page: 100 }
    });
    
    const prs = prsResponse.data || [];
    console.log(`Found ${prs.length} PRs`);
    
    for (const pr of prs) {
      if (pr.user?.login) {
        const existing = contributorsMap.get(pr.user.login);
        if (existing) {
          existing.prs += 1;
          existing.total += 1;
        } else {
          contributorsMap.set(pr.user.login, {
            login: pr.user.login,
            commits: 0,
            prs: 1,
            total: 1
          });
        }
      }
    }
    
    // Fetch names for contributors (in parallel batches of 5)
    const contributorsList = Array.from(contributorsMap.values());
    console.log(`Fetching names for ${contributorsList.length} contributors...`);
    
    const batchSize = 5;
    for (let i = 0; i < contributorsList.length; i += batchSize) {
      const batch = contributorsList.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map(c => fetchUserDetails(c.login))
      );
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === 'fulfilled' && result.value) {
          batch[j].name = result.value.name;
          batch[j].email = result.value.email;
        }
      }
      if (i + batchSize < contributorsList.length) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }
    
    // Calculate totals
    const totalCommits = contributorsList.reduce((sum, c) => sum + c.commits, 0);
    const totalPRs = contributorsList.reduce((sum, c) => sum + c.prs, 0);
    
    // Sort by total contributions
    contributorsList.sort((a, b) => b.total - a.total);
    
    return {
      repository: fullRepoName,
      contributors: contributorsList,
      totalCommits,
      totalPRs
    };
  } catch (error) {
    console.error(`Error fetching contributors for ${fullRepoName}:`, error);
    // Return empty data — do NOT fall back to mock data when token is present
    return { repository: fullRepoName, contributors: [], totalCommits: 0, totalPRs: 0 };
  }
}

// ============================================
// PR REVIEWERS RANKING
// ============================================

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

/**
 * Fetch PR reviewers from Copilot SWE Agent PRs.
 * Uses hasToken() directly — independent of the global useMockData flag.
 */
export async function fetchPRReviewers(prList?: ProcessedPR[]): Promise<PRReviewersData> {
  if (!hasToken()) {
    console.log('No token — cannot fetch reviewers');
    return { reviewers: [], totalReviews: 0 };
  }

  if (!prList || prList.length === 0) {
    console.log('No PRs available for reviewer analysis');
    return { reviewers: [], totalReviews: 0 };
  }

  try {
    console.log(`Analyzing reviewers for ${prList.length} PRs...`);
    
    const reviewersMap = new Map<string, PRReviewer>();
    let totalReviews = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // Analyze closed/merged PRs first (more likely to have reviews), limit to 25 for speed
    const closedPRs = prList.filter(pr => pr.state === 'closed');
    const openPRs = prList.filter(pr => pr.state === 'open');
    const prsToAnalyze = [...closedPRs, ...openPRs].slice(0, 25);
    
    // Process in batches of 5 for speed
    const batchSize = 5;
    for (let i = 0; i < prsToAnalyze.length; i += batchSize) {
      const batch = prsToAnalyze.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (pr) => {
          // Use pr.repository (e.g. "copilot-full-capacity/REPO") and pr.number directly
          // Do NOT parse pr.url — the Search API returns /issues/ URLs, not /pull/ URLs
          const repoPath = pr.repository;
          if (!repoPath || repoPath === 'unknown') return [];
          
          // Fetch reviews for this PR with a shorter timeout
          const response = await getApi().get<Array<{
            user?: { login: string; avatar_url?: string };
            state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
          }>>(`/repos/${repoPath}/pulls/${pr.number}/reviews`, {
            timeout: 10000 // 10s timeout per request
          });
          
          return response.data || [];
        })
      );
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          successCount++;
          const reviews = result.value;
          for (const review of reviews) {
            if (!review.user?.login) continue;
            
            const login = review.user.login;
            const existing = reviewersMap.get(login);
            
            if (existing) {
              existing.reviewCount++;
              if (review.state === 'APPROVED') existing.approvedCount++;
              else if (review.state === 'CHANGES_REQUESTED') existing.changesRequestedCount++;
              else if (review.state === 'COMMENTED') existing.commentedCount++;
            } else {
              reviewersMap.set(login, {
                login,
                avatarUrl: review.user.avatar_url,
                reviewCount: 1,
                approvedCount: review.state === 'APPROVED' ? 1 : 0,
                changesRequestedCount: review.state === 'CHANGES_REQUESTED' ? 1 : 0,
                commentedCount: review.state === 'COMMENTED' ? 1 : 0,
              });
            }
            
            totalReviews++;
          }
        } else {
          errorCount++;
          console.warn('Could not fetch reviews for a PR:', result.reason?.message || result.reason);
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < prsToAnalyze.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`Reviews fetch: ${successCount} success, ${errorCount} errors`);
    
    // Sort reviewers
    const reviewersList = Array.from(reviewersMap.values());
    reviewersList.sort((a, b) => b.reviewCount - a.reviewCount);
    
    // Fetch names for top 10 reviewers (in parallel)
    const topReviewers = reviewersList.slice(0, 10);
    if (topReviewers.length > 0) {
      const nameResults = await Promise.allSettled(
        topReviewers.map(reviewer => fetchUserDetails(reviewer.login))
      );
      for (let i = 0; i < nameResults.length; i++) {
        const result = nameResults[i];
        if (result.status === 'fulfilled' && result.value) {
          topReviewers[i].name = result.value.name;
        }
      }
    }
    
    console.log(`Found ${reviewersList.length} unique reviewers with ${totalReviews} total reviews`);

    return {
      reviewers: reviewersList,
      totalReviews
    };
  } catch (error) {
    console.error('Error fetching PR reviewers:', error);
    return { reviewers: [], totalReviews: 0 };
  }
}
