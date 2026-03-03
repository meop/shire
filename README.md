# shire

Shell Interface Renderer - A TypeScript library for building HTTP servers that dynamically generate shell scripts.

Published to JSR as `@meop/shire`.

## Features

- **Multi-shell support**: Generate scripts for nushell, powershell, and zsh from a single codebase
- **Shell-agnostic abstractions**: Write once, deploy shell-specific scripts to different clients
- **Command-line argument parsing**: Built-in support for subcommands, arguments, options, and switches
- **Context-aware rendering**: Generate different scripts based on OS, architecture, and system properties
- **HTTP server integration**: Designed to serve executable shell scripts via HTTP endpoints

## Installation

```bash
deno add @meop/shire
```

Or import directly in your Deno project:

```typescript
import { CmdBase } from 'https://jsr.io/@meop/shire/cmd.ts'
import { Nushell } from 'https://jsr.io/@meop/shire/cli/nu.ts'
```

## Quick Start

### Define a Command

```typescript
import { CmdBase } from '@meop/shire/cmd'
import type { Cli } from '@meop/shire/cli'
import type { Ctx } from '@meop/shire/ctx'
import type { Env } from '@meop/shire/env'

class MyCmd extends CmdBase {
  constructor() {
    super([])
    this.name = 'mycommand'
    this.description = 'Does something useful'
    this.arguments = [
      { name: 'target', description: 'Target to process', required: true },
    ]
  }

  override async work(
    client: Cli,
    context: Ctx,
    environment: Env,
  ): Promise<string> {
    const target = environment.get([...this.scopes, this.name, 'target'])

    return client
      .with(client.varSet(['TARGET'], client.toLiteral(target)))
      .with(await client.fileLoad(['mycommand']))
      .with(['runMyCommand'])
      .build()
  }
}
```

### Build an HTTP Server

```typescript
import { Nushell } from '@meop/shire/cli/nu'
import { Powershell } from '@meop/shire/cli/pwsh'
import { Zshell } from '@meop/shire/cli/zsh'
import { getCtx } from '@meop/shire/ctx'

Deno.serve(async (request: Request) => {
  const context = getCtx(request)
  const parts = new URL(request.url).pathname.split('/').filter((p) => p)

  const clientType = parts[0] || 'zsh'
  const client = clientType === 'nu' ? new Nushell() : clientType === 'pwsh' ? new Powershell() : new Zshell()

  const cmd = new MyCmd()
  const script = await cmd.process(parts.slice(1), client, context)

  return new Response(script, { headers: { 'Content-Type': 'text/plain' } })
})
```

### Create Shell Templates

Create files in `cli/{shell}/` directories:

**cli/nu/mycommand.nu**

```nu
def runMyCommand [] {
  print $"Processing ($env.TARGET)"
}
```

**cli/pwsh/mycommand.ps1**

```powershell
function runMyCommand {
  Write-Host "Processing $env:TARGET"
}
```

**cli/zsh/mycommand.zsh**

```zsh
runMyCommand() {
  echo "Processing ${TARGET}"
}
```

## Core Modules

- **cli.ts** - Client abstraction for shell implementations (`Nushell`, `Powershell`, `Zshell`)
- **cmd.ts** - Command system with argument parsing and subcommand support
- **srv.ts** - Server base with standard options (`--help`, `--debug`, `--log`, `--noop`, `--trace`)
- **ctx.ts** - Context extraction from HTTP requests; all system properties pass through as raw strings
- **env.ts** - Environment management for key-value storage
- **path.ts** - Cross-platform path utilities and file system operations
- **serde.ts** - Serialization for JSON and YAML formats

## Key Concepts

### Shell Abstraction

Write shell-agnostic code using the `Cli` interface. Methods like `varSet()`, `print()`, and `fileLoad()` automatically
generate the correct syntax for each shell.

### String Escaping

Use `toLiteral()` to escape values for safe use in shell code (variable assignments, arguments). Use `toElement()` when
wrapping values as array elements:

```typescript
client.varSet(['KEY'], client.toLiteral(value))
client.varSetArr(['KEYS'], values.map((v) => client.toElement(v)))

const cmd = Zshell.execStr(client.toLiteral('echo "hello"'))
```

### Variable Scoping

Variable keys are hierarchical arrays: `['pack', 'add', 'names']` maps to environment variables based on the shell's key
joining strategy.

### Context Filtering

Generate different scripts based on detected system properties using the `Ctx` type.

## Development

```bash
# Format code
deno fmt

# Lint
deno lint

# Type checking
deno check src/**/*.ts
```

## Releasing

Bump `"version"` in `deno.json` and push to `main`. The CI pipeline will validate, tag, and publish to JSR automatically.

## Real-World Example

See the **wut** project for a complete implementation using shire to build a cross-platform configuration management
system.
