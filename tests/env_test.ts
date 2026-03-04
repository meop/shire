import { assertEquals } from '@std/assert'

import { EnvBase } from '../src/env.ts'

Deno.test('EnvBase - get and set', () => {
  const env = new EnvBase()
  env.set(['test', 'key'], 'value')
  assertEquals(env.get(['test', 'key']), 'value')
  assertEquals(env.get(['invalid']), undefined)
})

Deno.test('EnvBase - getSplit', () => {
  const env = new EnvBase()
  env.set(['tags'], 'a|b|c')
  assertEquals(env.getSplit(['tags']), ['a', 'b', 'c'])
  assertEquals(env.getSplit(['invalid']), [])
})

Deno.test('EnvBase - setAppend', () => {
  const env = new EnvBase()
  env.setAppend(['tags'], 'a')
  assertEquals(env.get(['tags']), 'a')
  env.setAppend(['tags'], 'b')
  assertEquals(env.get(['tags']), 'a|b')
})
