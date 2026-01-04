import * as core from '@actions/core'
import * as exec from '@actions/exec'
import type { CachePathsResult, PackageManager } from './constants.js'
import { DEFAULT_CACHE_PATHS } from './constants.js'

export async function getCachePaths(packageManager: PackageManager): Promise<CachePathsResult> {
  const dynamicPath = await getDynamicCachePath(packageManager)
  if (dynamicPath) {
    const paths = buildCachePaths(packageManager, dynamicPath)
    core.info(`Using dynamic cache paths for ${packageManager}`)
    return { paths, source: 'dynamic' }
  }

  core.info(`Using fallback cache paths for ${packageManager}`)
  return { paths: DEFAULT_CACHE_PATHS[packageManager], source: 'fallback' }
}

function buildCachePaths(packageManager: PackageManager, cachePath: string): string[] {
  if (packageManager === 'yarn') {
    return [cachePath, '.yarn/cache', 'node_modules']
  }
  return [cachePath, 'node_modules']
}

async function getDynamicCachePath(packageManager: PackageManager): Promise<string> {
  const commands: Record<PackageManager, [string, string[]]> = {
    npm: ['npm', ['config', 'get', 'cache']],
    pnpm: ['pnpm', ['store', 'path']],
    yarn: ['yarn', ['cache', 'dir']],
    bun: ['bun', ['pm', 'cache']],
  }

  const [command, args] = commands[packageManager]
  return execCommand(command, args)
}

async function execCommand(command: string, args: string[]): Promise<string> {
  let stdout = ''
  let stderr = ''

  try {
    const exitCode = await exec.exec(command, args, {
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
    })

    if (exitCode !== 0) {
      core.debug(`Command failed: ${command} ${args.join(' ')}`)
      core.debug(`stderr: ${stderr}`)
      return ''
    }

    return stdout.trim()
  } catch {
    core.debug(`Command not found or failed to execute: ${command}`)
    return ''
  }
}
