import { assertEquals } from '@std/assert'

import { CmdBase, toExpandedParts } from '../src/cmd.ts'
import type { Ctx } from '../src/ctx.ts'
import { EnvBase } from '../src/env.ts'
import { Nushell } from '../src/sh/nu.ts'
import type { Sh } from '../src/sh.ts'

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
  const shell = new Nushell()
  const context = { req_orig: '', req_path: '', req_srch: '' }
  const env = new EnvBase()

  const result = await cmd.process(['-s', '-o', 'optval', 'myarg'], shell, context, env)
  assertEquals(result, 'arg1=myarg, option=optval, switch=1')
})

Deno.test('CmdBase.process - handles subcommands', async () => {
  const parent = new CmdBase(['root'])
  parent.name = 'parent'

  const child = new TestCmd(['root', 'parent'])
  parent.commands = [child]

  const shell = new Nushell()
  const context = { req_orig: '', req_path: '', req_srch: '' }

  const result = await parent.process(['test', '-s', '-o', 'optval', 'myarg'], shell, context)
  assertEquals(result, 'arg1=myarg, option=optval, switch=1')
})
