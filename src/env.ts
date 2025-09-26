import { joinKey, joinVal, splitVal } from './reg.ts'

/**
 * This module contains components for building environment implementations
 * @module
 */

/**
 * Interface defining the contract for environment configuration management
 */
export interface Env {
  /**
   * Store containing key-value pairs for environment variables
   */
  store: { [key: string]: string | undefined }
  /**
   * Gets a value from the environment store using a key path
   * @param key - Array of strings representing the key path
   * @returns The value if found, otherwise undefined
   */
  get(key: Array<string>): string | undefined
  /**
   * Gets a split value from the environment store using a key path
   * @param key - Array of strings representing the key path
   * @returns Array of string values after splitting
   */
  getSplit(key: Array<string>): Array<string>
  /**
   * Sets a value in the environment store using a key path
   * @param key - Array of strings representing the key path
   * @param value - The value to set
   */
  set(key: Array<string>, value: string): void
  /**
   * Appends a value to an existing value in the environment store using a key path
   * @param key - Array of strings representing the key path
   * @param value - The value to append
   */
  setAppend(key: Array<string>, value: string): void
}

/**
 * Base implementation of the Env interface
 */
export class EnvBase implements Env {
  /**
   * Store containing key-value pairs for environment variables
   */
  store: { [key: string]: string | undefined } = {}

  /**
   * Gets a value from the environment store using a key path
   * @param key - Array of strings representing the key path
   * @returns The value if found, otherwise undefined
   */
  get(key: Array<string>): string | undefined {
    return this.store[joinKey(...key)]
  }

  /**
   * Gets a split value from the environment store using a key path
   * @param key - Array of strings representing the key path
   * @returns Array of string values after splitting
   */
  getSplit(key: Array<string>): Array<string> {
    return splitVal(this.get(key))
  }

  /**
   * Sets a value in the environment store using a key path
   * @param key - Array of strings representing the key path
   * @param value - The value to set
   */
  set(key: Array<string>, value: string): void {
    this.store[joinKey(...key)] = value
  }

  /**
   * Appends a value to an existing value in the environment store using a key path
   * @param key - Array of strings representing the key path
   * @param value - The value to append
   */
  setAppend(key: Array<string>, value: string): void {
    if (this.store[joinKey(...key)]) {
      this.set(key, joinVal(...this.getSplit(key), value))
    } else {
      this.set(key, value)
    }
  }
}
