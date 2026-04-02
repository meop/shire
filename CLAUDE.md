# CLAUDE.md

A library consumed by other projects (no standalone server). Provides shell-agnostic script generation for nu/pwsh/zsh,
a hierarchical command system, context extraction, and path/env utilities.

## Development Commands

```bash
deno task check        # type check
deno task format       # apply formatting (modifies files)
deno task format:check # verify formatting without modifying (CI / pre-commit)
deno task lint         # lint
deno task test         # run tests
deno task test:update  # regenerate snapshots after intentional changes
```

### After Making Changes

1. `deno task format`
2. `deno task lint` — fix errors, return to step 1 if any
3. `deno task test` — if snapshots fail due to intentional changes: `deno task test:update`, then review
   `git diff tests/` to confirm every changed snapshot is correct and valid shell syntax

### Dependency Management

- `deno outdated` — check for available updates
- `deno update` — update lockfile within version constraints
- `deno update --latest` — update deno.json and lockfile to absolute latest

## Publishing

To cut a release: bump `"version"` in `deno.json` and push to `main`.

The CI pipeline (`.github/workflows/pipeline.yml`) runs: Version check → Validate (fmt + lint) → Release (GPG-signed
tag) → Package (`deno publish` to JSR). Requires `GPG_PRIVATE_KEY` and `GPG_PASSPHRASE` repository secrets.

## Key Concepts

### Variable Assignment

`varSet` vs `varSetStr`: use `varSetStr` for raw values (applies `toLiteral` internally); use `varSet` only when the
value is already shell-quoted. `varSetArr` applies `toLiteral` to each element automatically — always pass raw strings.

### String Escaping (toLiteral/toElement)

Low-level quoting primitives — prefer `varSetStr`/`varSetArr` above. Use `toLiteral` when embedding a value in another
shell expression (e.g., as an argument to a static `execStr` call).

Nushell's `toLiteral` uses adaptive raw string depth (`r#'...'#`, `r##'...'##`, etc.) to safely nest any content.
`toElement` delegates to `toLiteral` on all shells (no backtick exception needed).

### File Loading

`fileLoad()` returns empty string if the file is not found — graceful degradation, no error thrown.

## Code Formatting

Deno formatting rules (deno.json):

- No semicolons
- Single quotes
- Trailing commas only on multiline
- Always use curly braces for `if` statement bodies, with body on next line

### Import Sorting

Imports must be organized into 3 groups with a single empty line between each group, and sorted alphabetically by source
within each group:

1. Built-in modules (e.g., `node:*`)
2. External packages (e.g., `@eemeli/yaml`, `@std/*`)
3. Local project files (e.g., `./cmd.ts`, `../sh.ts`)

Example:

```typescript
import { readFileSync } from 'node:fs'

import { parse } from '@eemeli/yaml'
import { assertEquals } from '@std/assert'

import { CmdBase } from './cmd.ts'
import type { Sh } from './sh.ts'
```
