import axios from 'axios';

const TOKEN_KEY = 'github_copilot_metrics_token';
const CONFIG_KEY = 'github_copilot_metrics_config';
const API_PROXY_BASE_URL = '/github-api';
const DEFAULT_GITHUB_BASE_URL = 'https://bbva.ghe.com';
const DEFAULT_OWNER = 'copilot-full-capacity';

export interface GitHubConfig {
  baseUrl: string;
  owner: string;
  repo: string;
}

export interface EffectiveGitHubConfig extends GitHubConfig {
  apiUrl: string;
  webUrl: string;
}

export interface TokenInfo {
  valid: boolean;
  user?: string;
  server?: string;
  organization?: string;
  error?: string;
}

export interface GitHubConnectionInfo {
  valid: boolean;
  owner?: string;
  repo?: string;
  error?: string;
}

export function normalizeBaseUrl(raw?: string | null): string {
  const base = (raw || '').trim();
  if (!base) return DEFAULT_GITHUB_BASE_URL;
  return base.replace(/\/$/, '');
}

export function normalizeApiUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, '');
  if (trimmed.includes('api.github.com')) {
    return 'https://api.github.com';
  }
  if (trimmed.includes('github.com')) {
    return 'https://api.github.com';
  }
  if (trimmed.endsWith('/api/v3')) {
    return trimmed;
  }
  return `${trimmed}/api/v3`;
}

export function normalizeWebUrl(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, '');
  if (trimmed.includes('api.github.com')) {
    return 'https://github.com';
  }
  if (trimmed.endsWith('/api/v3')) {
    return trimmed.replace(/\/api\/v3$/, '');
  }
  return trimmed;
}

export function getStoredGitHubConfig(): GitHubConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GitHubConfig>;
    return {
      baseUrl: normalizeBaseUrl(parsed.baseUrl),
      owner: (parsed.owner || '').trim(),
      repo: (parsed.repo || '').trim(),
    };
  } catch {
    return null;
  }
}

export function setStoredGitHubConfig(config: GitHubConfig): void {
  try {
    const payload: GitHubConfig = {
      baseUrl: normalizeBaseUrl(config.baseUrl),
      owner: config.owner.trim(),
      repo: config.repo.trim(),
    };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to store GitHub config:', e);
  }
}

export function clearStoredGitHubConfig(): void {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (e) {
    console.error('Failed to clear GitHub config:', e);
  }
}

export function getEffectiveGitHubConfig(): EffectiveGitHubConfig {
  const stored = getStoredGitHubConfig();
  const baseUrl = stored?.baseUrl || normalizeBaseUrl(import.meta.env.VITE_GITHUB_BASE_URL as string | undefined);
  const owner = stored?.owner || (import.meta.env.VITE_GITHUB_OWNER as string | undefined)?.trim() || DEFAULT_OWNER;
  const repo = stored?.repo || (import.meta.env.VITE_GITHUB_REPO as string | undefined)?.trim() || '';
  const apiUrl = normalizeApiUrl(baseUrl);
  const webUrl = normalizeWebUrl(baseUrl);
  return { baseUrl, owner, repo, apiUrl, webUrl };
}

export function getApiUrlForBaseUrl(baseUrl?: string): string {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalizeApiUrl(normalized);
}

export function getApiBaseUrl(): string {
  const stored = getStoredGitHubConfig();
  if (stored?.baseUrl?.trim()) {
    return normalizeApiUrl(stored.baseUrl);
  }
  return API_PROXY_BASE_URL;
}

/**
 * Get the stored token from localStorage
 */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store a token in localStorage
 */
export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to store token:', e);
  }
}

/**
 * Clear the stored token from localStorage
 */
export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to clear token:', e);
  }
}

/**
 * Get the effective token.
 * Priority: 1) Settings page (localStorage)  2) .env VITE_GITHUB_TOKEN
 * Returns empty string when no token is configured anywhere.
 */
