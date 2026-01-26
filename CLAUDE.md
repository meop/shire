# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**shire** is a TypeScript library for building HTTP servers that dynamically generate shell scripts. It provides abstractions for multi-shell support (nushell, powershell, zsh) and command-line argument parsing.

Published to JSR as `@meop/shire`.

## Development Commands

```bash
# Format code
deno fmt

# Run type checking
deno check src/**/*.ts
```

No standalone server - this is a library consumed by other projects (like wut).

## Publishing

This package is published to JSR. Update version in `deno.json`, then publish using JSR's workflow.

## Architecture Overview

### Core Abstraction: Shell-Agnostic Script Generation

The library allows you to write shell-agnostic code that generates shell-specific scripts for different shells (nu/pwsh/zsh). This enables building HTTP servers that deliver executable shell scripts tailored to the requesting client.

### Module Structure

**cli.ts** - Client abstraction
- `Cli` interface defines contract for shell implementations
- `CliBase` provides base implementation
- Implementations: `Nushell`, `Powershell`, `Zshell` in `cli/{nu,pwsh,zsh}.ts`
- Key methods:
  - `toInner()/toOuter()` - String escaping for nested quotes
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
- `getCtx()` extracts system context from HTTP requests
- Detects OS (platform, ID, version), user, architecture from User-Agent headers
- Provides `withCtx()` for variable substitution in config strings

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

**sys.ts** - System types
- Enums for OS platforms, architectures, etc.
- Used for OS detection and conditional logic

## Usage Pattern

### 1. Define a Command

```typescript
import { CmdBase, type Cmd } from '@meop/shire/cmd'
import type { Cli } from '@meop/shire/cli'
import type { Ctx } from '@meop/shire/ctx'
import type { Env } from '@meop/shire/env'

class MyCmd extends CmdBase implements Cmd {
  constructor(scopes: Array<string>) {
    super(scopes)
    this.name = 'mycommand'
    this.description = 'Does something useful'
    this.arguments = [
      { name: 'target', description: 'Target to process', required: true }
    ]
  }

  override async work(
    client: Cli,
    context: Ctx,
    environment: Env,
  ): Promise<string> {
    const target = environment.get([...this.scopes, this.name, 'target'])

    // Build shell script using client abstraction
    const script = client
      .with(client.varSet(['TARGET'], client.toInner(target)))
      .with(await client.fileLoad(['mycommand']))  // Load mycommand.{nu,ps1,zsh}
      .with(['runMyCommand'])  // Call function from loaded file
      .build()

    return script
  }
}
```

### 2. Build an HTTP Server

```typescript
import { Nushell } from '@meop/shire/cli/nu'
import { Powershell } from '@meop/shire/cli/pwsh'
import { Zshell } from '@meop/shire/cli/zsh'
import { getCtx } from '@meop/shire/ctx'

async function handleRequest(request: Request) {
  const context = getCtx(request)
  const parts = new URL(request.url).pathname.split('/').filter(p => p)

  // Determine client type from URL
  const clientType = parts[0]  // e.g., 'nu', 'pwsh', 'zsh'
  const client = clientType === 'nu' ? new Nushell()
    : clientType === 'pwsh' ? new Powershell()
    : new Zshell()

  // Process command
  const cmd = new MyCmd([])
  const script = await cmd.process(parts.slice(1), client, context)

  return new Response(script, {
    headers: { 'Content-Type': 'text/plain' }
  })
}

Deno.serve(handleRequest)
```

### 3. Create Shell Template Files

Create `cli/nu/mycommand.nu`:
```nu
def runMyCommand [] {
  print $"Processing ($env.TARGET)"
}
```

Create `cli/pwsh/mycommand.ps1`:
```powershell
function runMyCommand {
  Write-Host "Processing $env:TARGET"
}
```

Create `cli/zsh/mycommand.zsh`:
```zsh
runMyCommand() {
  echo "Processing ${TARGET}"
}
```

## Key Concepts

### String Nesting (toInner/toOuter)

Shell scripts often need nested string interpolation. The `toInner()` and `toOuter()` methods handle quote escaping:

```typescript
// Generate: nushell command that will execute zsh
const inner = Zshell.execStr(client.toInner('echo "hello"'))
// Result: nu wraps zsh string with proper escaping
```

### File Loading

`fileLoad()` loads shell-specific template files from `cli/{shell}/` directories. It follows import resolution and returns empty string if file not found (graceful degradation).

### Variable Scoping

Variable keys are hierarchical arrays: `['pack', 'add', 'names']` becomes environment variable based on the key joining strategy.

### Context Filtering

`ctx.ts` supports context-based filtering - load different config/scripts based on OS, architecture, or other system properties.

## Code Formatting

Deno formatting rules (deno.json):
- No semicolons
- Single quotes
- Trailing commas only on multiline

## Real-World Example

See the **wut** project (sibling repository) for a complete implementation using shire to build a cross-platform configuration management system.
