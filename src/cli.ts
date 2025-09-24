export interface Cli {
  name: string
  extension: string

  build(): string

  fileLoad(
    parts: Array<string>,
    urlResolver?: (specifier: string) => string,
    urlResolverBase?: Array<string>,
  ): Promise<string>
  gatedFunc(name: string, lines: Array<string>): Array<string>

  print(lines: string | Array<string>): Array<string>
  printCmd(lines: string | Array<string>): Array<string>
  printErr(lines: string | Array<string>): Array<string>
  printInfo(lines: string | Array<string>): Array<string>
  printSucc(lines: string | Array<string>): Array<string>
  printWarn(lines: string | Array<string>): Array<string>

  toInner: (value: string) => string
  toOuter: (value: string) => string

  trace(): string

  varSet(key: Array<string>, value: string): string
  varSetArr(key: Array<string>, values: Array<string>): string
  varUnset(key: Array<string>): string

  verMajor(): number
  verMinor(): number

  with(lines: string | Array<string>): Cli
}

export function toPrint(
  client: Cli,
  lines: string | Array<string>,
  op: string,
): Array<string> {
  return (typeof lines === 'string' ? [lines] : lines).map(
    (l) => `${op} ${client.toInner(l)}`,
  )
}

export class CliBase implements Cli {
  name: string
  extension: string

  lines: Array<string | Array<string>> = []

  constructor(name: string, extension: string) {
    this.name = name
    this.extension = extension
  }

  build(): string {
    const lines: Array<string> = []
    for (const line of this.lines) {
      lines.push(...(typeof line === 'string' ? [line] : line))
      lines.push('')
    }
    return lines.join('\n')
  }

  gatedFunc(_name: string, _lines: Array<string>): Array<string> {
    throw new Error('abstract')
  }

  async fileLoad(
    parts: Array<string>,
    urlResolver?: (specifier: string) => string,
    urlResolverBase?: Array<string>,
  ): Promise<string> {
    let _path = [...(urlResolverBase ?? ['.']), 'cli', this.name, ...parts]
      .join(
        '/',
      )
    if (!_path.endsWith(`.${this.extension}`)) {
      _path = `${_path}.${this.extension}`
    }
    const fetchPath = urlResolver
      ? urlResolver(_path)
      : import.meta.resolve(_path)
    try {
      const res = await fetch(fetchPath)
      if (res.ok) {
        return await res.text()
      }
    } catch (e: unknown) {
      if (!(e instanceof TypeError)) {
        throw e
      }
    }
    return ''
  }

  print(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrint')
  }

  printCmd(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintCmd')
  }

  printErr(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintErr')
  }

  printInfo(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintInfo')
  }

  printSucc(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintSucc')
  }

  printWarn(lines: string | Array<string>): Array<string> {
    return toPrint(this, lines, 'opPrintWarn')
  }

  toInner(_value: string): string {
    throw new Error('abstract')
  }

  toOuter(_value: string): string {
    throw new Error('abstract')
  }

  trace(): string {
    throw new Error('abstract')
  }

  varSet(_key: Array<string>, _value: string): string {
    throw new Error('abstract')
  }

  varSetArr(_key: Array<string>, _values: Array<string>): string {
    throw new Error('abstract')
  }

  varUnset(_key: Array<string>): string {
    throw new Error('abstract')
  }

  verMajor(): number {
    return 0
  }

  verMinor(): number {
    return 0
  }

  with(lines: string | Array<string>): this {
    this.lines.push(lines)
    return this
  }
}
