import type { PackageManager } from './constants.js';
export declare function generateCacheKey(packageManager: PackageManager, lockfile: string): Promise<string>;
export declare function generateRestoreKeys(packageManager: PackageManager): string[];
