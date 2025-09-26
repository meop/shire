import * as YAML from '@eemeli/yaml'

/**
 * This module contains components for building serialization / deserialization implementations
 * @module
 */

/**
 * Enumeration of supported formats for serialization/deserialization
 */
export enum Fmt {
  yaml = 'yaml',
  json = 'json',
}

/**
 * Converts a string input to a Fmt enum value
 * @param input - The string to convert to format
 * @returns The corresponding Fmt enum value
 */
export function toFmt(input: string): Fmt {
  if (input === 'json') {
    return Fmt.json
  }
  return Fmt.yaml
}

/**
 * Parses input string based on the specified format
 * @param input - The input string to parse
 * @param format - The format to use for parsing
 * @returns The parsed result or null if input is empty
 */
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

/**
 * Stringifies input data based on the specified format
 * @param input - The data to stringify
 * @param format - The format to use for stringification
 * @returns The stringified result
 */
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
