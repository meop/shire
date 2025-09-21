import { type Cli, CliBase } from '../cli.ts'

export class Powershell extends CliBase implements Cli {
  constructor() {
    super('pwsh', 'ps1')
  }

  static execStr(value: string) {
    return `pwsh -noprofile -c ${value}`
  }

  override async gatedFunc(name: string, lines: Promise<Array<string>>) {
    return [
      '& {',
      `  $yn = ''`,
      '  if ($YES) {',
      `    $yn = 'y'`,
      '  } else {',
      `    $yn = Read-Host "? ${name} [y, [n]]"`,
      '  }',
      `  if ($yn -ne 'n') {`,
      ...(await lines),
      '  }',
      '}',
    ]
  }

  override toInner(value: string) {
    return `'${value.replaceAll("'", "''")}'`
  }

  override toOuter(value: string) {
    return `'${value}'`
  }

  override trace() {
    return 'Set-PSDebug -Trace 1'
  }

  override async varArrSet(
    name: Promise<string>,
    values: Promise<Array<string>>,
  ) {
    return `$${await name} = ${`@( ${(await values).join(', ')} )`}`
  }

  override async varSet(name: Promise<string>, value: Promise<string>) {
    return `$${await name} = ${await value}`
  }

  override async varUnset(name: Promise<string>) {
    return `Remove-Variable ${await name} -ErrorAction SilentlyContinue`
  }
}
