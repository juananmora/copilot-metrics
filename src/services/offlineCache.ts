/**
 * Offline Cache Service
 * Stores dashboard data in localStorage for offline access
 */

import { DashboardData } from '../types';

const CACHE_KEY = 'copilot_metrics_cache';
const CACHE_TIMESTAMP_KEY = 'copilot_metrics_cache_timestamp';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedData {
  data: DashboardData;
  timestamp: number;
  isStale: boolean;
}

/**
 * Save dashboard data to cache
 */
export function saveToCache(data: DashboardData): void {
  try {
    const dataToCache = {
      ...data,
      // Mark as cached data
      dataSource: `${data.dataSource} (cached)`,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    console.log('[OfflineCache] Data saved to cache');
  } catch (error) {
    console.error('[OfflineCache] Failed to save to cache:', error);
    // If localStorage is full, try to clear old data
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get cached dashboard data
 */
export function getFromCache(): CachedData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestampStr = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestampStr) {
      return null;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const age = Date.now() - timestamp;
    const isStale = age > CACHE_MAX_AGE;
    
    const data = JSON.parse(cached) as DashboardData;
    
    // Update lastUpdated to show when data was cached
    const cachedDate = new Date(timestamp);
    data.lastUpdated = formatCacheTime(cachedDate);
    
    return {
      data,
      timestamp,
      isStale,
    };
  } catch (error) {
    console.error('[OfflineCache] Failed to read from cache:', error);
    return null;
  }
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    console.log('[OfflineCache] Cache cleared');
  } catch (error) {
    console.error('[OfflineCache] Failed to clear cache:', error);
  }
}

/**
 * Get cache age in human-readable format
 */
export function getCacheAge(): string | null {
  try {
    const timestampStr = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestampStr) return null;
    
    const timestamp = parseInt(timestampStr, 10);
    const age = Date.now() - timestamp;
    
    if (age < 60 * 1000) {
      return 'hace menos de un minuto';
    } else if (age < 60 * 60 * 1000) {
      const minutes = Math.floor(age / (60 * 1000));
      return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (age < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(age / (60 * 60 * 1000));
      return `hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(age / (24 * 60 * 60 * 1000));
      return `hace ${days} día${days !== 1 ? 's' : ''}`;
    }
  } catch {
    return null;
  }
}

/**
 * Check if cache exists
 */
export function hasCache(): boolean {
  return localStorage.getItem(CACHE_KEY) !== null;
}

/**
 * Format cache timestamp for display
 */
function formatCacheTime(date: Date): string {
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
