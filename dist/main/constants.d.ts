export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export interface LockfileInfo {
    packageManager: PackageManager;
    lockfile: string;
}
export interface DetectionResult extends LockfileInfo {
    found: boolean;
    lockfiles?: string[];
}
export interface CachePathsResult {
    paths: string[];
    source: 'dynamic' | 'fallback';
}
export declare const LOCKFILE_PATTERNS: Record<PackageManager, string[]>;
export declare const DEFAULT_CACHE_PATHS: Record<PackageManager, string[]>;
export declare const STATE_KEYS: {
    readonly PACKAGE_MANAGER: "package-manager";
    readonly LOCKFILE: "lockfile";
    readonly CACHE_PATHS: "cache-paths";
    readonly CACHE_KEY: "cache-key";
};
export declare const OUTPUT_KEYS: {
    readonly CACHE_HIT: "cache-hit";
    readonly PACKAGE_MANAGER: "package-manager";
    readonly LOCKFILE: "lockfile";
    readonly CACHE_PATHS: "cache-paths";
    readonly CACHE_KEY: "cache-key";
};
