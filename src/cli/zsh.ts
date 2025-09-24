import { type Cli, CliBase } from '../cli.ts'
import { joinKey } from '../reg.ts'

export class Zshell extends CliBase implements Cli {
  constructor() {
    super('zsh', 'zsh')
  }

  static execStr(value: string): string {
    return `zsh --no-rcs -c ${value}`
  }

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

  override toInner(value: string): string {
    return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "'\\''")}'`
  }

  override toOuter(value: string): string {
    return `'${value}'`
  }

  override trace(): string {
    return 'set -x'
  }

  override varSet(key: Array<string>, value: string): string {
    return `${joinKey(...key)}=${value}`
  }

  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `${joinKey(...key)}=( ${values.join(' ')} )`
  }

  override varUnset(key: Array<string>): string {
    return `unset ${joinKey(...key)}`
  }
}
