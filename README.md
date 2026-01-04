# node-cache-action

Zero-config GitHub Action for caching Node.js dependencies.

> [!NOTE]
> **You probably don't need this.** Use [`actions/setup-node`](https://github.com/actions/setup-node) with `cache: 'npm'` instead.
>
> I created this because I use [mise](https://github.com/jdx/mise) extensively and needed a simple way to cache dependencies without coupling it to runtime setup.

## Usage

```yaml
- uses: actions/checkout@v4
- uses: maou-shonen/node-cache-action@v1
- uses: jdx/mise-action@v2
- run: pnpm install
```

## How It Works

Detects package manager from lockfile and caches dependencies:

| Lockfile | Package Manager | Cache Paths |
|----------|-----------------|-------------|
| `bun.lockb` / `bun.lock` | bun | `~/.bun/install/cache`, `node_modules` |
| `pnpm-lock.yaml` | pnpm | `~/.local/share/pnpm/store`, `node_modules` |
| `yarn.lock` | yarn | `~/.cache/yarn`, `.yarn/cache`, `node_modules` |
| `package-lock.json` | npm | `~/.npm`, `node_modules` |

When multiple lockfiles exist, priority: **bun → pnpm → yarn → npm**

Cache key format: `{package-manager}-{os.platform}-{lockfile-hash}`

## Outputs

| Output | Description |
|--------|-------------|
| `cache-hit` | `'true'` if exact cache match found |
| `package-manager` | Detected package manager |
| `lockfile` | Detected lockfile path |
| `cache-paths` | Cache paths (newline-separated) |
| `cache-key` | Generated cache key |
