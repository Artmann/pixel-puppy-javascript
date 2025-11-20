# Contributing to @pixel-puppy/javascript

Thank you for your interest in contributing to the Pixel Puppy JavaScript
library! This guide will help you get started with development.

## Prerequisites

- [Bun](https://bun.sh/) v1.2.19 or higher
- TypeScript 5.x
- Git

## Development Setup

1. Clone the repository:

```bash
git clone https://github.com/pixel-puppy/javascript.git
cd javascript
```

2. Install dependencies:

```bash
bun install
```

## Project Structure

```
@pixel-puppy/javascript/
├── src/
│   ├── index.ts          # Main entry point (exports)
│   ├── urls.ts           # Core URL building functionality
│   └── urls.test.ts      # Tests for URL building
├── dist/                 # Built files (gitignored)
│   ├── index.cjs         # CommonJS build
│   ├── index.mjs         # ESM build
│   └── index.d.ts        # TypeScript declarations
├── rolldown.config.ts    # Rolldown bundler configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.build.json   # TypeScript config for declarations
└── package.json          # Package metadata and scripts
```

## Development Workflow

### Running Tests

This project uses Bun's built-in test runner:

```bash
bun test
```

To run tests with coverage:

```bash
bun run test:coverage
```

### Building the Package

The build process creates both CommonJS and ESM versions of the library:

```bash
bun run build
```

This command:

1. Bundles the code with Rolldown into `dist/index.cjs` and `dist/index.mjs`
2. Generates TypeScript declaration files with `tsc`

The build output includes:

- `dist/index.cjs` - CommonJS format
- `dist/index.mjs` - ESM format
- `dist/index.d.ts` - TypeScript type definitions
- `dist/index.d.ts.map` - Source maps for types

### Code Formatting

This project uses Prettier for code formatting:

```bash
bun run format
```

Please ensure your code is formatted before submitting a pull request.

## Making Changes

1. Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and add tests for new functionality

3. Run tests to ensure everything passes:

```bash
bun test
```

4. Format your code:

```bash
bun run format
```

5. Build the package to ensure it compiles correctly:

```bash
bun run build
```

6. Commit your changes with a clear, descriptive message:

```bash
git commit -m "Add feature: your feature description"
```

7. Push to your fork and submit a pull request

## Code Style Guidelines

- Use TypeScript for all source code
- Follow the existing code style (enforced by Prettier)
- Write JSDoc comments for public APIs
- Include examples in JSDoc comments where helpful
- Add tests for all new functionality
- Keep functions small and focused
- Use meaningful variable and function names

## Testing Guidelines

- Write tests for all new features and bug fixes
- Use descriptive test names that explain what is being tested
- Test both success and error cases
- Use Bun's test runner syntax:

```typescript
import { test, expect } from 'bun:test'
import { buildImageUrl } from './urls'

test('buildImageUrl creates URL with default format', () => {
  const url = buildImageUrl('project', 'https://example.com/image.jpg')
  expect(url).toContain('format=webp')
})
```

## Publishing

The package is automatically built before publishing via the `prepublishOnly`
script. To publish a new version:

1. Update the version in `package.json`:

```bash
npm version patch|minor|major
```

2. Publish to npm:

```bash
bun publish
```

The `prepublishOnly` hook will automatically run `bun run build` before
publishing to ensure the latest code is included.

## Dependencies

- **Runtime Dependencies:**
  - `tiny-invariant` - For runtime assertions

- **Development Dependencies:**
  - `@types/bun` - TypeScript types for Bun
  - `rolldown` - Fast bundler for building the library
  - `prettier` - Code formatting
  - `vitest` - Testing framework
  - `@vitest/coverage-v8` - Code coverage

- **Peer Dependencies:**
  - `typescript` ^5 - Required for TypeScript support

## Build System

This project uses [Rolldown](https://rolldown.rs/) for bundling:

- Creates both ESM and CommonJS outputs
- Handles external dependencies correctly
- Fast build times
- Configuration in `rolldown.config.ts`

TypeScript declarations are generated separately using `tsc` with the
`tsconfig.build.json` configuration.

## Questions or Issues?

If you have questions or run into issues:

1. Check existing
   [GitHub issues](https://github.com/pixel-puppy/javascript/issues)
2. Open a new issue with a clear description
3. Join our community discussions

## License

By contributing, you agree that your contributions will be licensed under the
MIT License.
