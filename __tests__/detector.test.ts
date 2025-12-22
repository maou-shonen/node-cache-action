import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { detectPackageManager } from '../src/detector.js'

describe('detectPackageManager', () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('should detect bun with bun.lockb', async () => {
    await fs.writeFile(path.join(tempDir, 'bun.lockb'), '')

    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(true)
    expect(result.packageManager).toBe('bun')
    expect(result.lockfile).toBe('bun.lockb')
  })

  it('should detect bun with bun.lock', async () => {
    await fs.writeFile(path.join(tempDir, 'bun.lock'), '')

    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(true)
    expect(result.packageManager).toBe('bun')
    expect(result.lockfile).toBe('bun.lock')
  })

  it('should detect pnpm', async () => {
    await fs.writeFile(path.join(tempDir, 'pnpm-lock.yaml'), '')

    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(true)
    expect(result.packageManager).toBe('pnpm')
    expect(result.lockfile).toBe('pnpm-lock.yaml')
  })

  it('should detect yarn', async () => {
    await fs.writeFile(path.join(tempDir, 'yarn.lock'), '')

    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(true)
    expect(result.packageManager).toBe('yarn')
    expect(result.lockfile).toBe('yarn.lock')
  })

  it('should detect npm', async () => {
    await fs.writeFile(path.join(tempDir, 'package-lock.json'), '')

    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(true)
    expect(result.packageManager).toBe('npm')
    expect(result.lockfile).toBe('package-lock.json')
  })

  it('should return not found when no lockfile exists', async () => {
    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(false)
  })

  it('should follow priority order: bun > pnpm > yarn > npm', async () => {
    // Create all lockfiles
    await fs.writeFile(path.join(tempDir, 'bun.lockb'), '')
    await fs.writeFile(path.join(tempDir, 'pnpm-lock.yaml'), '')
    await fs.writeFile(path.join(tempDir, 'yarn.lock'), '')
    await fs.writeFile(path.join(tempDir, 'package-lock.json'), '')

    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(true)
    expect(result.packageManager).toBe('bun')
    expect(result.lockfiles).toHaveLength(4)
  })

  it('should prioritize pnpm when bun is not present', async () => {
    await fs.writeFile(path.join(tempDir, 'pnpm-lock.yaml'), '')
    await fs.writeFile(path.join(tempDir, 'yarn.lock'), '')
    await fs.writeFile(path.join(tempDir, 'package-lock.json'), '')

    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(true)
    expect(result.packageManager).toBe('pnpm')
  })

  it('should prioritize yarn when bun and pnpm are not present', async () => {
    await fs.writeFile(path.join(tempDir, 'yarn.lock'), '')
    await fs.writeFile(path.join(tempDir, 'package-lock.json'), '')

    const result = await detectPackageManager(tempDir)

    expect(result.found).toBe(true)
    expect(result.packageManager).toBe('yarn')
  })
})
