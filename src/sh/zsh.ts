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
   * Generates the invocation flags for running a value as a ZSh script
   * @param value - The command to execute
   * @returns The formatted flags string, without a leading binary name
   */
  override execArgs(value: string): string {
    return `--no-rcs -c ${value}`
  }

  /**
   * Converts a value to a literal string for ZSh
   * @param value - The value to convert
   * @returns Single-quoted string with escaped quotes; zsh reads everything else in single quotes as it is
   */
  override toLiteral(value: string): string {
    return `'${value.replaceAll("'", "'\\''")}'`
  }

  /**
   * Returns the trace command for ZSh.
   * @returns The trace command
   */
  override trace(): string {
    return 'set -x'
  }

  /**
   * Sets an environment variable in the ZSh environment
   * @param key - Array of keys representing the variable path
   * @param value - The value to set
   * @returns The command to set the environment variable
   */
  override envSet(key: Array<string>, value: string): string {
    return `export ${joinKey(...key)}=${value}`
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
