import { describe, expect, it, vi } from 'vitest'
import { getCachePaths } from '../src/cache-paths.js'
import type { PackageManager } from '../src/constants.js'

// Mock exec module
vi.mock('@actions/exec', () => ({
  exec: vi.fn(),
}))

describe('getCachePaths', () => {
  it('should return fallback paths for npm', async () => {
    const result = await getCachePaths('npm')

    expect(result.paths).toContain('~/.npm')
    expect(result.paths).toContain('node_modules')
  })

  it('should return fallback paths for pnpm', async () => {
    const result = await getCachePaths('pnpm')

    expect(result.paths).toContain('~/.local/share/pnpm/store')
    expect(result.paths).toContain('node_modules')
  })

  it('should return fallback paths for yarn', async () => {
    const result = await getCachePaths('yarn')

    expect(result.paths).toContain('~/.cache/yarn')
    expect(result.paths).toContain('.yarn/cache')
    expect(result.paths).toContain('node_modules')
  })

  it('should return fallback paths for bun', async () => {
    const result = await getCachePaths('bun')

    expect(result.paths).toContain('~/.bun/install/cache')
    expect(result.paths).toContain('node_modules')
  })

  it('should always include node_modules', async () => {
    const packageManagers: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun']

    for (const pm of packageManagers) {
      const result = await getCachePaths(pm)
      expect(result.paths).toContain('node_modules')
    }
  })

  it('should return non-empty paths array', async () => {
    const result = await getCachePaths('npm')

    expect(result.paths).toBeDefined()
    expect(result.paths.length).toBeGreaterThan(0)
  })
})
