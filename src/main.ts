import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { generateCacheKey, generateRestoreKeys } from './cache-key.js'
import { getCachePaths } from './cache-paths.js'
import { OUTPUT_KEYS, STATE_KEYS } from './constants.js'
import { detectPackageManager } from './detector.js'
import { expandPaths } from './utils.js'

async function run(): Promise<void> {
  try {
    // Detect package manager
    const detection = await detectPackageManager()

    if (!detection.found) {
      core.info('No lockfile detected, skipping cache')
      return
    }

    const { packageManager, lockfile } = detection

    // Get cache paths
    const { paths } = await getCachePaths(packageManager)
    const expandedPaths = expandPaths(paths)

    // Generate cache key
    const cacheKey = await generateCacheKey(packageManager, lockfile)
    const restoreKeys = generateRestoreKeys(packageManager)

    core.info(`Cache key: ${cacheKey}`)
    core.info(`Cache paths:\n  ${expandedPaths.join('\n  ')}`)

    // Save state for post action
    core.saveState(STATE_KEYS.PACKAGE_MANAGER, packageManager)
    core.saveState(STATE_KEYS.LOCKFILE, lockfile)
    core.saveState(STATE_KEYS.CACHE_PATHS, expandedPaths.join('\n'))
    core.saveState(STATE_KEYS.CACHE_KEY, cacheKey)

    // Set outputs
    core.setOutput(OUTPUT_KEYS.PACKAGE_MANAGER, packageManager)
    core.setOutput(OUTPUT_KEYS.LOCKFILE, lockfile)
    core.setOutput(OUTPUT_KEYS.CACHE_PATHS, expandedPaths.join('\n'))
    core.setOutput(OUTPUT_KEYS.CACHE_KEY, cacheKey)

    // Restore cache
    const restoredKey = await cache.restoreCache(expandedPaths, cacheKey, restoreKeys)

    if (restoredKey) {
      core.info(`Cache restored from key: ${restoredKey}`)
      const isExactMatch = restoredKey === cacheKey
      core.setOutput(OUTPUT_KEYS.CACHE_HIT, isExactMatch.toString())
      // Save cache-hit state for post action (only if exact match)
      if (isExactMatch) {
        core.saveState(STATE_KEYS.CACHE_HIT, 'true')
        core.info('Cache hit! Exact match found.')
      } else {
        core.info('Cache partial hit! Using restored cache as base.')
      }
    } else {
      core.info('Cache miss! No cache restored.')
      core.setOutput(OUTPUT_KEYS.CACHE_HIT, 'false')
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
  }
}

run()
