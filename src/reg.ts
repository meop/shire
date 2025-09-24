const KEY_SPLIT = '_'
const VAL_SPLIT = '|'

export function splitKey(key: string | undefined): Array<string> {
  return key?.split(KEY_SPLIT)?.map((k) => k.toLowerCase()) ?? []
}
export function joinKey(...parts: Array<string>): string {
  return parts.join(KEY_SPLIT).toUpperCase()
}

export function splitVal(value: string | undefined): Array<string> {
  return value?.split(VAL_SPLIT) ?? []
}
export function joinVal(...parts: Array<string>): string {
  return parts.join(VAL_SPLIT)
}
