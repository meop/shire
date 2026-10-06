import { assertEquals } from '@std/assert'

import { NuSh } from './nu.ts'
import { PowerSh } from './pwsh.ts'
import { ZSh } from './zsh.ts'

const OP_NU = new URL('./nu/op.nu', import.meta.url).pathname

type Run = { code: number; stdout: string; stderr: string }

// runs a script in nu, or answers null where nu is not installed
async function runNu(script: string, env: Record<string, string> = {}): Promise<Run | null> {
  const file = await Deno.makeTempFile({ suffix: '.nu' })
  try {
    await Deno.writeTextFile(file, script)
    const out = await new Deno.Command('nu', {
      args: ['--no-config-file', file],
      env,
      stdout: 'piped',
      stderr: 'piped',
    })
      .output()
    const text = new TextDecoder()
    return { code: out.code, stdout: text.decode(out.stdout), stderr: text.decode(out.stderr) }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return null
    }
    throw e
  } finally {
    await Deno.remove(file)
  }
}

function built(body: string): string {
  return new NuSh().with(body).build()
}

// what a ctrl-c does to nu: the signal reaches nu itself, as well as whatever it was running
const SELF_SIGINT = `^sh -c 'kill -INT $PPID; sleep 1'\nsleep 1sec`

Deno.test('NuSh - quietInterrupt leaves zsh and pwsh scripts as they are', () => {
  assertEquals(new ZSh().quietInterrupt('body'), 'body')
  assertEquals(new PowerSh().quietInterrupt('body'), 'body')
})

Deno.test('NuSh - op.nu wraps a command exactly as quietInterrupt wraps a script', async () => {
  const out = await runNu(`${await Deno.readTextFile(OP_NU)}\nprint -n (opQuietInterrupt 'BODY')`)
  if (out != null) {
    assertEquals(out.stdout, new NuSh().quietInterrupt('BODY'))
  }
})

Deno.test('NuSh - a ctrl-c ends a built script quietly with 130, and a newline', async () => {
  const out = await runNu(built(`${SELF_SIGINT}\nprint 'kept going'`))
  if (out != null) {
    assertEquals(out, { code: 130, stdout: '\n', stderr: '' })
  }
})

Deno.test('NuSh - a nested nu leaves the newline to the outermost', async () => {
  const out = await runNu(built(SELF_SIGINT), { SHIRE_NU_NESTED: '1' })
  if (out != null) {
    assertEquals(out, { code: 130, stdout: '', stderr: '' })
  }
})

Deno.test('NuSh - a command that read the ctrl-c itself and exited 130 ends the script the same way', async () => {
  const out = await runNu(built(`^sh -c 'exit 130'\nprint 'kept going'`))
  if (out != null) {
    assertEquals(out, { code: 130, stdout: '\n', stderr: '' })
  }
})

Deno.test('NuSh - a failed command keeps its exit code and says nothing more', async () => {
  const out = await runNu(built(`^sh -c 'exit 3'\nprint 'kept going'`))
  if (out != null) {
    assertEquals(out, { code: 3, stdout: '', stderr: '' })
  }
})

Deno.test('NuSh - any other error is still reported', async () => {
  const out = await runNu(built(`error make --unspanned { msg: 'boom' }`))
  if (out != null) {
    assertEquals(out.code, 1)
    assertEquals(out.stderr.includes('boom'), true)
  }
})

Deno.test('NuSh - a command run through opRunCmd ends quietly on a ctrl-c', async () => {
  const out = await runNu(
    built(`${await Deno.readTextFile(OP_NU)}\nopRunCmd ^sh -c "'kill -INT $$'"\nprint 'kept going'`),
  )
  if (out != null) {
    assertEquals(out, { code: 130, stdout: '\n', stderr: '' })
  }
})
