import * as core from '@actions/core'
import * as exec from '@actions/exec'
import type { CachePathsResult, PackageManager } from './constants.js'
import { DEFAULT_CACHE_PATHS } from './constants.js'

/**
 * Get cache paths for a package manager
 * Attempts dynamic detection first, falls back to defaults
 */
export async function getCachePaths(packageManager: PackageManager): Promise<CachePathsResult> {
  try {
    const dynamicPaths = await getDynamicCachePaths(packageManager)
    if (dynamicPaths.length > 0) {
      core.info(`Using dynamic cache paths for ${packageManager}`)
      return { paths: dynamicPaths, source: 'dynamic' }
    }
  } catch (error) {
    core.debug(
      `Failed to detect dynamic cache paths: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  // Fallback to defaults
  const fallbackPaths = DEFAULT_CACHE_PATHS[packageManager]
  core.info(`Using fallback cache paths for ${packageManager}`)
  return { paths: fallbackPaths, source: 'fallback' }
}

/**
 * Attempt to dynamically detect cache paths
 */
async function getDynamicCachePaths(packageManager: PackageManager): Promise<string[]> {
  const paths: string[] = []

  switch (packageManager) {
    case 'npm': {
      const cachePath = await execCommand('npm', ['config', 'get', 'cache'])
      if (cachePath) {
        paths.push(cachePath, 'node_modules')
      }
      break
    }

    case 'pnpm': {
      const storePath = await execCommand('pnpm', ['store', 'path'])
      if (storePath) {
        paths.push(storePath, 'node_modules')
      }
      break
    }

    case 'yarn': {
      // Yarn 1.x
      const cacheDir = await execCommand('yarn', ['cache', 'dir'])
      if (cacheDir) {
        paths.push(cacheDir, '.yarn/cache', 'node_modules')
      }
      break
    }

    case 'bun': {
      const cacheDir = await execCommand('bun', ['pm', 'cache'])
      if (cacheDir) {
        paths.push(cacheDir, 'node_modules')
      } else {
        // Fallback for older Bun versions
        paths.push('~/.bun/install/cache', 'node_modules')
      }
      break
    }
  }

  return paths
}

/**
 * Execute a command and return stdout trimmed
 */
async function execCommand(command: string, args: string[]): Promise<string> {
  let stdout = ''
  let stderr = ''

  const options: exec.ExecOptions = {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data: Buffer) => {
        stdout += data.toString()
      },
      stderr: (data: Buffer) => {
        stderr += data.toString()
      },
    },
  }

  const exitCode = await exec.exec(command, args, options)

  if (exitCode !== 0) {
    core.debug(`Command failed: ${command} ${args.join(' ')}`)
    core.debug(`stderr: ${stderr}`)
    return ''
  }

  return stdout.trim()
}
