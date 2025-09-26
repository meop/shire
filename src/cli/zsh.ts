import { type Cli, CliBase } from '../cli.ts'
import { joinKey } from '../reg.ts'

/**
 * This module contains components for building Zshell client implementations
 * @module
 */

/**
 * Zshell implementation of the Cli interface
 * This class provides methods for working with Zshell commands
 */
export class Zshell extends CliBase implements Cli {
  /**
   * Creates a new instance of Zshell.
   */
  constructor() {
    super('zsh', 'zsh')
  }

  /**
   * Generates an execution string for running a command in Zshell
   * @param value - The command to execute
   * @returns The formatted command string
   */
  static execStr(value: string): string {
    return `zsh --no-rcs -c ${value}`
  }

  /**
   * Creates a gated function that prompts the user for confirmation before executing lines
   * @param name - The name of the operation
   * @param lines - Array of command lines to execute if confirmed
   * @returns Array of strings representing the gated function
   */
  override gatedFunc(name: string, lines: Array<string>): Array<string> {
    return [
      'function () {',
      `  local yn=''`,
      '  if [[ $YES ]]; then',
      `    yn='y'`,
      '  else',
      `    read "yn?? ${name} [y, [n]]: "`,
      '  fi',
      `  if [[ $yn != 'n' ]]; then`,
      ...lines,
      '  fi',
      '}',
    ]
  }

  /**
   * Converts a value to an inner representation for Zshell
   * @param value - The value to convert
   * @returns The converted value
   */
  override toInner(value: string): string {
    return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "'\\''")}'`
  }

  /**
   * Converts a value to an outer representation for Zshell
   * @param value - The value to convert
   * @returns The converted value
   */
  override toOuter(value: string): string {
    return `'${value}'`
  }

  /**
   * Returns the trace command for Zshell.
   * @returns The trace command
   */
  override trace(): string {
    return 'set -x'
  }

  /**
   * Sets a variable in the Zshell environment
   * @param key - Array of keys representing the variable path
   * @param value - The value to set
   * @returns The command to set the variable
   */
  override varSet(key: Array<string>, value: string): string {
    return `${joinKey(...key)}=${value}`
  }

  /**
   * Sets an array variable in the Zshell environment
   * @param key - Array of keys representing the variable path
   * @param values - Array of values to set
   * @returns The command to set the array variable
   */
  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `${joinKey(...key)}=( ${values.join(' ')} )`
  }

  /**
   * Unsets a variable from the Zshell environment
   * @param key - Array of keys representing the variable path
   * @returns The command to unset the variable
   */
  override varUnset(key: Array<string>): string {
    return `unset ${joinKey(...key)}`
  }
}
