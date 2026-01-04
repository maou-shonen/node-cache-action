export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type DetectionResult = {
    found: false;
} | {
    found: true;
    packageManager: PackageManager;
    lockfile: string;
    lockfiles: string[];
};
export interface CachePathsResult {
    paths: string[];
    source: 'dynamic' | 'fallback';
}
export declare const PACKAGE_MANAGER_PRIORITY: PackageManager[];
export declare const LOCKFILE_PATTERNS: Record<PackageManager, string[]>;
export declare const DEFAULT_CACHE_PATHS: Record<PackageManager, string[]>;
export declare const STATE_KEYS: {
    readonly PACKAGE_MANAGER: "package-manager";
    readonly LOCKFILE: "lockfile";
    readonly CACHE_PATHS: "cache-paths";
    readonly CACHE_KEY: "cache-key";
    readonly CACHE_HIT: "cache-hit";
};
export declare const OUTPUT_KEYS: {
    readonly CACHE_HIT: "cache-hit";
    readonly PACKAGE_MANAGER: "package-manager";
    readonly LOCKFILE: "lockfile";
    readonly CACHE_PATHS: "cache-paths";
    readonly CACHE_KEY: "cache-key";
};
