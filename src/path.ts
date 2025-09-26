import { promises as fs } from 'node:fs'
import PATH from 'node:path'

/**
 * This module contains components for building path implementations
 * @module
 */

/**
 * Builds a file path by joining multiple path parts
 * @param parts - Array of path parts to join
 * @returns The joined file path
 */
export function buildFilePath(...parts: Array<string>): string {
  return PATH.join(...parts)
}

/**
 * Checks if a path exists
 * @param path - The path to check
 * @returns Promise that resolves to true if the path exists, false otherwise
 */
export async function isPath(path: string): Promise<boolean> {
  try {
    await fs.stat(path)
    return true
  } catch {
    return false
  }
}

/**
 * Checks if a path is a directory
 * @param path - The path to check
 * @returns Promise that resolves to true if the path is a directory, false otherwise
 */
export async function isDirPath(path: string): Promise<boolean> {
  try {
    return (await fs.stat(path)).isDirectory()
  } catch {
    return false
  }
}

/**
 * Checks if a path is a file
 * @param path - The path to check
 * @returns Promise that resolves to true if the path is a file, false otherwise
 */
export async function isFilePath(path: string): Promise<boolean> {
  try {
    return (await fs.stat(path)).isFile()
  } catch {
    return false
  }
}

/**
 * Gets the content of a file
 * @param path - The path to the file
 * @returns Promise that resolves to the file content as a string, or null if the file doesn't exist or can't be read
 */
export async function getFileContent(path: string): Promise<string | null> {
  if (!(await isFilePath(path))) {
    return null
  }

  try {
    return await fs.readFile(path, 'utf-8')
  } catch {
    return null
  }
}

/**
 * Gets all file paths matching the specified criteria
 * @param path - The base directory path to search in
 * @param options - Optional configuration for filtering files
 * @returns Promise that resolves to an array of file paths
 */
export async function getFilePaths(
  path: string,
  options?: {
    extension?: string
    filters?: Array<string>
  },
): Promise<Array<string>> {
  if (!(await isDirPath(path))) {
    return []
  }

  const patterns: Array<string> = []

  if (options?.filters?.length) {
    const filterPattern = options.filters.map((f) => `${f}*`).join('/')
    if (options?.extension) {
      patterns.push(`${filterPattern}/*.${options.extension}`)
      patterns.push(`${filterPattern}.${options.extension}`)
    } else {
      patterns.push(`${filterPattern}/**`)
      patterns.push(filterPattern)
    }
  } else {
    if (options?.extension) {
      patterns.push(`**/*.${options.extension}`)
      patterns.push(`*.${options.extension}`)
    } else {
      patterns.push('**')
      patterns.push('*')
    }
  }

  const filePaths: Set<string> = new Set()
  for (const pattern of patterns) {
    for await (
      const match of fs.glob(pattern, {
        cwd: path,
        withFileTypes: true,
      })
    ) {
      if (match.isFile()) {
        filePaths.add(PATH.join(match.parentPath, match.name))
      }
    }
  }

  return [...filePaths].sort()
}
