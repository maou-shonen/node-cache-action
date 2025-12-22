import type { PackageManager } from './constants.js';
/**
 * Generate cache key from package manager, OS, and lockfile hash
 */
export declare function generateCacheKey(packageManager: PackageManager, lockfile: string): Promise<string>;
/**
 * Generate restore keys for cache fallback
 */
export declare function generateRestoreKeys(packageManager: PackageManager): string[];
