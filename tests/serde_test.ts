import { assertEquals } from '@std/assert'
import { Fmt, parse, stringify, toFmt } from '../src/serde.ts'

Deno.test('toFmt - converts string to format', () => {
  assertEquals(toFmt('json'), Fmt.json)
  assertEquals(toFmt('yaml'), Fmt.yaml)
  assertEquals(toFmt('other'), Fmt.yaml) // Default to yaml
})

Deno.test('parse and stringify - JSON', () => {
  const data = { a: 1, b: 'test' }
  const json = JSON.stringify(data, null, 2)
  assertEquals(parse(json, Fmt.json), data)
  assertEquals(stringify(data, Fmt.json), json)
})

Deno.test('parse and stringify - YAML', () => {
  const data = { a: 1, b: 'test' }
  // The @eemeli/yaml stringify might have different indentation or formatting
  const result = stringify(data, Fmt.yaml)
  assertEquals(parse(result, Fmt.yaml), data)
})

Deno.test('parse - handles empty input', () => {
  assertEquals(parse('', Fmt.json), null)
})

Deno.test('stringify - handles null/undefined', () => {
  assertEquals(stringify(null, Fmt.json), '')
  assertEquals(stringify(undefined, Fmt.json), '')
})
