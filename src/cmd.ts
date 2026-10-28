/**
 * This module contains components for building command implementations
 * @module
 */

import type { Ctx } from './ctx.ts'
import { type Env, EnvBase } from './env.ts'
import { stringify, toFmt } from './serde.ts'
import type { Sh } from './sh.ts'

/**
 * Interface defining the contract for command implementations
 */
export interface Cmd {
  /**
   * Name of the command
   */
  name: string
  /**
   * Description of what the command does
   */
  description: string
  /**
   * Alternative names that can be used to invoke this command
   */
  aliases: Array<string>
  /**
   * List of required and optional arguments for the command
   */
  arguments: Array<{ name: string; description: string; required?: boolean }>
  /**
   * List of options that can be passed to the command
   */
  options: Array<{ keys: Array<string>; description: string }>
  /**
   * List of switches that can be passed to the command
   */
  switches: Array<{ keys: Array<string>; description: string }>

  /**
   * Subcommands available for this command
   */
  commands: Array<Cmd>
  /**
   * Scope path for this command (used for hierarchical organization)
   */
  scopes: Array<string>

  /**
   * Processes command parts and executes the command
   * @param parts - Command line parts
   * @param shell - Shell instance
   * @param context - Execution context
   * @param environment - Environment configuration
   * @param inherited - The levels above this command, outermost first, whose switches and options it also accepts
   * @returns Promise resolving to command output
   */
  process(
    parts: Array<string>,
    shell: Sh,
    context: Ctx,
    environment?: Env,
    inherited?: Array<CmdLevel>,
  ): Promise<string>
}

/**
 * A command's switches and options, with the scope its values are stored under, as the commands below it see them
 */
export type CmdLevel = {
  /**
   * Scope path of the command these belong to, its own name included
   */
  scopes: Array<string>
  /**
   * List of options the command accepts
   */
  options: Array<{ keys: Array<string>; description: string }>
  /**
   * List of switches the command accepts
   */
  switches: Array<{ keys: Array<string>; description: string }>
}

function toLevel(command: Pick<Cmd, 'name' | 'scopes' | 'options' | 'switches'>): CmdLevel {
  return { scopes: [...command.scopes, command.name], options: command.options, switches: command.switches }
}

function toLongKey(keys: Array<string>, part: string): string {
  return keys.find((k) => k.startsWith('--')) ?? part
}

// a flag belongs to the nearest level that defines it: the command's own, then each level above it, innermost first
function findFlag(levels: Array<CmdLevel>, part: string) {
  for (const level of levels.toReversed()) {
    const _switch = level.switches.find((s) => s.keys.includes(part))
    if (_switch) {
      return { level, keys: _switch.keys, isOption: false }
    }
    const _option = level.options.find((o) => o.keys.includes(part))
    if (_option) {
      return { level, keys: _option.keys, isOption: true }
    }
  }
  return null
}

/**
 * Converts shorthand flags into individual flag components
 * For example, '-abc' becomes ['-a', '-b', '-c']
 * @param parts - Array of command line parts
 * @returns Array of expanded argument parts
 */
export function toExpandedParts(parts: Array<string>): Array<string> {
  const _parts: Array<string> = []
  for (const part of parts) {
    if (part.length > 1 && part.startsWith('-') && !part.startsWith('--')) {
      for (const c of part.split('').slice(1)) {
        _parts.push(`-${c}`)
      }
      continue
    }
    _parts.push(part)
  }
  return _parts
}

/**
 * Resolves command parts to their canonical form: expands combined flags,
 * replaces aliases with canonical command names, and preserves recognized
 * switches/options with their long-form keys. A flag a command does not define
 * but a command above it does is that command's, and moves to follow it. A part
 * nothing recognizes is kept as typed, for the command to make of it what it
 * will, and everything after `--` is kept as typed.
 * @param cmd - The command to resolve against
 * @param parts - Raw command line parts
 * @returns Canonical parts array
 */
export function resolveCanonicalParts(cmd: Cmd, parts: Array<string>): Array<string> {
  const chain = resolveLevel(cmd, toExpandedParts(parts), [])
  return chain.flatMap((l, i) => i === 0 ? l.out : [l.cmd.name, ...l.out])
}

function resolveLevel(
  cmd: Cmd,
  parts: Array<string>,
  above: Array<{ cmd: Cmd; level: CmdLevel; out: Array<string> }>,
): Array<{ cmd: Cmd; level: CmdLevel; out: Array<string> }> {
  const chain = [...above, { cmd, level: toLevel(cmd), out: [] as Array<string> }]
  const out = chain[chain.length - 1].out
  let i = 0

  while (i < parts.length) {
    const part = parts[i]

    if (part === '--') {
      out.push(...parts.slice(i))
      break
    }

    // help is for the command it follows, as process has it
    if (part === '-h' || part === '--help') {
      out.push('--help')
      i += 1
      continue
    }

    if (part.startsWith('-')) {
      const flag = findFlag(chain.map((l) => l.level), part)
      const owner = chain.find((l) => l.level === flag?.level)
      if (flag && owner && !flag.isOption) {
        owner.out.push(toLongKey(flag.keys, part))
        i += 1
        continue
      }
      if (flag && owner && i + 1 < parts.length && !parts[i + 1].startsWith('-')) {
        owner.out.push(toLongKey(flag.keys, part), parts[i + 1])
        i += 2
        continue
      }
    }

    if (cmd.commands.length) {
      const sub = cmd.commands.find((c) => c.name === part || c.aliases.includes(part))
      if (sub) {
        return resolveLevel(sub, parts.slice(i + 1), chain)
      }
    }

    out.push(part)
    i += 1
  }

  return chain
}

