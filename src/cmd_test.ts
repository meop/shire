import { assertEquals, assertStringIncludes } from '@std/assert'

import { CmdBase, resolveCanonicalParts, toExpandedParts } from './cmd.ts'
import type { Ctx } from './ctx.ts'
import { EnvBase } from './env.ts'
import type { Sh } from './sh.ts'
import { NuSh } from './sh/nu.ts'

Deno.test('toExpandedParts - expands combined flags', () => {
  assertEquals(toExpandedParts(['-abc']), ['-a', '-b', '-c'])
  assertEquals(toExpandedParts(['--flag']), ['--flag'])
  assertEquals(toExpandedParts(['-a', '-b']), ['-a', '-b'])
  assertEquals(toExpandedParts(['command', '-v']), ['command', '-v'])
})

class TestCmd extends CmdBase {
  constructor(scopes: string[]) {
    super(scopes)
    this.name = 'test'
    this.description = 'test command'
    this.switches = [{ keys: ['-s', '--switch'], description: 'test switch' }]
    this.options = [{ keys: ['-o', '--option'], description: 'test option' }]
    this.arguments = [{ name: 'arg1', description: 'test arg', required: true }]
  }

  override work(_shell: Sh, _context: Ctx, environment: EnvBase): Promise<string> {
    // Mirror the toFullKey logic: [...scopes, name, key].slice(1)
    const key = (k: string) => [...this.scopes, this.name, k].slice(1)
    const val = environment.get(key('arg1'))
    const opt = environment.get(key('option'))
    const swt = environment.get(key('switch'))
    return Promise.resolve(`arg1=${val}, option=${opt}, switch=${swt}`)
  }
}

Deno.test('CmdBase.process - parses arguments, options and switches', async () => {
  const cmd = new TestCmd(['root'])
  const shell = new NuSh()
  const context = { req_orig: '', req_path: '', req_srch: '' }
  const env = new EnvBase()

  const result = await cmd.process(['-s', '-o', 'optval', 'myarg'], shell, context, env)
  assertEquals(result, 'arg1=myarg, option=optval, switch=1')
})

class SubCmd extends CmdBase {
  constructor(scopes: string[]) {
    super(scopes)
    this.name = 'sub'
    this.description = 'sub command'
    this.aliases = ['s', 'su']
    this.arguments = [{ name: 'parts', description: 'filter parts' }]
  }
  override work(_shell: Sh, _context: Ctx, _env: EnvBase): Promise<string> {
    return Promise.resolve('')
  }
}

class RootCmd extends CmdBase {
  constructor() {
    super([])
    this.name = 'root'
    this.description = 'root command'
    this.switches = [
      { keys: ['-d', '--debug'], description: 'debug' },
      { keys: ['-n', '--noop'], description: 'noop' },
      { keys: ['-y', '--yes'], description: 'yes' },
    ]
    this.options = [{ keys: ['-f', '--format'], description: 'format' }]
    this.commands = [new SubCmd(['root'])]
  }
}

Deno.test('resolveCanonicalParts - expands aliases to canonical names', () => {
  const cmd = new RootCmd()
  assertEquals(resolveCanonicalParts(cmd, ['s']), ['sub'])
  assertEquals(resolveCanonicalParts(cmd, ['su']), ['sub'])
  assertEquals(resolveCanonicalParts(cmd, ['sub']), ['sub'])
})

Deno.test('resolveCanonicalParts - expands combined short flags to long form', () => {
  const cmd = new RootCmd()
  assertEquals(resolveCanonicalParts(cmd, ['-dn', 'sub']), ['--debug', '--noop', 'sub'])
  assertEquals(resolveCanonicalParts(cmd, ['-y', 'sub']), ['--yes', 'sub'])
})

Deno.test('resolveCanonicalParts - preserves options with values', () => {
  const cmd = new RootCmd()
  assertEquals(resolveCanonicalParts(cmd, ['-f', 'json', 'sub']), ['--format', 'json', 'sub'])
})

Deno.test('resolveCanonicalParts - passes through arguments unchanged', () => {
  const cmd = new RootCmd()
  assertEquals(resolveCanonicalParts(cmd, ['sub', 'foo', 'bar']), ['sub', 'foo', 'bar'])
})

Deno.test('resolveCanonicalParts - flags before and after subcommand', () => {
  const cmd = new RootCmd()
  assertEquals(resolveCanonicalParts(cmd, ['-dn', 's', 'foo']), ['--debug', '--noop', 'sub', 'foo'])
})

Deno.test('resolveCanonicalParts - unknown flags are dropped', () => {
  const cmd = new RootCmd()
  assertEquals(resolveCanonicalParts(cmd, ['-z', 'sub']), ['sub'])
})

Deno.test('CmdBase.process - handles subcommands', async () => {
  const parent = new CmdBase(['root'])
  parent.name = 'parent'

  const child = new TestCmd(['root', 'parent'])
  parent.commands = [child]

  const shell = new NuSh()
  const context = { req_orig: '', req_path: '', req_srch: '' }

  const result = await parent.process(['test', '-s', '-o', 'optval', 'myarg'], shell, context)
  assertEquals(result, 'arg1=myarg, option=optval, switch=1')
})

Deno.test('CmdBase.process - --help flag returns help', async () => {
  const cmd = new TestCmd(['root'])
  const shell = new NuSh()
  const context = { req_orig: '', req_path: '', req_srch: '' }

  const result = await cmd.process(['--help'], shell, context)
  assertStringIncludes(result, 'root test | test command')
})

Deno.test('CmdBase.process - -h flag returns help', async () => {
  const cmd = new TestCmd(['root'])
  const shell = new NuSh()
  const context = { req_orig: '', req_path: '', req_srch: '' }

  const result = await cmd.process(['-h'], shell, context)
  assertStringIncludes(result, 'root test | test command')
})

Deno.test('CmdBase.process - missing required arg returns help', async () => {
  const cmd = new TestCmd(['root'])
  const shell = new NuSh()
  const context = { req_orig: '', req_path: '', req_srch: '' }

  const result = await cmd.process([], shell, context)
  assertStringIncludes(result, 'root test | test command')
})

Deno.test('CmdBase.process - option followed by flag returns help', async () => {
  const cmd = new TestCmd(['root'])
  const shell = new NuSh()
  const context = { req_orig: '', req_path: '', req_srch: '' }

  const result = await cmd.process(['-o', '--switch', 'myarg'], shell, context)
  assertStringIncludes(result, 'root test | test command')
})

Deno.test('CmdBase.process - extra positional args append to last', async () => {
  const cmd = new TestCmd(['root'])
  const shell = new NuSh()
  const context = { req_orig: '', req_path: '', req_srch: '' }
  const env = new EnvBase()

  await cmd.process(['first', 'second', 'third'], shell, context, env)
  assertEquals(env.get(['test', 'arg1']), 'first|second|third')
})
