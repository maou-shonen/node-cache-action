import * as core from '@actions/core'
import type { DetectionResult, PackageManager } from './constants.js'
import { LOCKFILE_PATTERNS } from './constants.js'
import { fileExists } from './utils.js'

/**
 * Detect package manager by checking lockfiles in priority order:
 * bun → pnpm → yarn → npm
 */
export async function detectPackageManager(cwd = process.cwd()): Promise<DetectionResult> {
  const foundLockfiles: string[] = []

  // Check all lockfiles
  for (const [_pm, patterns] of Object.entries(LOCKFILE_PATTERNS)) {
    for (const pattern of patterns) {
      const exists = await fileExists(`${cwd}/${pattern}`)
      if (exists) {
        foundLockfiles.push(pattern)
      }
    }
  }

  // No lockfiles found
  if (foundLockfiles.length === 0) {
    core.info('No supported lockfile found. Skipping dependency cache.')
    return {
      found: false,
      packageManager: 'npm',
      lockfile: '',
    }
  }

  // Multiple lockfiles warning
  if (foundLockfiles.length > 1) {
    core.warning(`Multiple lockfiles detected: ${foundLockfiles.join(', ')}`)
    core.warning('Using priority order: bun → pnpm → yarn → npm')
  }

  // Detect in priority order
  const priorityOrder: PackageManager[] = ['bun', 'pnpm', 'yarn', 'npm']

  for (const pm of priorityOrder) {
    const patterns = LOCKFILE_PATTERNS[pm]
    for (const pattern of patterns) {
      if (foundLockfiles.includes(pattern)) {
        core.info(`Detected package manager: ${pm}`)
        core.info(`Using lockfile: ${pattern}`)
        return {
          found: true,
          packageManager: pm,
          lockfile: pattern,
          lockfiles: foundLockfiles,
        }
      }
    }
  }

  // Fallback (should never reach here)
  return {
    found: false,
    packageManager: 'npm',
    lockfile: '',
  }
}
