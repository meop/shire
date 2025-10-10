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

/**
 * This module contains components for building context implementations
 * @module
 */

/**
 * Context interface containing request and system information
 */
export type Ctx = {
  /**
   * Original request URL
   */
  req_orig: string
  /**
   * Request path
   */
  req_path: string
  /**
   * Request search parameters
   */
  req_srch: string
  /**
   * System CPU architecture (optional)
   */
  sys_cpu_arch?: SysCpuArch
  /**
   * System CPU vendor ID (optional)
   */
  sys_cpu_ven_id?: SysCpuVenId
  /**
   * System host name (optional)
   */
  sys_host?: string
  /**
   * System OS desktop environment ID (optional)
   */
  sys_os_de_id?: SysOsDeId
  /**
   * System OS ID (optional)
   */
  sys_os_id?: SysOsId
  /**
   * System OS platform (optional)
   */
  sys_os_plat?: SysOsPlat
  /**
   * System OS version ID (optional)
   */
  sys_os_ver_id?: string
  /**
   * System OS version code (optional)
   */
  sys_os_ver_code?: string
  /**
   * System user name (optional)
   */
  sys_user?: string
}

/**
 * Context filter type for filtering context properties
 */
export type CtxFilter = {
  [key: string]: CtxFilter | Array<string>
}

/**
 * Gets a search parameter value from URLSearchParams
 * @param usp - URLSearchParams object
 * @param key - The key to look up
 * @returns The value of the parameter or undefined if not found
 */
function getSp(usp: URLSearchParams, key: string): string | undefined {
  return usp.has(key) ? (usp.get(key) ?? '') : undefined
}

/**
 * Creates a context object from a request
 * @param request - The Request object to extract context from
 * @returns A Ctx object with request and system information
 */
export function getCtx(request: Request): Ctx {
  const url = new URL(
    request.url.endsWith('/') ? request.url.slice(0, -1) : request.url,
  )
  const usp = new URLSearchParams(url.search)
  const spSysCpuArch = getSp(usp, 'sysCpuArch')
  const spSysCpuVenId = getSp(usp, 'sysCpuVenId')
  const spSysHost = getSp(usp, 'sysHost')
  const spSysOsDeId = getSp(usp, 'sysOsDeId')
  const spSysOsId = getSp(usp, 'sysOsId')
  const spSysOsIdLike = getSp(usp, 'sysOsIdLike')
  const spSysOsPlat = getSp(usp, 'sysOsPlat')
  const spSysOsVerId = getSp(usp, 'sysOsVerId')
  const spSysOsVerCode = getSp(usp, 'sysOsVerCode')
  const spSysUser = getSp(usp, 'sysUser')

  return {
    sys_cpu_arch: spSysCpuArch ? getSysCpuArch(spSysCpuArch) : undefined,
    sys_cpu_ven_id: spSysCpuVenId ? getSysCpuVenId(spSysCpuVenId) : undefined,
    sys_host: spSysHost,
    req_orig: url.origin,
    sys_os_de_id: spSysOsDeId ? getSysOsDeId(spSysOsDeId) : undefined,
    sys_os_id: spSysOsId ? getSysOsId(spSysOsId, spSysOsIdLike) : undefined,
    sys_os_plat: spSysOsPlat ? getSysOsPlat(spSysOsPlat) : undefined,
    sys_os_ver_id: spSysOsVerId,
    sys_os_ver_code: spSysOsVerCode,
    req_path: url.pathname,
    req_srch: url.search,
    sys_user: spSysUser,
  }
}

/**
 * Replaces placeholders in a line with context values
 * @param line - The line containing placeholders to replace
 * @param context - The context object with values to substitute
 * @returns The line with placeholders replaced
 */
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
