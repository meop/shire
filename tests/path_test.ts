import { assertEquals, assertNotEquals } from '@std/assert'
import {
  buildFilePath,
  getFileContent,
  getFilePaths,
  isDirPath,
  isFilePath,
  isPath,
} from '../src/path.ts'
import PATH from 'node:path'

Deno.test('buildFilePath - joins paths', () => {
  const result = buildFilePath('a', 'b', 'c')
  // Use PATH.join to be platform independent in expectation
  assertEquals(result, PATH.join('a', 'b', 'c'))
})

Deno.test('path utilities - isPath, isDirPath, isFilePath, getFileContent', async () => {
  const tempDir = await Deno.makeTempDir()
  const tempFile = PATH.join(tempDir, 'test.txt')
  await Deno.writeTextFile(tempFile, 'hello world')

  try {
    assertEquals(await isPath(tempDir), true)
    assertEquals(await isDirPath(tempDir), true)
    assertEquals(await isFilePath(tempDir), false)

    assertEquals(await isPath(tempFile), true)
    assertEquals(await isDirPath(tempFile), false)
    assertEquals(await isFilePath(tempFile), true)

    assertEquals(await getFileContent(tempFile), 'hello world')
    assertEquals(await getFileContent(PATH.join(tempDir, 'missing.txt')), null)
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('getFilePaths - finds files with filters and extensions', async () => {
  const tempDir = await Deno.makeTempDir()
  const subDir = PATH.join(tempDir, 'sub')
  await Deno.mkdir(subDir)

  await Deno.writeTextFile(PATH.join(tempDir, 'root.txt'), 'root')
  await Deno.writeTextFile(PATH.join(tempDir, 'root.yaml'), 'root yaml')
  await Deno.writeTextFile(PATH.join(subDir, 'child.txt'), 'child')
  await Deno.writeTextFile(PATH.join(subDir, 'child.yaml'), 'child yaml')

  try {
    // All files
    const all = await getFilePaths(tempDir)
    assertEquals(all.length, 4)

    // Filter by extension
    const yamls = await getFilePaths(tempDir, { extension: 'yaml' })
    assertEquals(yamls.length, 2)
    assertEquals(yamls.every(p => p.endsWith('.yaml')), true)

    // Filter by name pattern
    const rootFiles = await getFilePaths(tempDir, { filters: ['root'] })
    assertEquals(rootFiles.length, 2)
    assertEquals(rootFiles.every(p => p.includes('root')), true)

    // Both
    const rootYamls = await getFilePaths(tempDir, { filters: ['root'], extension: 'yaml' })
    assertEquals(rootYamls.length, 1)
    assertEquals(rootYamls[0].endsWith('root.yaml'), true)
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})
