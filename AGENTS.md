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

A ctrl-c ends a script with exit code 130 and no error output in every shell. zsh and pwsh do that on their own, so
their `quietInterrupt` returns the script unchanged. nu raises it as an error, which it prints on the way out and which
any `try` catches, so each nu process gets one wrapper at its top: `NuSh.build()` wraps every script, and `opRunCmd` the
child nu each command runs in (`opQuietInterrupt` in `op.nu`, held to `NuSh.quietInterrupt` line for line by
`nu_test.ts`). Its catch exits 130 for a ctrl-c (`opInterrupted`) and raises anything else again, to be reported as
before. Nothing else is needed: code below that rethrows an interrupt (`opRethrowInterrupt`) lets it reach the top.

How nu behaves, from its source (0.116):

- the ctrl-c handler sets one interrupt flag per process, from a thread of its own (the `ctrlc` crate's
  `set_handler_inner`), so nu can see a command the ctrl-c stopped exit before its own flag is set. a script's children
  share its process group, so every nu in a chain gets one (`crates/nu-system/src/foreground.rs`)
- the flag is checked only at a jump or a return (`crates/nu-protocol/src/ir/mod.rs`, `check_interrupt`) and inside
  commands that wait or write, and raised there as `Interrupted`. `exit` is not a check
- a `catch` or `finally` clears it only when the error it handles is `Interrupted`, or on unix `TerminatedBySignal`
  (`crates/nu-engine/src/eval_ir.rs`, `reset_signals_if_interrupted`)
- a caught error carries `exit_code` for a command's failure: its code, or minus the signal for a signal death

So a ctrl-c can be raised late, anywhere — including inside the wrapper's own catch. That is why the wrapper has an
outer catch with nothing in it but the same exit: wherever the interrupt lands, it is caught, and `exit` cannot be
interrupted. Cleanup that has to run however a command ended (`get.nu`'s removal of the fetched script) runs as
`try { X } catch { |e| X; $e }` and raises what it caught afterwards: the interrupt fires once, so if it cuts the first
attempt short, the second completes. The wrapper prints no newline after `^C`; that would be code a late interrupt could
cut short, and zsh's `PROMPT_SP` starts the prompt on a fresh line already.

### Questions (opAsk)

`opAsk` is the one yes/no question in every shell's op file: empty, `y` or `yes` is yes, and `YES` answers yes without
asking. nu's `input` reads only from a terminal, so `op_test.ts` cannot pipe an answer to it.

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
