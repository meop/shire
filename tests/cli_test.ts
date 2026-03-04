import { assertEquals } from '@std/assert'
import { Nushell } from '../src/cli/nu.ts'
import { Powershell } from '../src/cli/pwsh.ts'
import { Zshell } from '../src/cli/zsh.ts'

Deno.test('Nushell - toLiteral uses adaptive raw string depth', () => {
  const nu = new Nushell()
  // no conflict: depth 1
  assertEquals(nu.toLiteral('hello'), "r#'hello'#")
  // single quote no hash: depth 1 (no '# in value)
  assertEquals(nu.toLiteral("some'value"), "r#'some'value'#")
  // value contains '#: depth 2
  assertEquals(nu.toLiteral("r#'nested'#"), "r##'r#'nested'#'##")
  // value contains '##: depth 3
  assertEquals(nu.toLiteral("r##'deep'##"), "r###'r##'deep'##'###")
})

Deno.test('Nushell - toElement delegates to toLiteral (no backtick)', () => {
  const nu = new Nushell()
  assertEquals(nu.toElement('val'), "r#'val'#")
  assertEquals(nu.toElement("r#'nested'#"), "r##'r#'nested'#'##")
})

Deno.test('Nushell - varSetArr applies toLiteral to each value', () => {
  const nu = new Nushell()
  assertEquals(nu.varSetArr(['ARR'], ['v1', 'v2']), "$env.ARR = [ r#'v1'#, r#'v2'# ]")
  assertEquals(nu.varSetArr(['ARR'], []), '$env.ARR = [  ]')
  // null guard: undefined coerced to empty string
  assertEquals(nu.varSetArr(['ARR'], [undefined as unknown as string]), "$env.ARR = [ r#''# ]")
})

Deno.test('Nushell - varSetStr applies toLiteral internally', () => {
  const nu = new Nushell()
  assertEquals(nu.varSetStr(['KEY'], 'value'), "$env.KEY = r#'value'#")
  assertEquals(nu.varSetStr(['TEST', 'KEY'], "it's"), "$env.TEST_KEY = r#'it's'#")
})

Deno.test('Nushell - varSet and varUnSet', () => {
  const nu = new Nushell()
  assertEquals(nu.varSet(['TEST', 'KEY'], 'value'), '$env.TEST_KEY = value')
  assertEquals(nu.varUnSet(['KEY']), 'hide-env KEY')
})

Deno.test('Powershell - toLiteral escapes single quotes', () => {
  const pwsh = new Powershell()
  assertEquals(pwsh.toLiteral('hello'), "'hello'")
  assertEquals(pwsh.toLiteral("some'value"), "'some''value'")
  assertEquals(pwsh.toLiteral("it''s"), "'it''''s'")
})

Deno.test('Powershell - toElement wraps without escaping', () => {
  const pwsh = new Powershell()
  // toElement wraps with single quotes but does not escape — callers should pass pre-quoted or safe values
  assertEquals(pwsh.toElement('val'), "'val'")
})

Deno.test('Powershell - varSetArr applies toLiteral to raw values', () => {
  const pwsh = new Powershell()
  assertEquals(pwsh.varSetArr(['ARR'], ['v1', 'v2']), "$ARR = @( 'v1', 'v2' )")
  assertEquals(pwsh.varSetArr(['ARR'], ["it's"]), "$ARR = @( 'it''s' )")
  assertEquals(pwsh.varSetArr(['ARR'], []), '$ARR = @(  )')
})

Deno.test('Powershell - varSetStr applies toLiteral internally', () => {
  const pwsh = new Powershell()
  assertEquals(pwsh.varSetStr(['KEY'], 'value'), "$KEY = 'value'")
  assertEquals(pwsh.varSetStr(['TEST', 'KEY'], "'value'"), "$TEST_KEY = '''value'''")
})

Deno.test('Powershell - varSet and varUnSet', () => {
  const pwsh = new Powershell()
  assertEquals(pwsh.varSet(['TEST', 'KEY'], "'value'"), "$TEST_KEY = 'value'")
  assertEquals(pwsh.varUnSet(['KEY']), 'Remove-Variable KEY -ErrorAction SilentlyContinue')
})

Deno.test('Zshell - toLiteral escapes single quotes and backslashes', () => {
  const zsh = new Zshell()
  assertEquals(zsh.toLiteral('hello'), "'hello'")
  assertEquals(zsh.toLiteral("some'value"), String.raw`'some'\''value'`)
  assertEquals(zsh.toLiteral('back\\slash'), String.raw`'back\\slash'`)
})

Deno.test('Zshell - toElement wraps without escaping', () => {
  const zsh = new Zshell()
  // toElement wraps with single quotes but does not escape — callers should pass pre-quoted or safe values
  assertEquals(zsh.toElement('val'), "'val'")
})

Deno.test('Zshell - varSetArr applies toLiteral to raw values', () => {
  const zsh = new Zshell()
  assertEquals(zsh.varSetArr(['ARR'], ['v1', 'v2']), "ARR=( 'v1' 'v2' )")
  assertEquals(zsh.varSetArr(['ARR'], ["it's"]), String.raw`ARR=( 'it'\''s' )`)
  assertEquals(zsh.varSetArr(['ARR'], []), 'ARR=(  )')
})

Deno.test('Zshell - varSetStr applies toLiteral internally', () => {
  const zsh = new Zshell()
  assertEquals(zsh.varSetStr(['KEY'], 'value'), "KEY='value'")
  assertEquals(zsh.varSetStr(['TEST', 'KEY'], "'value'"), "TEST_KEY=''\\''value'\\'''")
})

Deno.test('Zshell - varSet and varUnSet', () => {
  const zsh = new Zshell()
  assertEquals(zsh.varSet(['TEST', 'KEY'], "'value'"), "TEST_KEY='value'")
  assertEquals(zsh.varUnSet(['KEY']), 'unset KEY')
})
