import { CacheEntry, DashboardData, KPIData } from './types.js';

/**
 * In-memory cache with TTL support
 * Stores dashboard data for fast retrieval
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 30000) {
    this.defaultTTL = defaultTTL;
  }

  /**
   * Set a value in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL
    };
    this.cache.set(key, entry);
  }

  /**
   * Get a value from cache (returns null if expired or not found)
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Get a value even if expired (for stale-while-revalidate pattern)
   */
  getStale<T>(key: string): { data: T | null; isStale: boolean } {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return { data: null, isStale: true };
    }

    const isStale = Date.now() - entry.timestamp > entry.ttl;
    return { data: entry.data, isStale };
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Get entry age in milliseconds
   */
  getAge(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return Date.now() - entry.timestamp;
  }
}

// Singleton instance
const cache = new MemoryCache(parseInt(process.env.CACHE_TTL || '30') * 1000);

// Cache keys
export const CACHE_KEYS = {
  DASHBOARD: 'dashboard:full',
  KPIS: 'dashboard:kpis',
  SEATS: 'dashboard:seats',
  PRS: 'dashboard:prs',
  LANGUAGES: 'dashboard:languages',
  TIMEZONES: 'dashboard:timezones'
} as const;

// Export cache instance and helpers
export { cache };

/**
 * Extract KPIs from full dashboard data for fast initial load
 */
export function extractKPIs(data: DashboardData): KPIData {
  return {
    totalSeats: data.seats?.totalSeats || 0,
    withActivity: data.seats?.withActivity || 0,
    adoptionRate: data.seats?.adoptionRate || 0,
    totalPRs: data.prs.total,
    merged: data.prs.merged,
    mergeRate: data.prs.mergeRate,
    uniqueAgents: data.prs.uniqueAgents,
    withAgent: data.prs.withAgent,
    avgDaysToClose: data.prs.avgDaysToClose,
    lastUpdated: data.lastUpdated
  };
}

/**
 * Check if data has changed significantly (for smart updates)
 */
export function hasSignificantChanges(
  oldData: DashboardData | null, 
  newData: DashboardData
): boolean {
  if (!oldData) return true;

  // Check if PR count changed
  if (oldData.prs.total !== newData.prs.total) return true;
  
  // Check if merge count changed
  if (oldData.prs.merged !== newData.prs.merged) return true;
  
  // Check if seats changed
  if (oldData.seats?.totalSeats !== newData.seats?.totalSeats) return true;
  if (oldData.seats?.withActivity !== newData.seats?.withActivity) return true;

  return false;
}
