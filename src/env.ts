import { joinKey, joinVal, splitVal } from './reg.ts'

export interface Env {
  store: { [key: string]: string | undefined }
  get(key: Array<string>): string | undefined
  getSplit(key: Array<string>): Array<string>
  set(key: Array<string>, value: string): void
  setAppend(key: Array<string>, value: string): void
}

export class EnvBase implements Env {
  store: { [key: string]: string | undefined } = {}

  get(key: Array<string>): string | undefined {
    return this.store[joinKey(...key)]
  }

  getSplit(key: Array<string>): Array<string> {
    return splitVal(this.get(key))
  }

  set(key: Array<string>, value: string): void {
    this.store[joinKey(...key)] = value
  }

  setAppend(key: Array<string>, value: string): void {
    if (this.store[joinKey(...key)]) {
      this.set(key, joinVal(...this.getSplit(key), value))
    } else {
      this.set(key, value)
    }
  }
}