export function getEffectiveToken(): string {
  // 1. Token from Settings page (localStorage)
  const stored = getStoredToken();
  if (stored) {
    return stored;
  }
  // 2. Token from environment variable (.env)
  const envToken = (import.meta.env.VITE_GITHUB_TOKEN as string | undefined)?.trim();
  if (envToken) return envToken;
  // No token configured
  return '';
}

/**
 * Check whether a token is available from any source.
 */
export function hasToken(): boolean {
  return getEffectiveToken().length > 0;
}

/**
 * Validate a token by making a test API call
 */
export interface TokenValidationOverrides {
  baseUrl?: string;
  owner?: string;
}

export async function validateToken(
  token: string,
  overrides: TokenValidationOverrides = {}
): Promise<TokenInfo> {
  const mapTokenError = (error: unknown): TokenInfo => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          valid: false,
          error: 'Token inválido o expirado'
        };
      }
      if (error.response?.status === 403) {
        return {
          valid: false,
          error: 'Token sin permisos suficientes'
        };
      }
      if (error.code === 'ECONNABORTED') {
        return {
          valid: false,
          error: 'Timeout: El servidor no respondió'
        };
      }
    }

    return {
      valid: false,
      error: 'Error de conexión. Verifica tu red.'
    };
  };

  try {
    const effectiveConfig = getEffectiveGitHubConfig();
    const owner = overrides.owner?.trim() || effectiveConfig.owner;
    const webUrl = overrides.baseUrl ? normalizeWebUrl(overrides.baseUrl) : effectiveConfig.webUrl;
    const apiUrl = overrides.baseUrl ? getApiUrlForBaseUrl(overrides.baseUrl) : getApiBaseUrl();
    // Test the token by fetching user info
    const response = await axios.get(`${apiUrl}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      timeout: 10000
    });

    if (response.status === 200 && response.data) {
      return {
        valid: true,
        user: response.data.login || response.data.name,
        server: webUrl,
        organization: owner
      };
    }

    return {
      valid: false,
      error: 'Respuesta inesperada del servidor'
    };
  } catch (error) {
    return mapTokenError(error);
  }
}

export interface GitHubConnectionOverrides {
  baseUrl?: string;
  owner?: string;
}

export async function validateGitHubConnection(
  token?: string,
  overrides: GitHubConnectionOverrides = {}
): Promise<GitHubConnectionInfo> {
  const effectiveToken = token?.trim() || getEffectiveToken();
  if (!effectiveToken) {
    return { valid: false, error: 'Token requerido para validar la conexión' };
  }

  const effectiveConfig = getEffectiveGitHubConfig();
  const owner = overrides.owner?.trim() || effectiveConfig.owner;
  const apiUrl = overrides.baseUrl ? getApiUrlForBaseUrl(overrides.baseUrl) : getApiBaseUrl();

  const headers = {
    'Authorization': `Bearer ${effectiveToken}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const apiGet = async (path: string) => {
    await axios.get(`${apiUrl}${path}`, {
      headers,
      timeout: 10000
    });
  };

  const mapValidationError = (error: unknown): GitHubConnectionInfo => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { valid: false, error: 'Token inválido o expirado' };
      }
      if (error.response?.status === 403) {
        return { valid: false, error: 'Token sin permisos suficientes' };
      }
      if (error.response?.status === 404) {
        return { valid: false, error: 'Organización o repositorio no encontrado' };
      }
      if (error.code === 'ECONNABORTED') {
        return { valid: false, error: 'Timeout: El servidor no respondió' };
      }
    }
    return { valid: false, error: 'Error de conexión. Verifica tu red.' };
  };

  const runChecks = async () => {
    await apiGet('/user');
    if (owner) {
      await apiGet(`/orgs/${owner}`);
    }
  };

  try {
    await runChecks();
    return { valid: true, owner };
  } catch (error) {
    return mapValidationError(error);
  }
}
