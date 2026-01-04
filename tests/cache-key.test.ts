import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateCacheKey, generateRestoreKeys } from '../src/cache-key.js'

describe('cache-key', () => {
  let tempDir: string
  let testLockfile: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
    testLockfile = path.join(tempDir, 'package-lock.json')
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('generateCacheKey', () => {
    it('should generate consistent key for same lockfile content', async () => {
      const content = '{"dependencies": {}}'
      await fs.writeFile(testLockfile, content)

      const key1 = await generateCacheKey('npm', testLockfile)
      const key2 = await generateCacheKey('npm', testLockfile)

      expect(key1).toBe(key2)
    })

    it('should include package manager in key', async () => {
      await fs.writeFile(testLockfile, '{}')

      const key = await generateCacheKey('npm', testLockfile)

      expect(key).toMatch(/^npm-/)
    })

    it('should include platform in key', async () => {
      await fs.writeFile(testLockfile, '{}')

      const key = await generateCacheKey('npm', testLockfile)
      const platform = os.platform()

      expect(key).toContain(platform)
    })

    it('should generate different keys for different lockfile content', async () => {
      await fs.writeFile(testLockfile, 'content1')
      const key1 = await generateCacheKey('npm', testLockfile)

      await fs.writeFile(testLockfile, 'content2')
      const key2 = await generateCacheKey('npm', testLockfile)

      expect(key1).not.toBe(key2)
    })

    it('should generate different keys for different package managers', async () => {
      await fs.writeFile(testLockfile, '{}')

      const npmKey = await generateCacheKey('npm', testLockfile)
      const pnpmKey = await generateCacheKey('pnpm', testLockfile)

      expect(npmKey).not.toBe(pnpmKey)
    })

    it('should follow format: packageManager-platform-hash', async () => {
      await fs.writeFile(testLockfile, '{}')

      const key = await generateCacheKey('npm', testLockfile)
      const parts = key.split('-')

      expect(parts.length).toBeGreaterThanOrEqual(3)
      expect(parts[0]).toBe('npm')
      expect(parts[1]).toBe(os.platform())
      expect(parts[2]).toHaveLength(64) // SHA-256 hash
    })
  })

  describe('generateRestoreKeys', () => {
    it('should generate restore key with package manager and platform', () => {
      const keys = generateRestoreKeys('npm')
      const platform = os.platform()

      expect(keys).toHaveLength(1)
      expect(keys[0]).toBe(`npm-${platform}-`)
    })

    it('should generate different restore keys for different package managers', () => {
      const npmKeys = generateRestoreKeys('npm')
      const pnpmKeys = generateRestoreKeys('pnpm')

      expect(npmKeys[0]).not.toBe(pnpmKeys[0])
    })

    it('should end with dash for prefix matching', () => {
      const keys = generateRestoreKeys('npm')

      expect(keys[0]).toMatch(/-$/)
    })
  })
})
