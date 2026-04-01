import { type Cmd, CmdBase } from './cmd.ts'
import { Fmt } from './serde.ts'

/**
 * This module contains components for building server implementations
 * @module
 */

/**
 * Base implementation of a server command that extends CmdBase
 * Provides standard options and switches for server operations
 */
export class SrvBase extends CmdBase implements Cmd {
  /**
   * Creates a new SrvBase instance
   * @param scopes - Scope path for this command
   */
  constructor(scopes: Array<string>) {
    super(scopes)
    this.options = [
      {
        keys: ['-f', '--format'],
        description: `shell print format [${Object.keys(Fmt).map((k, i) => !i ? k : `[${k}]`).join(', ')}]`,
      },
    ]
    this.switches = [
      { keys: ['-d', '--debug'], description: 'shell print debug' },
      { keys: ['-g', '--grayscale'], description: 'shell print skip color' },
      { keys: ['-h', '--help'], description: 'shell print help' },
      { keys: ['-l', '--log'], description: 'server print log' },
      { keys: ['-n', '--noop'], description: 'shell run skip' },
      { keys: ['-s', '--succinct'], description: 'shell print skip' },
      { keys: ['-t', '--trace'], description: 'shell print trace' },
      { keys: ['-y', '--yes'], description: 'shell run skip prompt' },
    ]
  }
}
