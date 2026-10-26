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
  },
  pwsh: {
    op: new URL('./pwsh/op.ps1', import.meta.url).pathname,
    args: (op: string, body: string) => ['-NoProfile', '-Command', `. ${op}\n${body}`],
    ask: `if (opAsk 'q') { 'yes' } else { 'no' }`,
    cmds: `opPrintCmd hostname; 'next'; opPrintCmd git status; 'next'`,
  },
  nu: {
    op: new URL('./nu/op.nu', import.meta.url).pathname,
    args: (op: string, body: string) => ['--no-config-file', '-c', `source ${op}\n${body}`],
    ask: `print (if (opAsk q) { 'yes' } else { 'no' })`,
    cmds: 'opPrintCmd hostname; print next; opPrintCmd git status; print next',
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

// the answer typed at a terminal: util-linux's script gives the shell one, and the answer is typed once the prompt is
// up, as a person would, since a shell may read or discard what arrived before it asked. the timeout ends a shell that
// waits past it, so a test fails rather than hangs
async function runPty(shell: keyof typeof SHELLS, body: string, answer: string): Promise<Run | null> {
  const s = SHELLS[shell]
  // script itself is found either way, so a shell that is not installed is looked for here
  const onPath = (Deno.env.get('PATH') ?? '').split(':').some((dir) => {
    try {
      return Deno.statSync(`${dir}/${shell}`).isFile
    } catch {
      return false
    }
  })
  if (!onPath) {
    return null
  }
  const quote = (a: string) => `'${a.replaceAll("'", `'\\''`)}'`
  let child: Deno.ChildProcess
  try {
    child = new Deno.Command('script', {
      args: ['-qec', [shell, ...s.args(s.op, body)].map(quote).join(' '), '/dev/null'],
      env: { SHELL: '/bin/sh' },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'null',
      signal: AbortSignal.timeout(20_000),
    }).spawn()
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return null
    }
    throw e
  }
  const writer = child.stdin.getWriter()
  const decoder = new TextDecoder()
  let stdout = ''
  let typed = false
  for await (const chunk of child.stdout) {
    stdout += decoder.decode(chunk, { stream: true })
    if (!typed && stdout.includes('[[y]/n]')) {
      typed = true
      await writer.write(new TextEncoder().encode(`${answer}\r`))
      await writer.close()
    }
  }
  if (!typed) {
    await writer.close()
  }
  const { code } = await child.status
  // deno-lint-ignore no-control-regex
  stdout = stdout.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '').replace(/\x1b\][^\x07]*\x07/g, '').replaceAll('\r', '')
  return { code, stdout: stdout.trim() }
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

  Deno.test(`op ${shell} - with no terminal to answer from, a question is no`, async () => {
    const out = await run(shell, SHELLS[shell].ask, {}, 'y\n')
    if (out != null) {
      assertEquals(out.stdout.includes('no terminal to answer from'), true)
      assertEquals(out.stdout.endsWith('no'), true)
    }
  })

  Deno.test({
    name: `op ${shell} - an answer is yes when empty, y or yes, in any case`,
    ignore: Deno.build.os != 'linux',
    fn: async () => {
      // side by side: pwsh at a terminal waits on cursor reports no one sends, for seconds each run
      const cases = [['', 'yes'], ['y', 'yes'], ['YES', 'yes'], ['n', 'no'], ['x', 'no']]
      const outs = await Promise.all(cases.map(([answer]) => runPty(shell, SHELLS[shell].ask, answer)))
      for (const [i, [answer, want]] of cases.entries()) {
        const out = outs[i]
        if (out == null) {
          return
        }
        assertEquals(out.stdout.endsWith(want), true, `answer '${answer}'`)
      }
    },
  })
}
