# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**shire** is a TypeScript library for building HTTP servers that dynamically generate shell scripts. It provides
abstractions for multi-shell support (nushell, powershell, zsh) and command-line argument parsing.

Published to JSR as `@meop/shire`.

## Development Commands

```bash
deno task fmt        # apply formatting (modifies files)
deno task fmt:check  # verify formatting without modifying (CI / pre-commit)
deno task lint       # lint
deno task check      # type check
deno task test       # run tests
```

No standalone server — this is a library consumed by other projects.

## Development Workflow

After making code changes, run in this order:

1. `deno task fmt` — apply formatting; always modifies files if needed
2. `deno task lint` — check for lint errors
   - If errors found: fix them, then return to step 1
3. `deno task test` — run tests
   - If snapshot tests fail due to intentional output changes: `deno task test:update`, then review `git diff tests/` to
     confirm every changed snapshot is correct and valid shell syntax

Use `deno task fmt:check` (no modifications) only for CI or to verify formatting before committing.

## Publishing

Publishing is handled by the CI pipeline (`.github/workflows/pipeline.yml`). To cut a release:

1. Bump `"version"` in `deno.json`
2. Push to `main`

The pipeline runs four jobs in order:

- **Version** — reads `deno.json` version, checks if `v<version>` git tag already exists; skips release jobs if so
- **Validate** — runs `deno fmt --check` and `deno lint` (runs in parallel with Version)
- **Release** — creates and pushes a GPG-signed git tag (main branch + new version only)
- **Package** — runs `deno publish` to JSR (main branch + new version only)

Requires two repository secrets: `GPG_PRIVATE_KEY` and `GPG_PASSPHRASE`.

## Architecture Overview

### Core Abstraction: Shell-Agnostic Script Generation

The library allows you to write shell-agnostic code that generates shell-specific scripts for different shells
(nu/pwsh/zsh). This enables building HTTP servers that deliver executable shell scripts tailored to the requesting
client.

### Module Structure

**cli.ts** - Client abstraction

- `Cli` interface defines contract for shell implementations
- `CliBase` provides base implementation
- Implementations: `Nushell`, `Powershell`, `Zshell` in `cli/{nu,pwsh,zsh}.ts`
- Key methods:
  - `toLiteral()/toElement()` - String escaping for shell code and array elements
  - `varSet()/varSetArr()/varUnSet()` - Variable management
  - `print()/printErr()/printInfo()/printSucc()/printWarn()` - Output formatting
  - `fileLoad()` - Load shell-specific template files
  - `build()` - Generate final shell script

**cmd.ts** - Command system

- `Cmd` interface defines hierarchical command structure
- `CmdBase` provides argument parsing and dispatching
- Supports:
  - Subcommands (nested commands)
  - Aliases (alternative names)
  - Arguments (positional parameters)
  - Options (key-value flags like `--manager yay`)
  - Switches (boolean flags like `-g`)
- The `process()` method parses command-line parts and calls `work()` on the appropriate command

**srv.ts** - Server base

- `SrvBase` extends `CmdBase` with standard server options
- Provides common flags: `--help`, `--debug`, `--log`, `--noop`, `--trace`, etc.

**ctx.ts** - Context extraction

- `getCtx()` extracts system context from HTTP request query params; all fields pass through as raw strings
- Provides `withCtx()` for placeholder substitution in config strings (e.g. `{SYS_HOST}`)

**env.ts** - Environment management

- `Env` interface for key-value environment storage
- `EnvBase` implementation with `get()`, `set()`, `setAppend()`, `getSplit()`

**path.ts** - Path utilities

- Cross-platform path building
- File system operations (reading files, listing directories)
- Path filtering and pattern matching

**reg.ts** - Registry utilities

- Key/value joining and splitting with delimiters
- Used for hierarchical key construction

**serde.ts** - Serialization

- Parse/stringify for JSON and YAML formats
- Format detection and conversion

## Key Concepts

### Variable Assignment

Use `varSetStr` for literal string values — it applies `toLiteral` internally:

```typescript
client.varSetStr(['KEY'], value) // preferred: wraps value as shell literal automatically
client.varSet(['KEY'], someAlreadyQuotedExpr) // use only when value is already shell-quoted
```

Use `varSetArr` with raw values — it applies `toLiteral` to each element internally:

```typescript
client.varSetArr(['ARRAY'], values) // pass raw strings; quoting is handled automatically
```

### String Escaping (toLiteral/toElement)

Low-level quoting primitives — prefer the high-level methods above. Use `toLiteral` when you need to quote a value for
embedding in another shell expression (e.g., as an argument to a static `execStr` call):

```typescript
const cmd = Zshell.execStr(client.toLiteral('echo "hello"'))
```

Nushell's `toLiteral` uses adaptive raw string depth (`r#'...'#`, `r##'...'##`, etc.) to safely nest any content.
`toElement` delegates to `toLiteral` on all shells (no backtick exception needed).

### File Loading

`fileLoad()` loads shell-specific template files from `cli/{shell}/` directories. It follows import resolution and
returns empty string if file not found (graceful degradation).

### Variable Scoping

Variable keys are hierarchical arrays: `['pack', 'add', 'names']` becomes environment variable based on the key joining
strategy.

### Context Filtering

`ctx.ts` supports context-based filtering - load different config/scripts based on OS, architecture, or other system
properties.

## Testing

Automated tests live in `tests/` and use snapshot testing:

- Tests call exported functions directly with synthetic inputs
- Snapshots are committed and show diffs in PRs
- Snapshot tests fail if output changes unexpectedly

```bash
deno task test          # run all tests
deno task test:update   # regenerate snapshots (review diffs carefully)
```

## Code Formatting

Deno formatting rules (deno.json):

- No semicolons
- Single quotes
- Trailing commas only on multiline
