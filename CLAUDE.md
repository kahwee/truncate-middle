# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Build: `npm run build`
- Lint: `npm run lint`
- Lint & fix: `npm run lint:fix`
- Format: `npm run format`
- Test: `npm run test`
- Run single test: `npx vitest run -t "test description"`
- Type check: `npm run typecheck`
- Coverage: `npm run coverage`

## Code Style Guidelines

- **Module System**: ES Modules (`type: "module"` in package.json)
- **Formatting**: Follow ESLint config with Prettier integration
- **Types**: TypeScript with strict mode enabled
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Error Handling**: Null/undefined checks with early returns
- **Functions**: Default parameters where appropriate
- **Documentation**: JSDoc comments for exports
- **Framework**: Vitest for testing with `expect(...).toBe()` pattern
- **Imports**: Named imports preferred

## Project Architecture

This package provides a single utility function `truncateMiddle` that truncates strings in the middle, preserving both the beginning and end portions of the text. This is useful when important information exists at both ends of a string.

### Key Components:

- **src/index.ts**: Contains the main `truncateMiddle` function
- **test/index.test.ts**: Contains tests for the functionality
- **tsup.config.ts**: Configuration for building both ESM and CommonJS outputs

### Function Signature:

```typescript
function truncateMiddle(
  str: string | null | undefined,
  frontLen: number = 0,
  backLen: number = 0,
  truncateStr: string = "&hellip;"
): string
```

- `str`: String to be truncated
- `frontLen`: Number of characters to keep at the front
- `backLen`: Number of characters to keep at the back
- `truncateStr`: String that replaces the truncated portion (defaults to `&hellip;`)

The function handles various edge cases like null/undefined inputs and strings shorter than the combined front and back lengths.