import { type Cli, CliBase } from '../cli.ts'

export class Nushell extends CliBase implements Cli {
  constructor() {
    super('nu', 'nu')
  }

  static execStr(value: string) {
    return `nu --no-config-file -c ${value}`
  }

  override async gatedFunc(name: string, lines: Promise<Array<string>>) {
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
      ...(await lines),
      '    }',
      '  } catch { |e|',
      `    if not (($e.msg | str downcase) == 'external command had a non-zero exit code') {`,
      '      throw $e',
      '    }',
      '  }',
      '}',
    ]
  }

  override toInner(value: string) {
    return `r#'${value}'#`
  }

  override toOuter(value: string) {
    return `\`${value}\``
  }

  override trace() {
    return '' // no direct equivalent
  }

  override async varArrSet(
    name: Promise<string>,
    values: Promise<Array<string>>,
  ) {
    return `$env.${await name} = [ ${(await values).join(', ')} ]`
  }

  override async varSet(name: Promise<string>, value: Promise<string>) {
    return `$env.${await name} = ${await value}`
  }

  override async varUnset(name: Promise<string>) {
    return `hide-env ${await name}`
  }
}
