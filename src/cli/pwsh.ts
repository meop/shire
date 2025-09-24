import { type Cli, CliBase } from '../cli.ts'
import { joinKey } from '../reg.ts'

export class Powershell extends CliBase implements Cli {
  constructor() {
    super('pwsh', 'ps1')
  }

  static execStr(value: string): string {
    return `pwsh -noprofile -c ${value}`
  }

  override gatedFunc(name: string, lines: Array<string>): Array<string> {
    return [
      '& {',
      `  $yn = ''`,
      '  if ($YES) {',
      `    $yn = 'y'`,
      '  } else {',
      `    $yn = Read-Host "? ${name} [y, [n]]"`,
      '  }',
      `  if ($yn -ne 'n') {`,
      ...lines,
      '  }',
      '}',
    ]
  }

  override toInner(value: string): string {
    return `'${value.replaceAll("'", "''")}'`
  }

  override toOuter(value: string): string {
    return `'${value}'`
  }

  override trace(): string {
    return 'Set-PSDebug -Trace 1'
  }

  override varSet(key: Array<string>, value: string): string {
    return `$${joinKey(...key)} = ${value}`
  }

  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `$${joinKey(...key)} = ${`@( ${values.join(', ')} )`}`
  }

  override varUnset(key: Array<string>): string {
    return `Remove-Variable ${joinKey(...key)} -ErrorAction SilentlyContinue`
  }
}
