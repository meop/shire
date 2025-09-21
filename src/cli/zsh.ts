import { type Cli, CliBase } from '../cli.ts'

export class Zshell extends CliBase implements Cli {
  constructor() {
    super('zsh', 'zsh')
  }

  static execStr(value: string) {
    return `zsh --no-rcs -c ${value}`
  }

  override async gatedFunc(name: string, lines: Promise<Array<string>>) {
    return [
      'function () {',
      `  local yn=''`,
      '  if [[ $YES ]]; then',
      `    yn='y'`,
      '  else',
      `    read "yn?? ${name} [y, [n]]: "`,
      '  fi',
      `  if [[ $yn != 'n' ]]; then`,
      ...(await lines),
      '  fi',
      '}',
    ]
  }

  override toInner(value: string) {
    return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "'\\''")}'`
  }

  override toOuter(value: string) {
    return `'${value}'`
  }

  override trace() {
    return 'set -x'
  }

  override async varArrSet(
    name: Promise<string>,
    values: Promise<Array<string>>,
  ) {
    return `${await name}=( ${(await values).join(' ')} )`
  }

  override async varSet(name: Promise<string>, value: Promise<string>) {
    return `${await name}=${await value}`
  }

  override async varUnset(name: Promise<string>) {
    return `unset ${await name}`
  }
}
