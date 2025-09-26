import { type Cli, CliBase } from '../cli.ts'
import { joinKey } from '../reg.ts'

/**
 * This module contains components for building Powershell client implementations
 * @module
 */

/**
 * Powershell implementation of the Cli interface
 * This class provides methods for working with Powershell commands
 */
export class Powershell extends CliBase implements Cli {
  /**
   * Creates a new instance of Powershell.
   */
  constructor() {
    super('pwsh', 'ps1')
  }

  /**
   * Generates an execution string for running a command in Powershell
   * @param value - The command to execute
   * @returns The formatted command string
   */
  static execStr(value: string): string {
    return `pwsh -noprofile -c ${value}`
  }

  /**
   * Creates a gated function that prompts the user for confirmation before executing lines
   * @param name - The name of the operation
   * @param lines - Array of command lines to execute if confirmed
   * @returns Array of strings representing the gated function
   */
  override gatedFunc(name: string, lines: Array<string>): Array<string> {
    return [
      '& {',
      `  $yn = ''`,
      '  if ($YES) {',
      `    $yn = 'y'`,
      '  } else {',
      `    $yn = Read-Host "? ${name} [y, [n]]"`,
      '  }',
      `  if ($yn -ne 'n') {`,
      ...lines,
      '  }',
      '}',
    ]
  }

  /**
   * Converts a value to an inner representation for Powershell
   * @param value - The value to convert
   * @returns The converted value
   */
  override toInner(value: string): string {
    return `'${value.replaceAll("'", "''")}'`
  }

  /**
   * Converts a value to an outer representation for Powershell
   * @param value - The value to convert
   * @returns The converted value
   */
  override toOuter(value: string): string {
    return `'${value}'`
  }

  /**
   * Returns the trace command for Powershell
   * @returns The trace command
   */
  override trace(): string {
    return 'Set-PSDebug -Trace 1'
  }

  /**
   * Sets a variable in the Powershell environment
   * @param key - Array of keys representing the variable path
   * @param value - The value to set
   * @returns The command to set the variable
   */
  override varSet(key: Array<string>, value: string): string {
    return `$${joinKey(...key)} = ${value}`
  }

  /**
   * Sets an array variable in the Powershell environment
   * @param key - Array of keys representing the variable path
   * @param values - Array of values to set
   * @returns The command to set the array variable
   */
  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `$${joinKey(...key)} = ${`@( ${values.join(', ')} )`}`
  }

  /**
   * Unsets a variable from the Powershell environment
   * @param key - Array of keys representing the variable path
   * @returns The command to unset the variable
   */
  override varUnset(key: Array<string>): string {
    return `Remove-Variable ${joinKey(...key)} -ErrorAction SilentlyContinue`
  }
}
