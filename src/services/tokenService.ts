import axios from 'axios';

const TOKEN_KEY = 'github_copilot_metrics_token';
const API_BASE_URL = '/github-api';

export interface TokenInfo {
  valid: boolean;
  user?: string;
  server?: string;
  organization?: string;
  error?: string;
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
  const envToken = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  if (envToken && envToken.trim()) {
    return envToken.trim();
  }
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
export async function validateToken(token: string): Promise<TokenInfo> {
  try {
    // Test the token by fetching user info
    const response = await axios.get(`${API_BASE_URL}/user`, {
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
        server: 'bbva.ghe.com',
        organization: 'copilot-full-capacity'
      };
    }

    return {
      valid: false,
      error: 'Respuesta inesperada del servidor'
    };
  } catch (error) {
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
  }
}
