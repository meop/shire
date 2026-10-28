import { assertEquals } from '@std/assert'

import { NuSh } from './sh/nu.ts'
import { PowerSh } from './sh/pwsh.ts'
import { ZSh } from './sh/zsh.ts'

Deno.test('NuSh - toLiteral uses adaptive raw string depth', () => {
  const nu = new NuSh()
  // no conflict: depth 1
  assertEquals(nu.toLiteral('hello'), "r#'hello'#")
  // single quote no hash: depth 1 (no '# in value)
  assertEquals(nu.toLiteral("some'value"), "r#'some'value'#")
  // value contains '#: depth 2
  assertEquals(nu.toLiteral("r#'nested'#"), "r##'r#'nested'#'##")
  // value contains '##: depth 3
  assertEquals(nu.toLiteral("r##'deep'##"), "r###'r##'deep'##'###")
})

Deno.test("NuSh - toLiteral bumps depth when value starts with '#' (nu misparses r#'#... as unclosed)", () => {
  const nu = new NuSh()
  // leading '#' at depth 1 would misparse: bump to depth 2
  assertEquals(nu.toLiteral('# comment\nrest'), "r##'# comment\nrest'##")
  // leading '##' needs depth 3, not just 2
  assertEquals(nu.toLiteral('##double'), "r###'##double'###")
  // '#' elsewhere (not leading) is unaffected: depth 1 still safe
  assertEquals(nu.toLiteral('hello # world'), "r#'hello # world'#")
})

Deno.test('NuSh - varSetArr applies toLiteral to each value', () => {
  const nu = new NuSh()
  assertEquals(nu.varSetArr(['ARR'], ['v1', 'v2']), "$env.ARR = [ r#'v1'#, r#'v2'# ]")
  assertEquals(nu.varSetArr(['ARR'], []), '$env.ARR = [  ]')
  // null guard: undefined coerced to empty string
  assertEquals(nu.varSetArr(['ARR'], [undefined as unknown as string]), "$env.ARR = [ r#''# ]")
})

Deno.test('NuSh - varSetStr applies toLiteral internally', () => {
  const nu = new NuSh()
  assertEquals(nu.varSetStr(['KEY'], 'value'), "$env.KEY = r#'value'#")
  assertEquals(nu.varSetStr(['TEST', 'KEY'], "it's"), "$env.TEST_KEY = r#'it's'#")
})

Deno.test('NuSh - envSet and envSetStr', () => {
  const nu = new NuSh()
  assertEquals(nu.envSet(['TEST', 'KEY'], 'value'), '$env.TEST_KEY = value')
  assertEquals(nu.envSetStr(['KEY'], 'value'), "$env.KEY = r#'value'#")
})

Deno.test('NuSh - varSet and varUnSet', () => {
  const nu = new NuSh()
  assertEquals(nu.varSet(['TEST', 'KEY'], 'value'), '$env.TEST_KEY = value')
  assertEquals(nu.varUnSet(['KEY']), 'hide-env KEY')
})

Deno.test('PowerSh - toLiteral escapes single quotes', () => {
  const pwsh = new PowerSh()
  assertEquals(pwsh.toLiteral('hello'), "'hello'")
  assertEquals(pwsh.toLiteral("some'value"), "'some''value'")
  assertEquals(pwsh.toLiteral("it''s"), "'it''''s'")
})

Deno.test('PowerSh - varSetArr applies toLiteral to raw values', () => {
  const pwsh = new PowerSh()
  assertEquals(pwsh.varSetArr(['ARR'], ['v1', 'v2']), "$ARR = @( 'v1', 'v2' )")
  assertEquals(pwsh.varSetArr(['ARR'], ["it's"]), "$ARR = @( 'it''s' )")
  assertEquals(pwsh.varSetArr(['ARR'], []), '$ARR = @(  )')
})

Deno.test('PowerSh - varSetStr applies toLiteral internally', () => {
  const pwsh = new PowerSh()
  assertEquals(pwsh.varSetStr(['KEY'], 'value'), "$KEY = 'value'")
  assertEquals(pwsh.varSetStr(['TEST', 'KEY'], "'value'"), "$TEST_KEY = '''value'''")
})

