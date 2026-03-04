import { assertEquals } from '@std/assert'

import { joinKey, joinVal, splitKey, splitVal } from '../src/reg.ts'

Deno.test('joinKey - joins parts with underscores and converts to uppercase', () => {
  assertEquals(joinKey('sh', 'ver', 'major'), 'SH_VER_MAJOR')
  assertEquals(joinKey('test'), 'TEST')
})

Deno.test('splitKey - splits uppercase string into lowercase parts', () => {
  assertEquals(splitKey('SH_VER_MAJOR'), ['sh', 'ver', 'major'])
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
