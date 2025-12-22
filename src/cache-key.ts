import * as os from 'node:os'
import type { PackageManager } from './constants.js'
import { hashFile } from './utils.js'

/**
 * Generate cache key from package manager, OS, and lockfile hash
 */
export async function generateCacheKey(
  packageManager: PackageManager,
  lockfile: string
): Promise<string> {
  const hash = await hashFile(lockfile)
  const platform = os.platform()
  return `${packageManager}-${platform}-${hash}`
}

/**
 * Generate restore keys for cache fallback
 */
export function generateRestoreKeys(packageManager: PackageManager): string[] {
  const platform = os.platform()
  return [`${packageManager}-${platform}-`]
}
