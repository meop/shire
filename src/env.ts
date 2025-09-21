export const SPLIT_KEY = '_'
export const SPLIT_VAL = ' '

export interface Env {
  get(...key: Array<string>): string
  set(value: string, ...key: Array<string>): void
  append(value: string, ...key: Array<string>): void
}

export function toKey(...key: Array<string>) {
  return key.join(SPLIT_KEY).toUpperCase()
}

export class EnvBase implements Env {
  values: { [key: string]: string } = {}

  get(...key: Array<string>) {
    return this.values[toKey(...key)]
  }

  set(value: string, ...key: Array<string>) {
    this.values[toKey(...key)] = value
  }

  append(value: string, ...key: Array<string>) {
    if (this.values[toKey(...key)]) {
      this.set(`${this.get(...key)}${SPLIT_VAL}${value}`, ...key)
    } else {
      this.set(value, ...key)
    }
  }
}
