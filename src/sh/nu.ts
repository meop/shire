import { joinKey } from '../reg.ts'
import { type Sh, ShBase } from '../sh.ts'

/**
 * This module contains components for building NuSh shell implementations
 * @module
 */

// nu raises a ctrl-c as an error at its next check, in every nu process it reached, and keeps it pending until a try
// catches it — so the catch below can itself be cut short. the inner try is the catch for that: whichever way the
// interrupt surfaces, the script ends quietly with 130. only the outermost nu prints the newline a shell would, so a
// chain of them prints one
const QUIET_INTERRUPT_HEAD = [
  `let shireOuter = ('SHIRE_NU_NESTED' not-in $env)`,
  `$env.SHIRE_NU_NESTED = '1'`,
  'try {',
]
const QUIET_INTERRUPT_TAIL = [
  '} catch { |e|',
  '  try {',
  `    if ($e.debug =~ '^(Interrupted |TerminatedBySignal \\{ signal_name: "SIGINT"|NonZeroExitCode \\{ exit_code: (130|254),)') or ($e.details.code? == 'nu::shell::io::interrupted') {`,
  `      if $shireOuter { print '' }`,
  '      exit 130',
  '    }',
  '  } catch {',
  `    if $shireOuter { print '' }`,
  '    exit 130',
  '  }',
  '  $e.raw',
  '}',
]

/**
 * NuSh implementation of the Sh interface
 * This class provides methods for working with NuSh shell commands
 */
export class NuSh extends ShBase implements Sh {
  /**
   * Creates a new instance of NuSh.
   */
  constructor() {
    super('nu', 'nu')
  }

  /**
   * Generates the invocation flags for running a value as a NuSh script
   * @param value - The command to execute
   * @returns The formatted flags string, without a leading binary name
   */
  override execArgs(value: string): string {
    return `--no-config-file -c ${value}`
  }

  /**
   * Builds the script, wrapped so a ctrl-c ends it quietly with 130
   * @returns The full shell script as a string
   */
  override build(): string {
    return this.quietInterrupt(super.build())
  }

  /**
   * Wraps a NuSh script so a ctrl-c ends it quietly with exit code 130, as it ends a zsh or pwsh one. any other
   * error is raised again, so nu reports it and exits as it would have
   * @param body - The script to wrap
   * @returns The wrapped script
   */
  override quietInterrupt(body: string): string {
    return [...QUIET_INTERRUPT_HEAD, body, ...QUIET_INTERRUPT_TAIL].join('\n')
  }

  /**
   * Creates a gated function that prompts the user for confirmation before executing lines
   * @param name - The name of the operation
   * @param lines - Array of command lines to execute if confirmed
   * @returns Array of strings representing the gated function
   */
  override gatedFunc(name: string, lines: Array<string>): Array<string> {
    return [
      'do --env {',
      `  mut yn = ''`,
      `  if 'YES' in $env {`,
      `    $yn = 'y'`,
      '  } else {',
      `    $yn = input r#'${name} [y,[n]]: '#`,
      '  }',
      `  if $yn != 'n' {`,
      ...lines,
      '  }',
      '}',
    ]
  }

  /**
   * Converts a value to a literal string for NuSh using adaptive raw string depth
   * @param value - The value to convert
   * @returns Raw string literal with sufficient hash depth to avoid conflicts
   */
  override toLiteral(value: string): string {
    // nu's raw string parser misreads r#'#... as an unclosed delimiter when the leading run of '#'
    // in the content is at least as long as the opening depth, so the depth must clear that run too
    const leadingHashes = value.match(/^#*/)?.[0].length ?? 0
    let depth = 1
    while (value.includes(`'${'#'.repeat(depth)}`) || depth <= leadingHashes) {
      depth++
    }
    const hash = '#'.repeat(depth)
    return `r${hash}'${value}'${hash}`
  }

  /**
   * Returns the trace command for NuSh (empty as there's no direct equivalent)
   * @returns Empty string
   */
  override trace(): string {
    return '' // no direct equivalent
  }

  /**
   * Sets a variable in the NuSh environment
   * @param key - Array of keys representing the variable path
   * @param value - The value to set
   * @returns The command to set the variable
   */
  override varSet(key: Array<string>, value: string): string {
    return `$env.${joinKey(...key)} = ${value}`
  }

  /**
   * Sets an array variable in the NuSh environment (applies toLiteral to each value)
   * @param key - Array of keys representing the variable path
   * @param values - Array of raw string values to set
   * @returns The command to set the array variable
   */
  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `$env.${joinKey(...key)} = [ ${values.map((v) => this.toLiteral(v ?? '')).join(', ')} ]`
  }

  /**
   * Unsets a variable from the NuSh environment
   * @param key - Array of keys representing the variable path
   * @returns The command to unset the variable
   */
  override varUnSet(key: Array<string>): string {
    return `hide-env ${joinKey(...key)}`
  }
}
