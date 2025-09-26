const KEY_SPLIT = '_'
const VAL_SPLIT = '|'

/**
 * This module contains components for building register implementations
 * @module
 */

/**
 * Splits a key string into parts using the key split delimiter
 * @param key - The key string to split
 * @returns Array of key parts (lowercase)
 */
export function splitKey(key: string | undefined): Array<string> {
  return key?.split(KEY_SPLIT)?.map((k) => k.toLowerCase()) ?? []
}

/**
 * Joins key parts into a single string using the key split delimiter
 * @param parts - Array of key parts to join
 * @returns Joined key string in uppercase
 */
export function joinKey(...parts: Array<string>): string {
  return parts.join(KEY_SPLIT).toUpperCase()
}

/**
 * Splits a value string into parts using the value split delimiter
 * @param value - The value string to split
 * @returns Array of value parts
 */
export function splitVal(value: string | undefined): Array<string> {
  return value?.split(VAL_SPLIT) ?? []
}

/**
 * Joins value parts into a single string using the value split delimiter
 * @param parts - Array of value parts to join
 * @returns Joined value string
 */
export function joinVal(...parts: Array<string>): string {
  return parts.join(VAL_SPLIT)
}
