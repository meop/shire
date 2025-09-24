import { type Cli, CliBase } from '../cli.ts'
import { joinKey } from '../reg.ts'

export class Nushell extends CliBase implements Cli {
  constructor() {
    super('nu', 'nu')
  }

  static execStr(value: string): string {
    return `nu --no-config-file -c ${value}`
  }

  override gatedFunc(name: string, lines: Array<string>): Array<string> {
    return [
      'do {',
      '  try {',
      `    mut yn = ''`,
      `    if 'YES' in $env {`,
      `      $yn = 'y'`,
      '    } else {',
      `      $yn = input r#'? ${name} [y, [n]]: '#`,
      '    }',
      `    if $yn != 'n' {`,
      ...lines,
      '    }',
      '  } catch { |e|',
      `    if not (($e.msg | str downcase) == 'i/o error') {`,
      '      throw $e',
      '    }',
      '  }',
      '}',
    ]
  }

  override toInner(value: string): string {
    return `r#'${value}'#`
  }

  override toOuter(value: string): string {
    return `\`${value}\``
  }

  override trace(): string {
    return '' // no direct equivalent
  }

  override varSet(key: Array<string>, value: string): string {
    return `$env.${joinKey(...key)} = ${value}`
  }

  override varSetArr(key: Array<string>, values: Array<string>): string {
    return `$env.${joinKey(...key)} = [ ${values.join(', ')} ]`
  }

  override varUnset(key: Array<string>): string {
    return `hide-env ${joinKey(...key)}`
  }
}
