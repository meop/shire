import { joinKey } from '../reg.ts'
import { type Sh, ShBase } from '../sh.ts'

/**
 * This module contains components for building PowerSh shell implementations
 * @module
 */

/**
 * PowerSh implementation of the Sh interface
 * This class provides methods for working with PowerSh commands
 */
export class PowerSh extends ShBase implements Sh {
  /**
   * Creates a new instance of PowerSh.
   */
  constructor() {
    super('pwsh', 'ps1')
  }

  /**
   * Generates an execution string for running a command in PowerSh
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
   * Converts a value to a literal string for PowerSh
   * @param value - The value to convert
   * @returns Single-quoted string with escaped quotes
   */
  override toLiteral(value: string): string {
    return `'${value.replaceAll("'", "''")}'`
  }

  /**
   * Wraps a value as an array element for PowerSh
   * @param value - The value to wrap
   * @returns Single-quoted value
   */
  override toElement(value: string): string {
    return `'${value}'`
  }

  /**
   * Returns the trace command for PowerSh
   * @returns The trace command
   */
  override trace(): string {
    return 'Set-PSDebug -Trace 1'
  }

  /**
   * Sets a variable in the PowerSh environment
   * @param key - Array of keys representing the variable path
   * @param value - The value to set
   * @returns The command to set the variable
   */
  override varSet(key: Array<string>, value: string): string {
    return `$${joinKey(...key)} = ${value}`
  }

  /**
   * Sets an array variable in the PowerSh environment (applies toLiteral to each value)
   * @param key - Array of keys representing the variable path
   * @param values - Array of raw string values to set
   * @returns The command to set the array variable
   */
  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `$${joinKey(...key)} = @( ${values.map((v) => this.toLiteral(v ?? '')).join(', ')} )`
  }

  /**
   * Unsets a variable from the PowerSh environment
   * @param key - Array of keys representing the variable path
   * @returns The command to unset the variable
   */
  override varUnSet(key: Array<string>): string {
    return `Remove-Variable ${joinKey(...key)} -ErrorAction SilentlyContinue`
  }
}
