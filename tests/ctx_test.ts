import { assertEquals } from '@std/assert'
import { getCtx, withCtx } from '../src/ctx.ts'

Deno.test('getCtx - parses request URL and search params', () => {
  const request = new Request('http://localhost/api/test?sysCpuArch=x86_64&sysOsPlat=linux&sysHost=myhost&sysUser=admin')
  const ctx = getCtx(request)

  assertEquals(ctx.req_orig, 'http://localhost')
  assertEquals(ctx.req_path, '/api/test')
  assertEquals(ctx.req_srch, '?sysCpuArch=x86_64&sysOsPlat=linux&sysHost=myhost&sysUser=admin')
  assertEquals(ctx.sys_cpu_arch, 'x86_64')
  assertEquals(ctx.sys_os_plat, 'linux')
  assertEquals(ctx.sys_host, 'myhost')
  assertEquals(ctx.sys_user, 'admin')
})

Deno.test('withCtx - replaces placeholders', () => {
  const ctx = {
    req_orig: 'http://localhost',
    req_path: '/test',
    req_srch: '',
    sys_host: 'myhost',
    sys_user: 'admin',
  }

  assertEquals(withCtx('Host is {SYS_HOST}', ctx), 'Host is myhost')
  assertEquals(withCtx('User is {SYS_USER} on {SYS_HOST}', ctx), 'User is admin on myhost')
  assertEquals(withCtx('Path: {REQ_PATH}', ctx), 'Path: /test')
  assertEquals(withCtx('No placeholder', ctx), 'No placeholder')
})
