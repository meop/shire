import { assertEquals } from '@std/assert'

type Run = { code: number; stdout: string }

// each shell sources its own op file and runs one line of it; a shell that is not installed answers null. the
// switches are given as env vars, which is where every shell's op helpers read them
const SHELLS = {
  zsh: {
    op: new URL('./zsh/op.zsh', import.meta.url).pathname,
    args: (op: string, body: string) => ['-c', `source ${op}\n${body}`],
    ask: 'opAsk q && print yes || print no',
    cmds: 'opPrintCmd hostname; print next; opPrintCmd git status; print next',
    piped: true,
  },
  pwsh: {
    op: new URL('./pwsh/op.ps1', import.meta.url).pathname,
    args: (op: string, body: string) => ['-NoProfile', '-Command', `. ${op}\n${body}`],
    ask: `if (opAsk 'q') { 'yes' } else { 'no' }`,
    cmds: `opPrintCmd hostname; 'next'; opPrintCmd git status; 'next'`,
    piped: true,
  },
  nu: {
    op: new URL('./nu/op.nu', import.meta.url).pathname,
    args: (op: string, body: string) => ['--no-config-file', '-c', `source ${op}\n${body}`],
    ask: `print (if (opAsk q) { 'yes' } else { 'no' })`,
    cmds: 'opPrintCmd hostname; print next; opPrintCmd git status; print next',
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
      args: s.args(s.op, body),
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

  Deno.test(`op ${shell} - a printed command ends its line, a lone word as well`, async () => {
    const out = await run(shell, SHELLS[shell].cmds)
    if (out != null) {
      // deno-lint-ignore no-control-regex
      assertEquals(out.stdout.replace(/\x1b\[[0-9;]*m/g, '').split(/\r?\n/), ['hostname', 'next', 'git status', 'next'])
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
