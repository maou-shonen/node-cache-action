import * as os from 'node:os'
import type { PackageManager } from './constants.js'
import { hashFile } from './utils.js'

export async function generateCacheKey(
  packageManager: PackageManager,
  lockfile: string,
): Promise<string> {
  const hash = await hashFile(lockfile)
  return `${packageManager}-${os.platform()}-${hash}`
}

export function generateRestoreKeys(packageManager: PackageManager): string[] {
  return [`${packageManager}-${os.platform()}-`]
}
