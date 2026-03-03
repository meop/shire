import { assertEquals } from '@std/assert'
import { joinKey, joinVal, splitKey, splitVal } from '../src/reg.ts'

Deno.test('joinKey - joins parts with underscores and converts to uppercase', () => {
  assertEquals(joinKey('cli', 'ver', 'major'), 'CLI_VER_MAJOR')
  assertEquals(joinKey('test'), 'TEST')
})

Deno.test('splitKey - splits uppercase string into lowercase parts', () => {
  assertEquals(splitKey('CLI_VER_MAJOR'), ['cli', 'ver', 'major'])
  assertEquals(splitKey('TEST'), ['test'])
  assertEquals(splitKey(undefined), [])
})

Deno.test('joinVal - joins values with pipes', () => {
  assertEquals(joinVal('a', 'b', 'c'), 'a|b|c')
})

Deno.test('splitVal - splits string with pipes', () => {
  assertEquals(splitVal('a|b|c'), ['a', 'b', 'c'])
  assertEquals(splitVal(undefined), [])
})
