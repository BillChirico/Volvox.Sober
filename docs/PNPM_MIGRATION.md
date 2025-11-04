# pnpm Migration Guide

This project has been updated to use pnpm instead of npm for package management.

## Why pnpm?

- **Faster**: Uses hard links and symlinks for efficient disk usage
- **Strict**: Better dependency resolution prevents phantom dependencies
- **Efficient**: Shared global store reduces disk space usage
- **Compatible**: Works seamlessly with React Native and Supabase projects

## Installation

### Install pnpm globally

```bash
npm install -g pnpm
```

Or use the standalone script:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Migration Steps

If you have an existing project with npm:

1. **Remove old lockfile**:
   ```bash
   rm package-lock.json
   ```

2. **Install dependencies with pnpm**:
   ```bash
   pnpm install
   ```

3. **Verify installation**:
   ```bash
   pnpm test
   pnpm lint
   ```

## Command Equivalents

| npm | pnpm |
|-----|------|
| `npm install` | `pnpm install` |
| `npm install <pkg>` | `pnpm add <pkg>` |
| `npm install -D <pkg>` | `pnpm add -D <pkg>` |
| `npm install -g <pkg>` | `pnpm add -g <pkg>` |
| `npm uninstall <pkg>` | `pnpm remove <pkg>` |
| `npm run <script>` | `pnpm <script>` (or `pnpm run <script>`) |
| `npm test` | `pnpm test` |
| `npx <command>` | `pnpm dlx <command>` |

## Key Differences

### Scripts

pnpm allows you to omit `run` for scripts:

```bash
# Both work
pnpm test
pnpm run test

# But shorter is preferred
pnpm lint
pnpm start
```

### Global packages

```bash
# Install global package
pnpm add -g supabase

# Run package without installing
pnpm dlx create-react-app my-app
```

### Workspace support

pnpm has excellent monorepo support through workspaces (configured in `.npmrc`).

## Configuration

The `.npmrc` file contains pnpm configuration:

```ini
# React Native compatibility settings
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=true
node-linker=hoisted
```

These settings ensure compatibility with React Native's Metro bundler.

## Troubleshooting

### Issue: Module not found errors

**Solution**:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Peer dependency warnings

These are usually safe to ignore with React Native projects. Our `.npmrc` is configured to handle them automatically.

### Issue: Cache corruption

**Solution**:
```bash
pnpm store prune
pnpm install
```

## CI/CD Updates

If using GitHub Actions or other CI platforms, update your workflow files:

```yaml
# Before
- run: npm ci
- run: npm test

# After
- uses: pnpm/action-setup@v2
  with:
    version: 8
- run: pnpm install --frozen-lockfile
- run: pnpm test
```

## Resources

- [pnpm Documentation](https://pnpm.io/)
- [pnpm CLI Reference](https://pnpm.io/cli/add)
- [Migrating from npm](https://pnpm.io/motivation)
