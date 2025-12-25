import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { STATE_KEYS } from './constants.js'

async function run(): Promise<void> {
  try {
    // Get state from main action
    const packageManager = core.getState(STATE_KEYS.PACKAGE_MANAGER)
    const cacheKey = core.getState(STATE_KEYS.CACHE_KEY)
    const cachePathsStr = core.getState(STATE_KEYS.CACHE_PATHS)

    if (!packageManager || !cacheKey || !cachePathsStr) {
      core.info('No cache state found, skipping cache save')
      return
    }

    const cachePaths = cachePathsStr.split('\n').filter((p) => p.trim() !== '')

    // Check if cache was hit (exact match)
    // If it was an exact match, we don't need to save
    const cacheHit = core.getState(STATE_KEYS.CACHE_HIT) === 'true'
    if (cacheHit) {
      core.info('Cache hit occurred, skipping cache save')
      return
    }

    core.info(`Saving cache with key: ${cacheKey}`)
    core.info(`Cache paths:\n  ${cachePaths.join('\n  ')}`)

    // Save cache
    const savedCacheId = await cache.saveCache(cachePaths, cacheKey)

    if (savedCacheId !== -1) {
      core.info(`Cache saved successfully with ID: ${savedCacheId}`)
    } else {
      core.info('Cache not saved (may already exist)')
    }
  } catch (error) {
    // Don't fail the workflow if cache save fails
    if (error instanceof Error) {
      core.warning(`Failed to save cache: ${error.message}`)
    } else {
      core.warning(`Failed to save cache: ${String(error)}`)
    }
  }
}

run()
