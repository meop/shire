/**
 * This module contains components for building client implementations
 * @module
 */

/**
 * Interface defining the contract for client implementations
 */
export interface Cli {
  /**
   * Name of the client implementation
   * @example "nu", "pwsh", "zsh"
   */
  name: string

  /**
   * File extension used for client files
   * @example "nu", "ps1", "zsh"
   */
  extension: string

  /**
   * Builds and returns the complete client script content
   * @returns The full client script as a string
   */
  build(): string

  /**
   * Loads a file from the client's directory structure
   * @param parts - Path components to locate the file
   * @param urlResolver - Optional function to resolve URLs
   * @param urlResolverBase - Base path for URL resolution
   * @returns Promise resolving to file content as string
   */
  fileLoad(
    parts: Array<string>,
    urlResolver?: (specifier: string) => string,
    urlResolverBase?: Array<string>,
  ): Promise<string>
  /**
   * Generates gated function content based on name and lines
   * @param name - Name of the gated function
   * @param lines - Lines to process for gated function
   * @returns Array of processed lines
   */
  gatedFunc(name: string, lines: Array<string>): Array<string>

  /**
   * Prints lines using standard output
   * @param lines - Lines to print
   * @returns Array of formatted lines
   */
  print(lines: string | Array<string>): Array<string>
  /**
   * Prints command lines with special formatting
   * @param lines - Lines to print as commands
   * @returns Array of formatted command lines
   */
  printCmd(lines: string | Array<string>): Array<string>
  /**
   * Prints error lines with error formatting
   * @param lines - Lines to print as errors
   * @returns Array of formatted error lines
   */
  printErr(lines: string | Array<string>): Array<string>
  /**
   * Prints informational lines with info formatting
   * @param lines - Lines to print as information
   * @returns Array of formatted info lines
   */
  printInfo(lines: string | Array<string>): Array<string>
  /**
   * Prints success lines with success formatting
   * @param lines - Lines to print as success messages
   * @returns Array of formatted success lines
   */
  printSucc(lines: string | Array<string>): Array<string>
  /**
   * Prints warning lines with warning formatting
   * @param lines - Lines to print as warnings
   * @returns Array of formatted warning lines
   */
  printWarn(lines: string | Array<string>): Array<string>

  /**
   * Converts a value to a literal string safe for use in shell code
   * Used for variable assignments and arguments that should not be interpolated
   * @param value - Value to convert
   * @returns Escaped literal string representation
   */
  toLiteral: (value: string) => string
  /**
   * Wraps a value as an array element
   * Used when building array structures with varSetArr
   * @param value - Value to wrap
   * @returns Wrapped value suitable for array element
   */
  toElement: (value: string) => string

  /**
   * Generates trace information
   * @returns Trace information as string
   */
  trace(): string

  /**
   * Sets a variable with specified key and value
   * @param key - Variable key components
   * @param value - Value to set
   * @returns String representation of the operation
   */
  varSet(key: Array<string>, value: string): string
  /**
   * Sets an array variable with specified key and values
   * @param key - Variable key components
   * @param values - Array of values to set
   * @returns String representation of the operation
   */
  varSetArr(key: Array<string>, values: Array<string>): string
  /**
   * Unsets a variable with specified key
   * @param key - Variable key components
   * @returns String representation of the operation
   */
  varUnSet(key: Array<string>): string

  /**
   * Adds lines to the output buffer
   * @param lines - Lines to add
   * @returns This instance for chaining
   */
  with(lines: string | Array<string>): Cli
}

/**
 * Helper function to format print operations
 * @param client - Client instance
 * @param lines - Lines to process
 * @param op - Operation type for formatting
 * @returns Formatted array of lines
 */
export function toPrint(
  client: Cli,
  lines: string | Array<string>,
  op: string,
): Array<string> {
  return (typeof lines === 'string' ? [lines] : lines).map(
    (l) => `${op} ${client.toLiteral(l)}`,
  )
}

/**
 * Base implementation of the client interface
 */
export class CliBase implements Cli {
  /**
   * Name of the client implementation
   */
  name: string

  /**
   * File extension used for client files
   */
  extension: string

  /**
   * Lines stored in the output buffer
   */
  lines: Array<string | Array<string>> = []

  /**
   * Creates a new CliBase instance
   * @param name - Name of client implementation
   * @param extension - File extension for client files
   */
  constructor(name: string, extension: string) {
    this.name = name
    this.extension = extension
  }

