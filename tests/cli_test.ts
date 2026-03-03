import { assertEquals } from '@std/assert'
import { Nushell } from '../src/cli/nu.ts'
import { Powershell } from '../src/cli/pwsh.ts'
import { Zshell } from '../src/cli/zsh.ts'

Deno.test('Nushell - shell-specific syntax', () => {
  const nu = new Nushell()
  assertEquals(nu.varSet(['TEST', 'KEY'], 'value'), '$env.TEST_KEY = value')
  assertEquals(nu.toLiteral("some'value"), "r#'some'value'#")
  assertEquals(nu.toElement('val'), '`val`')
  assertEquals(nu.varSetArr(['ARR'], ['v1', 'v2']), '$env.ARR = [ v1, v2 ]')
  assertEquals(nu.varUnSet(['KEY']), 'hide-env KEY')
})

Deno.test('Powershell - shell-specific syntax', () => {
  const pwsh = new Powershell()
  assertEquals(pwsh.varSet(['TEST', 'KEY'], "'value'"), "$TEST_KEY = 'value'")
  assertEquals(pwsh.toLiteral("some'value"), "'some''value'")
  assertEquals(pwsh.toElement('val'), "'val'")
  assertEquals(pwsh.varSetArr(['ARR'], ["'v1'", "'v2'"]), "$ARR = @( 'v1', 'v2' )")
  assertEquals(pwsh.varUnSet(['KEY']), 'Remove-Variable KEY -ErrorAction SilentlyContinue')
})

Deno.test('Zshell - shell-specific syntax', () => {
  const zsh = new Zshell()
  assertEquals(zsh.varSet(['TEST', 'KEY'], "'value'"), "TEST_KEY='value'")
  assertEquals(zsh.toLiteral("some'value"), String.raw`'some'\''value'`)
  assertEquals(zsh.toElement('val'), "'val'")
  assertEquals(zsh.varSetArr(['ARR'], ["'v1'", "'v2'"]), "ARR=( 'v1' 'v2' )")
  assertEquals(zsh.varUnSet(['KEY']), 'unset KEY')
})
