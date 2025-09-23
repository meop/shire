import type { Cli } from './cli.ts'
import type { Ctx } from './ctx.ts'
import { type Env, EnvBase } from './env.ts'
import { stringify, toFmt } from './serde.ts'

export interface Cmd {
  name: string
  description: string

  aliases: Array<string>
  arguments: Array<{ name: string; description: string; required?: boolean }>
  options: Array<{ keys: Array<string>; description: string }>
  switches: Array<{ keys: Array<string>; description: string }>

  commands: Array<Cmd>
  scopes: Array<string>

  process(
    parts: Array<string>,
    client: Cli,
    context: Ctx,
    environment?: Env,
  ): Promise<string>
}

export function toExpandedParts(parts: Array<string>) {
  const _parts: Array<string> = []
  for (const part of parts) {
    if (part.startsWith('-') && !part.startsWith('--')) {
      for (const c of part.split('').slice(1)) {
        _parts.push(`-${c}`)
      }
      continue
    }
    _parts.push(part)
  }
  return _parts
}

export function toSerializable(command: Cmd) {
  const content: {
    id: string
    aliases?: string
    arguments?: Array<string>
    options?: Array<string>
    switches?: Array<string>
    commands?: string
  } = {
    id: `${
      [...command.scopes, command.name].join(' ')
    } | ${command.description}`,
  }

  if (command.aliases.length) {
    content.aliases = command.aliases.join(', ')
  }

  if (command.arguments.length) {
    content.arguments = command.arguments.map(
      (a) =>
        `${a.required ? '<' : '['}${a.name}${
          a.required ? '>' : ']'
        } | ${a.description}`,
    )
  }

  if (command.options.length) {
    command.options.sort((a, b) => a.keys[0].localeCompare(b.keys[0]))
    content.options = command.options.map(
      (opt) => `${opt.keys.join(', ')} | ${opt.description}`,
    )
  }

  if (command.switches.length) {
    command.switches.sort((a, b) => a.keys[0].localeCompare(b.keys[0]))
    content.switches = command.switches.map(
      (swt) => `${swt.keys.join(', ')} | ${swt.description}`,
    )
  }

  if (command.commands.length) {
    content.commands = command.commands.map((c) => c.name).join(', ')
  }

  return content
}

export class CmdBase {
  name = ''
  description = ''

  aliases: Array<string> = []
  arguments: Array<{ name: string; description: string; required?: boolean }> =
    []
  options: Array<{ keys: Array<string>; description: string }> = []
  switches: Array<{ keys: Array<string>; description: string }> = []

  commands: Array<Cmd> = []
  scopes: Array<string> = []

  constructor(scopes: Array<string>) {
    this.scopes = scopes
  }

  help(client: Cli, environment: Env): string {
    const body = client.with(
      client.printInfo(
        stringify(
          toSerializable(this),
          toFmt(environment.get(['format']) ?? ''),
        ),
      ),
    ).build()

    if (environment.get(['log'])) {
      console.log(body)
    }

    return body
  }

  work(client: Cli, _context: Ctx, environment: Env): Promise<string> {
    return Promise.resolve(this.help(client, environment))
  }

  process(
    parts: Array<string>,
    client: Cli,
    context: Ctx,
    environment?: Env,
  ): Promise<string> {
    const _parts = toExpandedParts(parts)
    let _client = client
    const _context = context
    const _environment = environment ? environment : new EnvBase()

    const loadCliEnv = (func: () => Promise<string>) => {
      for (const [key, value] of Object.entries(_environment.store)) {
        _client = _client.with(
          _client.varSet([key], _client.toInner(value ?? '')),
        )
      }

      if (_environment.get(['debug'])) {
        _client = _client.with(
          _client.print(
            stringify({
              debug: { context: _context, environment: _environment },
            }, toFmt(_environment.get(['format']) ?? '')),
          ),
        )
      }

      if (_environment.get(['trace'])) {
        _client = _client.with(_client.trace())
      }

      return func()
    }

    const toFullKey = (key: string) => [...this.scopes, this.name, key].slice(1)

    let partsIndex = 0
    let argumentIndex = 0

    while (partsIndex < _parts.length) {
      const part = _parts[partsIndex]

      if (part.startsWith('-') && part !== '--') {
        const _switch = this.switches.find((s) => s.keys.includes(part))
        if (_switch) {
          _environment.set(
            toFullKey(
              _switch.keys.find((k) => k.startsWith('--'))?.split('--')[1] ??
                '',
            ),
            '1',
          )
          partsIndex += 1
          continue
        }
        const _option = this.options.find((o) => o.keys.includes(part))
        if (_option && partsIndex + 1 < _parts.length) {
          if (_parts[partsIndex + 1].startsWith('-')) {
            return loadCliEnv(() =>
              Promise.resolve(this.help(_client, _environment))
            )
          }
          _environment.set(
            toFullKey(
              _option.keys.find((k) => k.startsWith('--'))?.split('--')[1] ??
                '',
            ),
            _parts[partsIndex + 1],
          )
          partsIndex += 2
          continue
        }
      }

      if (this.commands.length) {
        const _command = this.commands.find(
          (c) => c.name === part || c.aliases.find((a) => a === part),
        )
        if (_command) {
          return _command.process(
            _parts.slice(partsIndex + 1),
            _client,
            _context,
            _environment,
          )
        }
      }

      if (this.arguments.length) {
        const allArgsFound = argumentIndex === this.arguments.length
        if (allArgsFound) {
          _environment.setAppend(
            toFullKey(this.arguments[argumentIndex - 1].name),
            part,
          )
        } else {
          _environment.set(
            toFullKey(this.arguments[argumentIndex].name),
            part,
          )
        }
        if (!allArgsFound) {
          argumentIndex += 1
        }
        partsIndex += 1
        continue
      }

      return loadCliEnv(() => Promise.resolve(this.help(_client, _environment)))
    }

    while (argumentIndex < this.arguments.length) {
      if (this.arguments[argumentIndex].required) {
        return loadCliEnv(() =>
          Promise.resolve(this.help(_client, _environment))
        )
      }
      argumentIndex += 1
    }

    if (_environment.get(['help'])) {
      return loadCliEnv(() => Promise.resolve(this.help(_client, _environment)))
    }

    return loadCliEnv(() => this.work(_client, _context, _environment))
  }
}
