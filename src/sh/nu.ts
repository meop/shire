import { joinKey } from '../reg.ts'
import { type Sh, ShBase } from '../sh.ts'

/**
 * This module contains components for building Nushell shell implementations
 * @module
 */

/**
 * Nushell implementation of the Sh interface
 * This class provides methods for working with Nushell shell commands
 */
export class Nushell extends ShBase implements Sh {
  /**
   * Creates a new instance of Nushell.
   */
  constructor() {
    super('nu', 'nu')
  }

  /**
   * Generates an execution string for running a command in Nushell
   * @param value - The command to execute
   * @returns The formatted command string
   */
  static execStr(value: string): string {
    return `nu --no-config-file -c ${value}`
  }

  /**
   * Creates a gated function that prompts the user for confirmation before executing lines
   * @param name - The name of the operation
   * @param lines - Array of command lines to execute if confirmed
   * @returns Array of strings representing the gated function
   */
  override gatedFunc(name: string, lines: Array<string>): Array<string> {
    return [
      'do {',
      `  mut yn = ''`,
      `  if 'YES' in $env {`,
      `    $yn = 'y'`,
      '  } else {',
      `    $yn = input r#'? ${name} [y, [n]]: '#`,
      '  }',
      `  if $yn != 'n' {`,
      ...lines,
      '  }',
      '}',
    ]
  }

  /**
   * Converts a value to a literal string for Nushell using adaptive raw string depth
   * @param value - The value to convert
   * @returns Raw string literal with sufficient hash depth to avoid conflicts
   */
  override toLiteral(value: string): string {
    let depth = 1
    while (value.includes(`'${'#'.repeat(depth)}`)) {
      depth++
    }
    const hash = '#'.repeat(depth)
    return `r${hash}'${value}'${hash}`
  }

  /**
   * Wraps a value as an array element for Nushell (delegates to toLiteral)
   * @param value - The value to wrap
   * @returns Raw string literal
   */
  override toElement(value: string): string {
    return this.toLiteral(value)
  }

  /**
   * Returns the trace command for Nushell (empty as there's no direct equivalent)
   * @returns Empty string
   */
  override trace(): string {
    return '' // no direct equivalent
  }

  /**
   * Sets a variable in the Nushell environment
   * @param key - Array of keys representing the variable path
   * @param value - The value to set
   * @returns The command to set the variable
   */
  override varSet(key: Array<string>, value: string): string {
    return `$env.${joinKey(...key)} = ${value}`
  }

  /**
   * Sets an array variable in the Nushell environment (applies toLiteral to each value)
   * @param key - Array of keys representing the variable path
   * @param values - Array of raw string values to set
   * @returns The command to set the array variable
   */
  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `$env.${joinKey(...key)} = [ ${values.map((v) => this.toLiteral(v ?? '')).join(', ')} ]`
  }

  /**
   * Unsets a variable from the Nushell environment
   * @param key - Array of keys representing the variable path
   * @returns The command to unset the variable
   */
  override varUnSet(key: Array<string>): string {
    return `hide-env ${joinKey(...key)}`
  }
}
