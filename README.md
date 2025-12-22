# node-cache-action

Zero-config GitHub Action for caching Node.js dependencies.

> [!NOTE]
> **You probably don't need this.** Use `actions/setup-node` with `cache: 'npm'` instead.
>
> I created this because I use [mise](https://github.com/jdx/mise) extensively and needed a simple way to cache dependencies without coupling it to runtime setup. If you're in the same boat, this might be useful.

## Usage

```yaml
- uses: actions/checkout@v6
- uses: maou-shonen/node-cache-action@v1
- uses: jdx/mise-action@v3
- run: mise run ...
```

## How It Works

Auto-detects package manager from lockfile and caches dependencies:

| Lockfile | Package Manager | Cached Directories (Linux/macOS) |
|----------|----------------|----------------------------------|
| `bun.lockb` / `bun.lock` | Bun | `~/.bun/install/cache`, `node_modules` |
| `pnpm-lock.yaml` | pnpm | `~/.local/share/pnpm/store`, `node_modules` |
| `yarn.lock` | Yarn | `~/.cache/yarn`, `.yarn/cache`, `node_modules` |
| `package-lock.json` | npm | `~/.npm`, `node_modules` |

Cache key: `{pm}-{runner.os}-{lockfile-hash}`

**Note**: Cache paths are defaults for Linux/macOS. If you've customized cache locations via config files or environment variables, you may need to use `actions/cache` directly with your custom paths.

## Outputs

- `cache-hit`: `true` if cache was found

```yaml
- uses: maou-shonen/node-cache-action@v1
  id: cache
- run: echo "${{ steps.cache.outputs.cache-hit }}"
```
