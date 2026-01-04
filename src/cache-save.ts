import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { STATE_KEYS } from './constants.js'

async function run(): Promise<void> {
  try {
    const packageManager = core.getState(STATE_KEYS.PACKAGE_MANAGER)
    const cacheKey = core.getState(STATE_KEYS.CACHE_KEY)
    const cachePathsStr = core.getState(STATE_KEYS.CACHE_PATHS)

    if (!packageManager || !cacheKey || !cachePathsStr) {
      core.info('No cache state found, skipping cache save')
      return
    }

    const cachePaths = cachePathsStr.split('\n').filter((p) => p.trim() !== '')

    if (core.getState(STATE_KEYS.CACHE_HIT) === 'true') {
      core.info('Cache hit occurred, skipping cache save')
      return
    }

    core.info(`Saving cache with key: ${cacheKey}`)
    core.info(`Cache paths:\n  ${cachePaths.join('\n  ')}`)

    const savedCacheId = await cache.saveCache(cachePaths, cacheKey)

    if (savedCacheId !== -1) {
      core.info(`Cache saved successfully with ID: ${savedCacheId}`)
    } else {
      core.info('Cache not saved (may already exist)')
    }
  } catch (error) {
    core.warning(`Failed to save cache: ${error instanceof Error ? error.message : String(error)}`)
  }
}

run()
