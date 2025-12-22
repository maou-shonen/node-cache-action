import type { CachePathsResult, PackageManager } from './constants.js';
/**
 * Get cache paths for a package manager
 * Attempts dynamic detection first, falls back to defaults
 */
export declare function getCachePaths(packageManager: PackageManager): Promise<CachePathsResult>;
