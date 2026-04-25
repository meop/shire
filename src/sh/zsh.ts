import { joinKey } from '../reg.ts'
import { type Sh, ShBase } from '../sh.ts'

/**
 * This module contains components for building ZSh shell implementations
 * @module
 */

/**
 * ZSh implementation of the Sh interface
 * This class provides methods for working with ZSh commands
 */
export class ZSh extends ShBase implements Sh {
  /**
   * Creates a new instance of ZSh.
   */
  constructor() {
    super('zsh', 'zsh')
  }

  /**
   * Generates an execution string for running a command in ZSh
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
      `    read "yn?${name} [y, [n]]: "`,
      '  fi',
      `  if [[ $yn != 'n' ]]; then`,
      ...lines,
      '  fi',
      '}',
    ]
  }

  /**
   * Converts a value to a literal string for ZSh
   * @param value - The value to convert
   * @returns Single-quoted string with escaped quotes and backslashes
   */
  override toLiteral(value: string): string {
    return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "'\\''")}'`
  }

  /**
   * Wraps a value as an array element for ZSh
   * @param value - The value to wrap
   * @returns Single-quoted value
   */
  override toElement(value: string): string {
    return `'${value}'`
  }

  /**
   * Returns the trace command for ZSh.
   * @returns The trace command
   */
  override trace(): string {
    return 'set -x'
  }

  /**
   * Sets a variable in the ZSh environment
   * @param key - Array of keys representing the variable path
   * @param value - The value to set
   * @returns The command to set the variable
   */
  override varSet(key: Array<string>, value: string): string {
    return `${joinKey(...key)}=${value}`
  }

  /**
   * Sets an array variable in the ZSh environment (applies toLiteral to each value)
   * @param key - Array of keys representing the variable path
   * @param values - Array of raw string values to set
   * @returns The command to set the array variable
   */
  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `${joinKey(...key)}=( ${values.map((v) => this.toLiteral(v ?? '')).join(' ')} )`
  }

  /**
   * Unsets a variable from the ZSh environment
   * @param key - Array of keys representing the variable path
   * @returns The command to unset the variable
   */
  override varUnSet(key: Array<string>): string {
    return `unset ${joinKey(...key)}`
  }
}
