import * as fs from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { expandPaths, expandTilde, fileExists, hashFile } from '../src/utils.js'

describe('utils', () => {
  describe('fileExists', () => {
    let tempDir: string
    let testFile: string

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
      testFile = path.join(tempDir, 'exists.txt')
      await fs.writeFile(testFile, 'test')
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    it('should return true for existing file', async () => {
      const result = await fileExists(testFile)
      expect(result).toBe(true)
    })

    it('should return false for non-existing file', async () => {
      const result = await fileExists('/non/existent/file.txt')
      expect(result).toBe(false)
    })
  })

  describe('hashFile', () => {
    let tempDir: string
    let testFile: string

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-'))
      testFile = path.join(tempDir, 'test.txt')
    })

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true })
    })

    it('should generate consistent hash for same content', async () => {
      const content = 'test content'
      await fs.writeFile(testFile, content)

      const hash1 = await hashFile(testFile)
      const hash2 = await hashFile(testFile)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA-256 produces 64 hex characters
    })

    it('should generate different hashes for different content', async () => {
      await fs.writeFile(testFile, 'content1')
      const hash1 = await hashFile(testFile)

      await fs.writeFile(testFile, 'content2')
      const hash2 = await hashFile(testFile)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('expandTilde', () => {
    it('should expand ~ at the beginning of path', () => {
      const result = expandTilde('~/test/path')
      expect(result).toBe(path.join(os.homedir(), 'test/path'))
    })

    it('should expand standalone ~', () => {
      const result = expandTilde('~')
      expect(result).toBe(os.homedir())
    })

    it('should not modify paths without ~', () => {
      const testPath = '/absolute/path'
      const result = expandTilde(testPath)
      expect(result).toBe(testPath)
    })

    it('should not expand ~ in the middle of path', () => {
      const testPath = '/path/~test'
      const result = expandTilde(testPath)
      expect(result).toBe(testPath)
    })
  })

  describe('expandPaths', () => {
    it('should expand all paths with ~', () => {
      const paths = ['~/path1', '~/path2', '/absolute/path']
      const result = expandPaths(paths)

      expect(result).toEqual([
        path.join(os.homedir(), 'path1'),
        path.join(os.homedir(), 'path2'),
        '/absolute/path',
      ])
    })

    it('should handle empty array', () => {
      const result = expandPaths([])
      expect(result).toEqual([])
    })
  })
})
