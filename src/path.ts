import { promises as fs } from 'node:fs'
import PATH from 'node:path'

export function buildFilePath(...parts: Array<string>) {
  return PATH.join(...parts)
}

export async function isPath(path: string) {
  try {
    await fs.stat(path)
    return true
  } catch {
    return false
  }
}

export async function isDirPath(path: string) {
  try {
    return (await fs.stat(path)).isDirectory()
  } catch {
    return false
  }
}

export async function isFilePath(path: string) {
  try {
    return (await fs.stat(path)).isFile()
  } catch {
    return false
  }
}

export async function getFileContent(path: string) {
  if (!(await isFilePath(path))) {
    return null
  }

  try {
    return await fs.readFile(path, 'utf-8')
  } catch {
    return null
  }
}

export async function getFilePaths(
  path: string,
  options?: {
    extension?: string
    filters?: Array<string>
  },
) {
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
