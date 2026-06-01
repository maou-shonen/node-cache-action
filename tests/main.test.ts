import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockRestoreCache,
  mockInfo,
  mockDebug,
  mockSetFailed,
  mockSetOutput,
  mockSaveState,
  mockGetInput,
  mockDetectPackageManager,
  mockGetCachePaths,
  mockGenerateCacheKey,
  mockGenerateRestoreKeys,
  mockExpandPaths,
} = vi.hoisted(() => ({
  mockRestoreCache: vi.fn(),
  mockInfo: vi.fn(),
  mockDebug: vi.fn(),
  mockSetFailed: vi.fn(),
  mockSetOutput: vi.fn(),
  mockSaveState: vi.fn(),
  mockGetInput: vi.fn(),
  mockDetectPackageManager: vi.fn(),
  mockGetCachePaths: vi.fn(),
  mockGenerateCacheKey: vi.fn(),
  mockGenerateRestoreKeys: vi.fn(),
  mockExpandPaths: vi.fn(),
}))

vi.mock('@actions/cache', () => ({
  restoreCache: mockRestoreCache,
}))

vi.mock('@actions/core', () => ({
  info: mockInfo,
  debug: mockDebug,
  setFailed: mockSetFailed,
  setOutput: mockSetOutput,
  saveState: mockSaveState,
  getInput: mockGetInput,
}))

vi.mock('../src/detector.js', () => ({
  detectPackageManager: mockDetectPackageManager,
}))

vi.mock('../src/cache-paths.js', () => ({
  getCachePaths: mockGetCachePaths,
}))

vi.mock('../src/cache-key.js', () => ({
  generateCacheKey: mockGenerateCacheKey,
  generateRestoreKeys: mockGenerateRestoreKeys,
}))

vi.mock('../src/utils.js', () => ({
  expandPaths: mockExpandPaths,
}))

describe('main', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  async function runMain() {
    await import('../src/main.js')
    // Allow the top-level run() to execute
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  it('should skip when no lockfile is detected', async () => {
    mockDetectPackageManager.mockResolvedValue({ found: false })

    await runMain()

    expect(mockDetectPackageManager).toHaveBeenCalled()
    expect(mockRestoreCache).not.toHaveBeenCalled()
    expect(mockSetFailed).not.toHaveBeenCalled()
  })

  it('should restore cache and set outputs on cache hit', async () => {
    const cacheKey = 'pnpm-linux-x64-abc123'
    const expandedPaths = ['/home/user/.local/share/pnpm/store', 'node_modules']
    const restoreKeys = ['pnpm-linux-x64-']

    mockGetInput.mockReturnValue('.')
    mockDetectPackageManager.mockResolvedValue({
      found: true,
      packageManager: 'pnpm',
      lockfile: 'pnpm-lock.yaml',
      lockfiles: ['pnpm-lock.yaml'],
    })
    mockGetCachePaths.mockResolvedValue({
      paths: ['~/.local/share/pnpm/store', 'node_modules'],
    })
    mockExpandPaths.mockReturnValue(expandedPaths)
    mockGenerateCacheKey.mockResolvedValue(cacheKey)
    mockGenerateRestoreKeys.mockReturnValue(restoreKeys)
    mockRestoreCache.mockResolvedValue(cacheKey) // exact match

    await runMain()

    // Verify restoreCache contract: called with expanded paths, key, and restore keys
    expect(mockRestoreCache).toHaveBeenCalledWith(expandedPaths, cacheKey, restoreKeys)

    // Verify state is saved (including cache-paths for post step)
    expect(mockSaveState).toHaveBeenCalledWith('package-manager', 'pnpm')
    expect(mockSaveState).toHaveBeenCalledWith('lockfile', 'pnpm-lock.yaml')
    expect(mockSaveState).toHaveBeenCalledWith(
      'cache-paths',
      '/home/user/.local/share/pnpm/store\nnode_modules',
    )
    expect(mockSaveState).toHaveBeenCalledWith('cache-key', cacheKey)
    expect(mockSaveState).toHaveBeenCalledWith('cache-hit', 'true')

    // Verify outputs are set (including cache-paths)
    expect(mockSetOutput).toHaveBeenCalledWith('package-manager', 'pnpm')
    expect(mockSetOutput).toHaveBeenCalledWith('lockfile', 'pnpm-lock.yaml')
    expect(mockSetOutput).toHaveBeenCalledWith(
      'cache-paths',
      '/home/user/.local/share/pnpm/store\nnode_modules',
    )
    expect(mockSetOutput).toHaveBeenCalledWith('cache-hit', 'true')
    expect(mockSetOutput).toHaveBeenCalledWith('cache-key', cacheKey)

    expect(mockSetFailed).not.toHaveBeenCalled()
  })

  it('should handle partial cache hit', async () => {
    const cacheKey = 'npm-linux-x64-abc123'
    const restoredKey = 'npm-linux-x64-old456'

    mockDetectPackageManager.mockResolvedValue({
      found: true,
      packageManager: 'npm',
      lockfile: 'package-lock.json',
      lockfiles: ['package-lock.json'],
    })
    mockGetCachePaths.mockResolvedValue({ paths: ['~/.npm', 'node_modules'] })
    mockExpandPaths.mockReturnValue(['/home/user/.npm', 'node_modules'])
    mockGenerateCacheKey.mockResolvedValue(cacheKey)
    mockGenerateRestoreKeys.mockReturnValue(['npm-linux-x64-'])
    mockRestoreCache.mockResolvedValue(restoredKey) // partial match

    await runMain()

    expect(mockSetOutput).toHaveBeenCalledWith('cache-hit', 'false')
    // cache-hit state should NOT be saved for partial hit
    expect(mockSaveState).not.toHaveBeenCalledWith('cache-hit', 'true')
    expect(mockSetFailed).not.toHaveBeenCalled()
  })

  it('should handle cache miss', async () => {
    mockDetectPackageManager.mockResolvedValue({
      found: true,
      packageManager: 'bun',
      lockfile: 'bun.lock',
      lockfiles: ['bun.lock'],
    })
    mockGetCachePaths.mockResolvedValue({
      paths: ['~/.bun/install/cache', 'node_modules'],
    })
    mockExpandPaths.mockReturnValue(['/home/user/.bun/install/cache', 'node_modules'])
    mockGenerateCacheKey.mockResolvedValue('bun-linux-x64-abc123')
    mockGenerateRestoreKeys.mockReturnValue(['bun-linux-x64-'])
    mockRestoreCache.mockResolvedValue(undefined) // miss

    await runMain()

    expect(mockSetOutput).toHaveBeenCalledWith('cache-hit', 'false')
    expect(mockSetFailed).not.toHaveBeenCalled()
  })

  it('should call setFailed on error', async () => {
    mockDetectPackageManager.mockRejectedValue(new Error('test error'))

    await runMain()

    expect(mockSetFailed).toHaveBeenCalledWith('test error')
  })
})
