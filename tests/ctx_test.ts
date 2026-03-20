import { assertEquals } from '@std/assert'

import { getCtx, withCtx } from '../src/ctx.ts'

Deno.test('getCtx - parses request URL and search params', () => {
  const request = new Request(
    'http://localhost/api/test?sysCpuArch=x86_64&sysCpuVend=amd&sysOsPlat=linux&sysOs=arch&sysOsDe=plasma&sysOsVers=6.1&sysOsVersCode=bookworm&sysHost=myhost&sysUser=admin',
  )
  const context = getCtx(request)

  assertEquals(context.req_orig, 'http://localhost')
  assertEquals(context.req_path, '/api/test')
  assertEquals(context.sys_cpu_arch, 'x86_64')
  assertEquals(context.sys_cpu_vend, 'amd')
  assertEquals(context.sys_os_plat, 'linux')
  assertEquals(context.sys_os, 'arch')
  assertEquals(context.sys_os_de, 'plasma')
  assertEquals(context.sys_os_vers, '6.1')
  assertEquals(context.sys_os_vers_code, 'bookworm')
  assertEquals(context.sys_host, 'myhost')
  assertEquals(context.sys_user, 'admin')
})

Deno.test('getCtx - strips trailing slash from URL', () => {
  const request = new Request('http://localhost/api/test/')
  const context = getCtx(request)
  assertEquals(context.req_path, '/api/test')
})

Deno.test('getCtx - handles missing sys params as undefined', () => {
  const request = new Request('http://localhost/api/test')
  const context = getCtx(request)
  assertEquals(context.sys_cpu_arch, undefined)
  assertEquals(context.sys_os_plat, undefined)
  assertEquals(context.sys_host, undefined)
  assertEquals(context.req_orig, 'http://localhost')
  assertEquals(context.req_path, '/api/test')
  assertEquals(context.req_srch, '')
})

Deno.test('withCtx - replaces placeholders', () => {
  const context = {
    req_orig: 'http://localhost',
    req_path: '/test',
    req_srch: '',
    sys_host: 'myhost',
    sys_user: 'admin',
  }

  assertEquals(withCtx('Host is {SYS_HOST}', context), 'Host is myhost')
  assertEquals(
    withCtx('User is {SYS_USER} on {SYS_HOST}', context),
    'User is admin on myhost',
  )
  assertEquals(withCtx('Path: {REQ_PATH}', context), 'Path: /test')
  assertEquals(withCtx('No placeholder', context), 'No placeholder')
})

Deno.test('withCtx - undefined context values replaced with empty string', () => {
  const context = {
    req_orig: 'http://localhost',
    req_path: '/test',
    req_srch: '',
    sys_host: undefined,
  }
  assertEquals(withCtx('Host: {SYS_HOST}', context), 'Host: ')
})
