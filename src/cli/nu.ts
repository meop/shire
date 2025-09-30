import { type Cli, CliBase } from '../cli.ts'
import { joinKey } from '../reg.ts'

/**
 * This module contains components for building Nushell client implementations
 * @module
 */

/**
 * Nushell implementation of the Cli interface
 * This class provides methods for working with Nushell shell commands
 */
export class Nushell extends CliBase implements Cli {
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
      '  try {',
      `    mut yn = ''`,
      `    if 'YES' in $env {`,
      `      $yn = 'y'`,
      '    } else {',
      `      $yn = input r#'? ${name} [y, [n]]: '#`,
      '    }',
      `    if $yn != 'n' {`,
      ...lines,
      '    }',
      '  } catch { |e|',
      `    if not (($e.msg | str downcase) == 'i/o error') {`,
      '      throw $e',
      '    }',
      '  }',
      '}',
    ]
  }

  /**
   * Converts a value to an inner representation for Nushell
   * @param value - The value to convert
   * @returns The converted value
   */
  override toInner(value: string): string {
    return `r#'${value}'#`
  }

  /**
   * Converts a value to an outer representation for Nushell
   * @param value - The value to convert
   * @returns The converted value
   */
  override toOuter(value: string): string {
    return `\`${value}\``
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
   * Sets an array variable in the Nushell environment
   * @param key - Array of keys representing the variable path
   * @param values - Array of values to set
   * @returns The command to set the array variable
   */
  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `$env.${joinKey(...key)} = [ ${values.join(', ')} ]`
  }

  /**
   * Unsets a variable from the Nushell environment
   * @param key - Array of keys representing the variable path
   * @returns The command to unset the variable
   */
  override varUnset(key: Array<string>): string {
    return `hide-env ${joinKey(...key)}`
  }
}