Deno.test('PowerSh - envSet and envSetStr', () => {
  const pwsh = new PowerSh()
  assertEquals(pwsh.envSet(['TEST', 'KEY'], "'value'"), "$env:TEST_KEY = 'value'")
  assertEquals(pwsh.envSetStr(['KEY'], "it's"), "$env:KEY = 'it''s'")
})

Deno.test('PowerSh - varSet and varUnSet', () => {
  const pwsh = new PowerSh()
  assertEquals(pwsh.varSet(['TEST', 'KEY'], "'value'"), "$TEST_KEY = 'value'")
  assertEquals(pwsh.varUnSet(['KEY']), 'Remove-Variable KEY -ErrorAction SilentlyContinue')
})

Deno.test('ZSh - toLiteral escapes single quotes and leaves backslashes as they are', () => {
  const zsh = new ZSh()
  assertEquals(zsh.toLiteral('hello'), "'hello'")
  assertEquals(zsh.toLiteral("some'value"), String.raw`'some'\''value'`)
  // zsh reads single quotes as they are, so a doubled backslash would reach the script doubled
  assertEquals(zsh.toLiteral('back\\slash'), String.raw`'back\slash'`)
})

Deno.test('ZSh - varSetArr applies toLiteral to raw values', () => {
  const zsh = new ZSh()
  assertEquals(zsh.varSetArr(['ARR'], ['v1', 'v2']), "ARR=( 'v1' 'v2' )")
  assertEquals(zsh.varSetArr(['ARR'], ["it's"]), String.raw`ARR=( 'it'\''s' )`)
  assertEquals(zsh.varSetArr(['ARR'], []), 'ARR=(  )')
})

Deno.test('ZSh - varSetStr applies toLiteral internally', () => {
  const zsh = new ZSh()
  assertEquals(zsh.varSetStr(['KEY'], 'value'), "KEY='value'")
  assertEquals(zsh.varSetStr(['TEST', 'KEY'], "'value'"), "TEST_KEY=''\\''value'\\'''")
})

Deno.test('ZSh - envSet and envSetStr', () => {
  const zsh = new ZSh()
  assertEquals(zsh.envSet(['TEST', 'KEY'], "'value'"), "export TEST_KEY='value'")
  assertEquals(zsh.envSetStr(['KEY'], 'value'), "export KEY='value'")
})

Deno.test('ZSh - varSet and varUnSet', () => {
  const zsh = new ZSh()
  assertEquals(zsh.varSet(['TEST', 'KEY'], "'value'"), "TEST_KEY='value'")
  assertEquals(zsh.varUnSet(['KEY']), 'unset KEY')
})

Deno.test('ZSh - toLiteral reads back in zsh as the value it was given', async () => {
  const value = String.raw`a\b 'q' \{ $HOME "d"`
  try {
    const out = await new Deno.Command('zsh', { args: ['-f', '-c', `print -rn -- ${new ZSh().toLiteral(value)}`] })
      .output()
    assertEquals(new TextDecoder().decode(out.stdout), value)
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) {
      throw e
    }
  }
})

async function pwshOp(script: string, env: Record<string, string> = {}): Promise<string | undefined> {
  const op = new URL('./sh/pwsh/op.ps1', import.meta.url).pathname
  try {
    const out = await new Deno.Command('pwsh', { args: ['-NoProfile', '-c', `. '${op}'; ${script}`], env }).output()
    return new TextDecoder().decode(out.stdout)
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) {
      throw e
    }
  }
}

Deno.test('PowerSh - sudo runs the command as it is when already elevated', async () => {
  const out = await pwshOp("function opIsElevated { $true }; sudo printf '%s|' a 'b c'")
  if (out !== undefined) {
    assertEquals(out, 'a|b c|')
  }
})

Deno.test({
  name: 'PowerSh - sudo is the system sudo when not elevated',
  ignore: Deno.build.os === 'windows',
  fn: async () => {
    const dir = await Deno.makeTempDir()
    try {
      await Deno.writeTextFile(`${dir}/sudo`, '#!/bin/sh\nprintf sudo:\nprintf \'%s|\' "$@"\n', { mode: 0o755 })
      const out = await pwshOp("sudo printf x 'y z'", { PATH: `${dir}:${Deno.env.get('PATH')}` })
      if (out !== undefined) {
        assertEquals(out, 'sudo:printf|x|y z|')
      }
    } finally {
      await Deno.remove(dir, { recursive: true })
    }
  },
})
