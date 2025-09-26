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
        description: `client print format <${
          Object.keys(Fmt).map((k, i) => i === 0 ? k : `[${k}]`).join(', ')
        }>`,
      },
    ]
    this.switches = [
      { keys: ['-d', '--debug'], description: 'client print debug' },
      { keys: ['-g', '--grayscale'], description: 'client print skip color' },
      { keys: ['-h', '--help'], description: 'client print help' },
      { keys: ['-l', '--log'], description: 'server print log' },
      { keys: ['-n', '--noop'], description: 'client run skip' },
      { keys: ['-s', '--succinct'], description: 'client print skip' },
      { keys: ['-t', '--trace'], description: 'client print trace' },
      { keys: ['-y', '--yes'], description: 'client run skip prompt' },
    ]
  }
}
