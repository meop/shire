import { assertEquals } from '@std/assert'
import { SrvBase } from '../src/srv.ts'

Deno.test('SrvBase - has standard options and switches', () => {
  const srv = new SrvBase([])
  
  const optionKeys = srv.options.flatMap(o => o.keys)
  assertEquals(optionKeys.includes('-f'), true)
  assertEquals(optionKeys.includes('--format'), true)

  const switchKeys = srv.switches.flatMap(s => s.keys)
  assertEquals(switchKeys.includes('-d'), true)
  assertEquals(switchKeys.includes('--debug'), true)
  assertEquals(switchKeys.includes('-h'), true)
  assertEquals(switchKeys.includes('--help'), true)
  assertEquals(switchKeys.includes('-y'), true)
  assertEquals(switchKeys.includes('--yes'), true)
})
