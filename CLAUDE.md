---
description: Development guidelines for the Pixel Puppy JavaScript library
globs: '*.ts, *.tsx, *.js, *.jsx, package.json'
alwaysApply: false
---

# Pixel Puppy JavaScript Library - AI Agent Guide

This is a TypeScript library package that provides URL building utilities for
the Pixel Puppy image transformation service.

## Development Tools

Default to using Bun instead of Node.js for all development tasks:

- Use `bun install` instead of `npm install`, `yarn install`, or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>`, `yarn run <script>`, or
  `pnpm run <script>`
- Use `bun test` instead of `jest`, `vitest`, or other test runners
- Bun automatically loads .env files, so don't use dotenv

## Testing

Use `bun test` to run tests with Bun's built-in test runner:

```ts
import { test, expect } from 'bun:test'

test('buildImageUrl creates correct URL', () => {
  const url = buildImageUrl('project', 'https://example.com/image.jpg')
  expect(url).toContain('format=webp')
})
```

Run tests with coverage:

```bash
bun run test:coverage
```

## Building

This is a library package that builds to both CommonJS and ESM formats using
Rolldown:

```bash
bun run build
```

The build process:

1. Bundles code with Rolldown → `dist/index.cjs` and `dist/index.mjs`
2. Generates TypeScript declarations with `tsc` → `dist/index.d.ts`

Build configuration:

- `rolldown.config.ts` - Bundler configuration
- `tsconfig.build.json` - TypeScript declaration configuration

## Publishing

The package automatically builds before publishing via the `prepublishOnly`
hook. To publish:

```bash
bun publish
```

This will automatically run `bun run build` first.

## Library Architecture

This is a simple utility library with a single main export:

- `src/index.ts` - Main entry point (re-exports)
- `src/urls.ts` - Core `buildImageUrl()` function
- `src/urls.test.ts` - Tests

The library has minimal dependencies:

- Runtime: `tiny-invariant` for assertions
- Build: `rolldown` for bundling
- Dev: `prettier` for formatting

## Package Configuration

The package.json uses modern package exports:

```json
{
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

This ensures compatibility with both ESM and CommonJS consumers.

## Code Style

- Use Prettier for formatting: `bun run format`
- Write JSDoc comments for public APIs
- Include @example tags in JSDoc
- Use TypeScript strict mode
- Keep functions small and focused

## Common Tasks

**Add a new utility function:**

1. Add function to `src/urls.ts` (or create new file)
2. Export from `src/index.ts`
3. Add tests in corresponding `.test.ts` file
4. Add JSDoc with examples
5. Run `bun test` and `bun run build` to verify

**Update dependencies:**

```bash
bun install <package>
```

**Run specific test file:**

```bash
bun test src/urls.test.ts
```

For more details, see CONTRIBUTING.md.
