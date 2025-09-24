import * as YAML from '@eemeli/yaml'

export enum Fmt {
  yaml = 'yaml',
  json = 'json',
}

export function toFmt(input: string): Fmt {
  if (input === 'json') {
    return Fmt.json
  }
  return Fmt.yaml
}

// deno-lint-ignore no-explicit-any
export function parse(input: string, format: Fmt): any {
  if (!input) {
    return null
  }
  if (format === Fmt.yaml) {
    return YAML.parse(input)
  }
  if (format === Fmt.json) {
    return JSON.parse(input)
  }
  return input
}

export function stringify<T>(input: T, format: Fmt): string {
  let output: string
  if (!input) {
    output = ''
  } else if (format === Fmt.yaml) {
    output = YAML.stringify(input)
  } else {
    output = JSON.stringify(input, null, 2)
  }
  return output.trimEnd()
}