function toSerializable(command: Cmd) {
  const content: {
    id: string
    aliases?: string
    arguments?: Array<string>
    options?: Array<string>
    switches?: Array<string>
    commands?: string
  } = {
    id: `${[...command.scopes, command.name].join(' ')} | ${command.description}`,
  }

  if (command.aliases.length) {
    content.aliases = command.aliases.join(', ')
  }

  if (command.arguments.length) {
    content.arguments = command.arguments.map(
      (a) => `${a.required ? '<' : '['}${a.name}${a.required ? '>' : ']'} | ${a.description}`,
    )
  }

  if (command.options.length) {
    content.options = [...command.options]
      .sort((a, b) => a.keys[0].localeCompare(b.keys[0]))
      .map((opt) => `${opt.keys.join(', ')} | ${opt.description}`)
  }

  if (command.switches.length) {
    content.switches = [...command.switches]
      .sort((a, b) => a.keys[0].localeCompare(b.keys[0]))
      .map((swt) => `${swt.keys.join(', ')} | ${swt.description}`)
  }

  if (command.commands.length) {
    content.commands = command.commands.map((c) => c.name).join(', ')
  }

  return content
}

/**
 * Base implementation of the Cmd interface
 */
export class CmdBase {
  /**
   * Name of the command
   */
  name = ''
  /**
   * Description of what the command does
   */
  description = ''

  /**
   * Alternative names that can be used to invoke this command
   */
  aliases: Array<string> = []
  /**
   * List of required and optional arguments for the command
   */
  arguments: Array<{ name: string; description: string; required?: boolean }> = []
  /**
   * List of options that can be passed to the command
   */
  options: Array<{ keys: Array<string>; description: string }> = []
  /**
   * List of switches that can be passed to the command
   */
  switches: Array<{ keys: Array<string>; description: string }> = []

  /**
   * Subcommands available for this command
   */
  commands: Array<Cmd> = []
  /**
   * Scope path for this command (used for hierarchical organization)
   */
  scopes: Array<string> = []

  /**
   * Creates a new CmdBase instance
   * @param scopes - Scope path for this command
   */
  constructor(scopes: Array<string>) {
    this.scopes = scopes
  }

  /**
   * Generates help information for the command
   * @param shell - Shell instance
   * @param environment - Environment configuration
   * @returns Formatted help text
   */
  help(shell: Sh, environment: Env): string {
    const body = shell.with(
      shell.printInfo(
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

  /**
   * Default implementation of command work function
   * @param shell - Shell instance
   * @param _context - Execution context
   * @param environment - Environment configuration
   * @returns Promise resolving to help text
   */
  work(shell: Sh, _context: Ctx, environment: Env): Promise<string> {
    return Promise.resolve(this.help(shell, environment))
  }

  /**
   * Processes command parts and executes the command
   * @param parts - Command line parts
   * @param shell - Shell instance
   * @param context - Execution context
   * @param environment - Environment configuration
   * @param inherited - The levels above this command, outermost first, whose switches and options it also accepts
   * @returns Promise resolving to command output
   */
  process(
    parts: Array<string>,
    shell: Sh,
    context: Ctx,
    environment?: Env,
    inherited: Array<CmdLevel> = [],
  ): Promise<string> {
    const _parts = toExpandedParts(parts)
    let _shell = shell
    const _context = context
    const _environment = environment ? environment : new EnvBase()

    const loadShEnv = (func: () => Promise<string>) => {
      for (const [key, value] of Object.entries(_environment.store)) {
        _shell = _shell.with(
          _shell.envSetStr([key], value ?? ''),
        )
      }

      if (_environment.get(['debug'])) {
        _shell = _shell.with(
          _shell.print(
            stringify({
              debug: { context: _context, environment: _environment },
            }, toFmt(_environment.get(['format']) ?? '')),
          ),
        )
      }

      if (_environment.get(['trace'])) {
        _shell = _shell.with(_shell.trace())
      }

      return func()
    }

    const toFullKey = (key: string) => [...this.scopes, this.name, key].slice(1)

    let partsIndex = 0
    let argumentIndex = 0

    while (partsIndex < _parts.length) {
      const part = _parts[partsIndex]

      if (part === '-h' || part === '--help') {
        return loadShEnv(() => Promise.resolve(this.help(_shell, _environment)))
      }

      if (part === '--') {
        for (const arg of _parts.slice(partsIndex + 1)) {
          _environment.setAppend(toFullKey('args'), arg)
        }
        break
      }

      if (part.startsWith('-')) {
        const flag = findFlag([...inherited, toLevel(this)], part)
        if (flag) {
          const key = [...flag.level.scopes, toLongKey(flag.keys, part).split('--')[1] ?? ''].slice(1)
          if (!flag.isOption) {
            _environment.set(key, '1')
            partsIndex += 1
            continue
          }
          if (
            partsIndex + 1 >= _parts.length ||
            _parts[partsIndex + 1].startsWith('-')
          ) {
            return loadShEnv(() => Promise.resolve(this.help(_shell, _environment)))
          }
          _environment.set(key, _parts[partsIndex + 1])
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
            _shell,
            _context,
            _environment,
            [...inherited, toLevel(this)],
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

      return loadShEnv(() => Promise.resolve(this.help(_shell, _environment)))
    }

    while (argumentIndex < this.arguments.length) {
      if (this.arguments[argumentIndex].required) {
        return loadShEnv(() => Promise.resolve(this.help(_shell, _environment)))
      }
      argumentIndex += 1
    }

    if (_environment.get(['help'])) {
      return loadShEnv(() => Promise.resolve(this.help(_shell, _environment)))
    }

    return loadShEnv(() => this.work(_shell, _context, _environment))
  }
}
