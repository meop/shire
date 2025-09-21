import { buildFilePath, getFileContent } from './path.ts'

export interface Cli {
  name: string
  extension: string

  build(): Promise<string>

  fileLoad(parts: Promise<Array<string>>): Promise<Array<string>>
  gatedFunc(name: string, lines: Promise<Array<string>>): Promise<Array<string>>

  print(lines: Promise<string | Array<string>>): Promise<Array<string>>
  printCmd(lines: Promise<string | Array<string>>): Promise<Array<string>>
  printErr(lines: Promise<string | Array<string>>): Promise<Array<string>>
  printInfo(lines: Promise<string | Array<string>>): Promise<Array<string>>
  printSucc(lines: Promise<string | Array<string>>): Promise<Array<string>>
  printWarn(lines: Promise<string | Array<string>>): Promise<Array<string>>

  toInner: (value: string) => string
  toOuter: (value: string) => string

  trace(): string

  varArrSet(
    name: Promise<string>,
    values: Promise<Array<string>>,
  ): Promise<string>
  varSet(name: Promise<string>, value: Promise<string>): Promise<string>
  varUnset(name: Promise<string>): Promise<string>

  with(lines: Promise<string | Array<string>>): Cli
}

export async function toPrint(
  client: Cli,
  lines: Promise<string | Array<string>>,
  op: string,
) {
  const _lines = await lines
  return (typeof _lines === 'string' ? [_lines] : _lines).map(
    (l) => `${op} ${client.toInner(l)}`,
  )
}

export class CliBase implements Cli {
  name: string
  extension: string

  dirPath: string
  lineBuilders: Array<Promise<string | Array<string>>> = []

  constructor(name: string, extension: string) {
    this.name = name
    this.extension = extension

    this.dirPath = buildFilePath(import.meta.dirname ?? '', 'cli', this.name)
  }

  async build() {
    const lines: Array<string> = []
    for (const lineBuilder of this.lineBuilders) {
      const line = await lineBuilder
      lines.push(...(typeof line === 'string' ? [line] : line))
      lines.push('')
    }
    return lines.join('\n')
  }

  gatedFunc(
    _name: string,
    _lines: Promise<Array<string>>,
  ): Promise<Array<string>> {
    throw new Error('abstract')
  }

  async fileLoad(parts: Promise<Array<string>>) {
    const path = `${
      buildFilePath(...[this.dirPath, ...(await parts)])
    }.${this.extension}`
    return [(await getFileContent(path)) ?? '']
  }

  print(lines: Promise<string | Array<string>>) {
    return toPrint(this, lines, 'opPrint')
  }

  printCmd(lines: Promise<string | Array<string>>) {
    return toPrint(this, lines, 'opPrintCmd')
  }

  printErr(lines: Promise<string | Array<string>>) {
    return toPrint(this, lines, 'opPrintErr')
  }

  printInfo(lines: Promise<string | Array<string>>) {
    return toPrint(this, lines, 'opPrintInfo')
  }

  printSucc(lines: Promise<string | Array<string>>) {
    return toPrint(this, lines, 'opPrintSucc')
  }

  printWarn(lines: Promise<string | Array<string>>) {
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

  varArrSet(
    _name: Promise<string>,
    _values: Promise<Array<string>>,
  ): Promise<string> {
    throw new Error('abstract')
  }

  varSet(_name: Promise<string>, _value: Promise<string>): Promise<string> {
    throw new Error('abstract')
  }

  varUnset(_name: Promise<string>): Promise<string> {
    throw new Error('abstract')
  }

  with(lines: Promise<string | Array<string>>) {
    this.lineBuilders.push(lines)
    return this
  }
}
