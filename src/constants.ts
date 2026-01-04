export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

export type DetectionResult =
  | { found: false }
  | { found: true; packageManager: PackageManager; lockfile: string; lockfiles: string[] }

export interface CachePathsResult {
  paths: string[]
  source: 'dynamic' | 'fallback'
}

export const PACKAGE_MANAGER_PRIORITY: PackageManager[] = ['bun', 'pnpm', 'yarn', 'npm']

export const LOCKFILE_PATTERNS: Record<PackageManager, string[]> = {
  bun: ['bun.lockb', 'bun.lock'],
  pnpm: ['pnpm-lock.yaml'],
  yarn: ['yarn.lock'],
  npm: ['package-lock.json'],
}

export const DEFAULT_CACHE_PATHS: Record<PackageManager, string[]> = {
  bun: ['~/.bun/install/cache', 'node_modules'],
  pnpm: ['~/.local/share/pnpm/store', 'node_modules'],
  yarn: ['~/.cache/yarn', '.yarn/cache', 'node_modules'],
  npm: ['~/.npm', 'node_modules'],
}

export const STATE_KEYS = {
  PACKAGE_MANAGER: 'package-manager',
  LOCKFILE: 'lockfile',
  CACHE_PATHS: 'cache-paths',
  CACHE_KEY: 'cache-key',
  CACHE_HIT: 'cache-hit',
} as const

export const OUTPUT_KEYS = {
  CACHE_HIT: 'cache-hit',
  PACKAGE_MANAGER: 'package-manager',
  LOCKFILE: 'lockfile',
  CACHE_PATHS: 'cache-paths',
  CACHE_KEY: 'cache-key',
} as const
