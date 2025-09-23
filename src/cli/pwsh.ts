import { type Cli, CliBase } from '../cli.ts'
import { joinKey } from '../reg.ts'

export class Powershell extends CliBase implements Cli {
  constructor() {
    super('pwsh', 'ps1')
  }

  static execStr(value: string) {
    return `pwsh -noprofile -c ${value}`
  }

  override gatedFunc(name: string, lines: Array<string>) {
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

  override toInner(value: string) {
    return `'${value.replaceAll("'", "''")}'`
  }

  override toOuter(value: string) {
    return `'${value}'`
  }

  override trace() {
    return 'Set-PSDebug -Trace 1'
  }

  override varSet(key: Array<string>, value: string) {
    return `$${joinKey(...key)} = ${value}`
  }

  override varSetArr(key: Array<string>, values: Array<string>) {
    return `$${joinKey(...key)} = ${`@( ${values.join(', ')} )`}`
  }

  override varUnset(key: Array<string>) {
    return `Remove-Variable ${joinKey(...key)} -ErrorAction SilentlyContinue`
  }
}
