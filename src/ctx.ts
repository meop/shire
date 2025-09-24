import {
  getSysCpuArch,
  getSysCpuVenId,
  getSysOsDeId,
  getSysOsId,
  getSysOsPlat,
  type SysCpuArch,
  type SysCpuVenId,
  type SysOsDeId,
  type SysOsId,
  type SysOsPlat,
} from './sys.ts'

export type Ctx = {
  req_orig: string
  req_path: string
  req_srch: string
  sys_cpu_arch?: SysCpuArch
  sys_cpu_ven_id?: SysCpuVenId
  sys_host?: string
  sys_os_de_id?: SysOsDeId
  sys_os_id?: SysOsId
  sys_os_plat?: SysOsPlat
  sys_os_ver_id?: string
  sys_os_ver_code?: string
  sys_user?: string
}

export type CtxFilter = {
  [key: string]: CtxFilter | Array<string>
}

function getSp(usp: URLSearchParams, key: string): string | undefined {
  return usp.has(key) ? (usp.get(key) ?? '') : undefined
}

export function getCtx(request: Request): Ctx {
  const url = new URL(
    request.url.endsWith('/') ? request.url.slice(0, -1) : request.url,
  )
  const usp = new URLSearchParams(url.search)

  const spSysCpuArch = getSp(usp, 'sysCpuArch')
  const spSysCpuVenId = getSp(usp, 'sysCpuVenId')
  const spSysOsDeId = getSp(usp, 'sysOsDeId')
  const spSysOsId = getSp(usp, 'sysOsId')
  const spSysOsPlat = getSp(usp, 'sysOsPlat')
  const spSysOsVerId = getSp(usp, 'sysOsVerId')
  const spSysOsVerCode = getSp(usp, 'sysOsVerCode')
  const spSysHost = getSp(usp, 'sysHost')
  const spSysUser = getSp(usp, 'sysUser')

  const sysCpuArch = spSysCpuArch ? getSysCpuArch(spSysCpuArch) : undefined
  const sysCpuVenId = spSysCpuVenId ? getSysCpuVenId(spSysCpuVenId) : undefined
  const sysOsDeId = spSysOsDeId ? getSysOsDeId(spSysOsDeId) : undefined
  const sysOsId = spSysOsId ? getSysOsId(spSysOsId) : undefined
  const sysOsPlat = spSysOsPlat ? getSysOsPlat(spSysOsPlat) : undefined
  const sysOsVerId = spSysOsVerId
  const sysOsVerCode = spSysOsVerCode
  const sysHost = spSysHost
  const sysUser = spSysUser

  return {
    req_orig: url.origin,
    req_path: url.pathname,
    req_srch: url.search,
    sys_cpu_arch: sysCpuArch,
    sys_cpu_ven_id: sysCpuVenId,
    sys_host: sysHost,
    sys_os_de_id: sysOsDeId,
    sys_os_id: sysOsId,
    sys_os_plat: sysOsPlat,
    sys_os_ver_id: sysOsVerId,
    sys_os_ver_code: sysOsVerCode,
    sys_user: sysUser,
  }
}

export function withCtx(line: string, context: Ctx): string {
  let l = line
  if (l.includes('{')) {
    const items = Object.keys(context).map(
      (key) => [key, context[key as keyof typeof context] ?? ''],
    )
    for (const item of items) {
      l = l.replaceAll(`{${item[0].toUpperCase()}}`, item[1])
    }
  }
  return l
}
