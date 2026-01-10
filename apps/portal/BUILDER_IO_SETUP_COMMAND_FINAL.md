# Builder.io Setup Command - Final Working Version

## Problem Analysis

- Builder.io root directory: `apps/portal`
- Repository root: Two levels up (`../../`)
- Issue: `cd ../..` goes to `/root` instead of repository root
- `apps/portal` has workspace dependencies that need repo root install

## Solution: Use Absolute Path or Find Root

Since `cd ../..` doesn't work reliably in Builder.io, use one of these:

### Option 1: Find Git Root (Recommended)

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm install
```

This finds the git repository root automatically.

### Option 2: Use npm (Simpler, Builder.io Suggested)

```bash
npm install
```

This works from `apps/portal` but may not resolve workspace packages correctly.

### Option 3: Navigate with Error Handling

```bash
cd ../.. && test -f package.json && pnpm install || (cd ../../ && pnpm install)
```

### Option 4: Install pnpm First, Then Use It

```bash
npm install -g pnpm@10.6.1 && cd "$(git rev-parse --show-toplevel 2>/dev/null || echo ../..)" && pnpm install
```

## Recommended Setup Command

**Try this first:**

```bash
cd "$(git rev-parse --show-toplevel)" && pnpm install
```

**If git is not available, try:**

```bash
npm install -g pnpm@10.6.1 && cd ../../ && pnpm install
```

**If that fails, use npm:**

```bash
npm install
```

## Why This Works

- `git rev-parse --show-toplevel` finds the actual repository root
- Works regardless of where Builder.io starts
- More reliable than `cd ../..`
- Then `pnpm install` runs from correct location

## Testing Locally

To test if this works:

```bash
cd apps/portal
cd "$(git rev-parse --show-toplevel)" && pnpm install
```

This should install all workspace dependencies correctly.

## Alternative: Standalone Install

If Builder.io can't access repo root, you might need to:

1. **Change Builder.io root directory** to repository root (not `apps/portal`)
2. Then setup command: `pnpm install`
3. Then dev command: `cd apps/portal && pnpm dev`

## Final Recommendation

**Setup Command:**
```bash
cd "$(git rev-parse --show-toplevel)" && pnpm install
```

**If git not available:**
```bash
npm install -g pnpm@10.6.1 && cd ../../ && pnpm install
```

**Fallback:**
```bash
npm install
```