  /**
   * Builds and returns the complete client script content
   * @returns The full client script as a string
   */
  build(): string {
    const lines: Array<string> = []
    for (const line of this.lines) {
      lines.push(...(typeof line === 'string' ? [line] : line))
      lines.push('')
    }
    return lines.join('\n')
  }

  /**
   * Abstract method for generating gated function content
   * @param _name - Name of the gated function (not used in base implementation)
   * @param _lines - Lines to gate (not used in base implementation)
   * @returns Array of gated lines
   */
  gatedFunc(_name: string, _lines: Array<string>): Array<string> {
    throw new Error('abstract')
  }

  /**
   * Loads a file from the client's directory structure
   * @param parts - Path components to locate the file
   * @param urlResolver - Optional function to resolve URLs
   * @param urlResolverBase - Base path for URL resolution
   * @returns Promise resolving to file content as string
   */
  async fileLoad(
    parts: Array<string>,
    urlResolver?: (specifier: string) => string,
    urlResolverBase?: Array<string>,
  ): Promise<string> {
    let _path = [...(urlResolverBase ?? ['.']), 'cli', this.name, ...parts]
      .join(
        '/',
      )
    if (!_path.endsWith(`.${this.extension}`)) {
      _path = `${_path}.${this.extension}`
    }
    const fetchPath = urlResolver ? urlResolver(_path) : import.meta.resolve(_path)
    try {
      const res = await fetch(fetchPath)
      if (res.ok) {
        return await res.text()
      }
    } catch (e: unknown) {
      if (!(e instanceof TypeError)) {
        throw e
      }
    }
    return ''
  }

  /**
   * Prints lines using standard output
   * @param lines - Lines to print
   * @returns Array of formatted lines
   */
  print(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrint')
  }

  /**
   * Prints command lines with special formatting
   * @param lines - Lines to print as commands
   * @returns Array of formatted command lines
   */
  printCmd(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintCmd')
  }

  /**
   * Prints error lines with error formatting
   * @param lines - Lines to print as errors
   * @returns Array of formatted error lines
   */
  printErr(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintErr')
  }

  /**
   * Prints informational lines with info formatting
   * @param lines - Lines to print as information
   * @returns Array of formatted info lines
   */
  printInfo(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintInfo')
  }

  /**
   * Prints success lines with success formatting
   * @param lines - Lines to print as success messages
   * @returns Array of formatted success lines
   */
  printSucc(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintSucc')
  }

  /**
   * Prints warning lines with warning formatting
   * @param lines - Lines to print as warnings
   * @returns Array of formatted warning lines
   */
  printWarn(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintWarn')
  }

  /**
   * Converts a value to a literal string safe for use in shell code
   * @param _value - Value to convert (not used in base implementation)
   * @returns Escaped literal string representation
   */
  toLiteral(_value: string): string {
    throw new Error('abstract')
  }

  /**
   * Wraps a value as an array element
   * @param _value - Value to wrap (not used in base implementation)
   * @returns Wrapped value suitable for array element
   */
  toElement(_value: string): string {
    throw new Error('abstract')
  }

  /**
   * Generates trace information
   * @returns Trace information as string
   */
  trace(): string {
    throw new Error('abstract')
  }

  /**
   * Sets a variable with specified key and value
   * @param _key - Variable key components (not used in base implementation)
   * @param _value - Value to set (not used in base implementation)
   * @returns String representation of the operation
   */
  varSet(_key: Array<string>, _value: string): string {
    throw new Error('abstract')
  }

  /**
   * Sets an array variable with specified key and values
   * @param _key - Variable key components (not used in base implementation)
   * @param _values - Array of values to set (not used in base implementation)
   * @returns String representation of the operation
   */
  varSetArr(_key: Array<string>, _values: Array<string>): string {
    throw new Error('abstract')
  }

  /**
   * Unsets a variable with specified key
   * @param _key - Variable key components (not used in base implementation)
   * @returns String representation of the operation
   */
  varUnSet(_key: Array<string>): string {
    throw new Error('abstract')
  }

  /**
   * Adds lines to the output buffer
   * @param lines - Lines to add
   * @returns This instance for chaining
   */
  with(lines: string | Array<string>): this {
    this.lines.push(lines)
    return this
  }
}
