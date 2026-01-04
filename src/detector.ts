import * as core from '@actions/core'
import type { DetectionResult } from './constants.js'
import { LOCKFILE_PATTERNS, PACKAGE_MANAGER_PRIORITY } from './constants.js'
import { fileExists } from './utils.js'

export async function detectPackageManager(cwd = process.cwd()): Promise<DetectionResult> {
  const foundLockfiles: string[] = []

  for (const pm of PACKAGE_MANAGER_PRIORITY) {
    for (const pattern of LOCKFILE_PATTERNS[pm]) {
      if (await fileExists(`${cwd}/${pattern}`)) {
        foundLockfiles.push(pattern)
      }
    }
  }

  if (foundLockfiles.length === 0) {
    core.info('No supported lockfile found. Skipping dependency cache.')
    return { found: false }
  }

  if (foundLockfiles.length > 1) {
    core.warning(`Multiple lockfiles detected: ${foundLockfiles.join(', ')}`)
    core.warning('Using priority order: bun → pnpm → yarn → npm')
  }

  for (const pm of PACKAGE_MANAGER_PRIORITY) {
    for (const pattern of LOCKFILE_PATTERNS[pm]) {
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

  return { found: false }
}
