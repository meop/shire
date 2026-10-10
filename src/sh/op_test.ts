import { assertEquals } from '@std/assert'

type Run = { code: number; stdout: string }

// each shell sources its own op file and runs one line of it; a shell that is not installed answers null
const SHELLS = {
  zsh: {
    op: new URL('./zsh/op.zsh', import.meta.url).pathname,
    args: (op: string, body: string) => ['-c', `source ${op}\n${body}`],
    ask: 'opAsk q && print yes || print no',
    // YES reaches zsh and nu as an env var; pwsh's op helpers read a plain variable
    check: '',
    piped: true,
  },
  pwsh: {
    op: new URL('./pwsh/op.ps1', import.meta.url).pathname,
    args: (op: string, body: string) => ['-NoProfile', '-Command', `. ${op}\n${body}`],
    ask: `if (opAsk 'q') { 'yes' } else { 'no' }`,
    check: '$YES = $env:YES\n',
    piped: true,
  },
  nu: {
    op: new URL('./nu/op.nu', import.meta.url).pathname,
    args: (op: string, body: string) => ['--no-config-file', '-c', `source ${op}\n${body}`],
    ask: `print (if (opAsk q) { 'yes' } else { 'no' })`,
    check: '',
    // nu's input reads only from a terminal, so a piped answer cannot reach it
    piped: false,
  },
}

async function run(
  shell: keyof typeof SHELLS,
  body: string,
  env: Record<string, string> = {},
  stdin = '',
): Promise<Run | null> {
  const s = SHELLS[shell]
  try {
    const child = new Deno.Command(shell, {
      args: s.args(s.op, `${s.check}${body}`),
      env,
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'null',
    }).spawn()
    const writer = child.stdin.getWriter()
    await writer.write(new TextEncoder().encode(stdin))
    await writer.close()
    const out = await child.output()
    return { code: out.code, stdout: new TextDecoder().decode(out.stdout).trim() }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return null
    }
    throw e
  }
}

for (const shell of Object.keys(SHELLS) as Array<keyof typeof SHELLS>) {
  Deno.test(`op ${shell} - under YES a question is yes without asking`, async () => {
    const out = await run(shell, SHELLS[shell].ask, { YES: '1' })
    if (out != null) {
      assertEquals(out.stdout.endsWith('yes'), true)
    }
  })

  Deno.test({
    name: `op ${shell} - an answer is yes when empty, y or yes, in any case`,
    ignore: !SHELLS[shell].piped,
    fn: async () => {
      for (const [answer, want] of [['', 'yes'], ['y', 'yes'], ['YES', 'yes'], ['n', 'no'], ['x', 'no']]) {
        const out = await run(shell, SHELLS[shell].ask, {}, `${answer}\n`)
        if (out == null) {
          return
        }
        assertEquals(out.stdout.endsWith(want), true, `answer '${answer}'`)
      }
    },
  })
}
