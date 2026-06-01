import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSaveCache = vi.fn()
vi.mock('@actions/cache', () => ({
  saveCache: mockSaveCache,
}))

const mockInfo = vi.fn()
const mockWarning = vi.fn()
const mockGetState = vi.fn()
vi.mock('@actions/core', () => ({
  info: mockInfo,
  warning: mockWarning,
  getState: mockGetState,
}))

describe('cache-save', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  function setupState(overrides: Record<string, string> = {}) {
    const state: Record<string, string> = {
      'package-manager': 'pnpm',
      'cache-key': 'pnpm-linux-x64-abc123',
      'cache-paths': '/home/user/.local/share/pnpm/store\nnode_modules',
      'cache-hit': '',
      ...overrides,
    }
    mockGetState.mockImplementation((key: string) => state[key] ?? '')
  }

  async function runCacheSave() {
    await import('../src/cache-save.js')
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  it('should skip when no state is found', async () => {
    setupState({
      'package-manager': '',
      'cache-key': '',
      'cache-paths': '',
    })

    await runCacheSave()

    expect(mockSaveCache).not.toHaveBeenCalled()
    expect(mockInfo).toHaveBeenCalledWith('No cache state found, skipping cache save')
  })

  it('should skip when cache-key is missing', async () => {
    setupState({ 'cache-key': '' })

    await runCacheSave()

    expect(mockSaveCache).not.toHaveBeenCalled()
  })

  it('should skip when cache hit occurred', async () => {
    setupState({ 'cache-hit': 'true' })

    await runCacheSave()

    expect(mockSaveCache).not.toHaveBeenCalled()
    expect(mockInfo).toHaveBeenCalledWith('Cache hit occurred, skipping cache save')
  })

  it('should save cache on miss', async () => {
    setupState()
    mockSaveCache.mockResolvedValue(42)

    await runCacheSave()

    expect(mockSaveCache).toHaveBeenCalledWith(
      ['/home/user/.local/share/pnpm/store', 'node_modules'],
      'pnpm-linux-x64-abc123',
    )
    expect(mockInfo).toHaveBeenCalledWith('Cache saved successfully with ID: 42')
  })

  it('should save cache on partial hit', async () => {
    setupState({ 'cache-hit': '' })
    mockSaveCache.mockResolvedValue(99)

    await runCacheSave()

    expect(mockSaveCache).toHaveBeenCalled()
  })

  it('should handle cache already exists', async () => {
    setupState()
    mockSaveCache.mockResolvedValue(-1)

    await runCacheSave()

    expect(mockInfo).toHaveBeenCalledWith('Cache not saved (may already exist)')
  })

  it('should warn on save failure instead of failing', async () => {
    setupState()
    mockSaveCache.mockRejectedValue(new Error('save failed'))

    await runCacheSave()

    expect(mockWarning).toHaveBeenCalledWith('Failed to save cache: save failed')
  })

  it('should filter empty lines from cache paths', async () => {
    setupState({
      'cache-paths': '/home/user/.npm\n\nnode_modules\n',
    })
    mockSaveCache.mockResolvedValue(1)

    await runCacheSave()

    expect(mockSaveCache).toHaveBeenCalledWith(
      ['/home/user/.npm', 'node_modules'],
      'pnpm-linux-x64-abc123',
    )
  })
})
