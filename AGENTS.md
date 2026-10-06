# AGENTS.md

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

### String Escaping (toLiteral)

Low-level quoting primitive — prefer `varSetStr`/`varSetArr` above. Use `toLiteral` when embedding a value in another
shell expression (e.g., as an argument to a static `execStr` call).

Nushell's `toLiteral` uses adaptive raw string depth (`r#'...'#`, `r##'...'##`, etc.) to safely nest any content.

### Ctrl-C (quietInterrupt)

A ctrl-c ends a script quietly with exit code 130 in every shell. zsh and pwsh do that on their own, so their
`quietInterrupt` returns the script unchanged. nu raises it as an error, which it prints on the way out and which any
`try` catches, so `NuSh.build()` wraps every script in one handler, and `opRunCmd` wraps the child nu each command runs
in (`opQuietInterrupt` in `op.nu`, held to `NuSh.quietInterrupt` line for line by `nu_test.ts`).

How nu behaves, from its source (0.116):

- one interrupt flag per process, set by the ctrl-c handler (`src/signals.rs`); a script's children share its process
  group, so every nu in a chain gets one (`crates/nu-system/src/foreground.rs`)
- the flag is checked only at a jump or a return (`crates/nu-protocol/src/ir/mod.rs`, `check_interrupt`) and inside
  commands that wait or write; the end of a `catch` block is neither (`crates/nu-engine/src/compile/keyword.rs`)
- a `catch` or `finally` clears it only when the error it handles is `Interrupted`, or on unix `TerminatedBySignal`
  (`crates/nu-engine/src/eval_ir.rs`, `reset_signals_if_interrupted`). the failure of a command a ctrl-c stopped is
  often neither — a command that reads it exits 130, windows exits STATUS_CONTROL_C_EXIT — so the flag is still set and
  fires at the next check
- a caught error carries `exit_code` for a command's failure: its code, or minus the signal for a signal death

So `opInterrupted` is the one test for a ctrl-c, and `opSettle` (`try { do { } }`: the block's return is a check, inside
a try that clears it) is how code that has to run after one — a cleanup — makes sure it is not cut short. Only the
outermost nu in a chain prints the newline after `^C`.

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
