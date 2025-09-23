export enum SysCpuArch {
  x86_64 = 'x86_64',
  aarch64 = 'aarch64',
}
export function getSysCpuArch(sysCpuArch: string): SysCpuArch {
  switch (sysCpuArch.toLowerCase()) {
    case 'amd64':
    case 'x64':
    case 'x86_64':
      return SysCpuArch.x86_64
    case 'arm64':
    case 'aarch64':
      return SysCpuArch.aarch64
    default:
      throw new Error(`unsupported cpu architecture: ${sysCpuArch}`)
  }
}

export enum SysCpuVenId {
  intel = 'intel',
  amd = 'amd',
  arm = 'arm',
  apple = 'apple',
}
export function getSysCpuVenId(sysCpuVenId: string): SysCpuVenId {
  switch (sysCpuVenId.toLowerCase()) {
    case 'intel':
    case 'genuineintel':
      return SysCpuVenId.intel
    case 'amd':
    case 'authenticamd':
      return SysCpuVenId.amd
    case 'arm':
      return SysCpuVenId.arm
    case 'apple':
    case 'qemu':
      return SysCpuVenId.apple
    default:
      throw new Error(`unsupported cpu vendor: ${sysCpuVenId}`)
  }
}

export enum SysOsDeId {
  gnome = 'gnome',
  plasma = 'plasma',
  lxde = 'lxde',
  lxqt = 'lxqt',
  xfce = 'xfce',
}
export function getSysOsDeId(sysOsDeId: string): SysOsDeId {
  switch (sysOsDeId.toLowerCase()) {
    case 'gnome':
      return SysOsDeId.gnome
    case 'kde':
    case 'plasma':
      return SysOsDeId.plasma
    case 'lxde':
    case 'rpd':
      return SysOsDeId.lxde
    case 'lxqt':
      return SysOsDeId.lxqt
    case 'xfce':
      return SysOsDeId.xfce
    default:
      throw new Error(`unsupported os desktop id: ${sysOsDeId}`)
  }
}

export enum SysOsId {
  arch = 'arch',
  debian = 'debian',
  ubuntu = 'ubuntu',
  fedora = 'fedora',
  rocky = 'rocky',
}
export function getSysOsId(sysOsId: string): SysOsId {
  switch (sysOsId.toLowerCase()) {
    case 'arch':
      return SysOsId.arch
    case 'debian':
      return SysOsId.debian
    case 'ubuntu':
      return SysOsId.ubuntu
    case 'fedora':
      return SysOsId.fedora
    case 'rocky':
      return SysOsId.rocky
    default:
      throw new Error(`unsupported os id: ${sysOsId}`)
  }
}

export enum SysOsPlat {
  darwin = 'darwin',
  linux = 'linux',
  winnt = 'winnt',
}
export function getSysOsPlat(sysOsPlat: string): SysOsPlat {
  switch (sysOsPlat.toLowerCase()) {
    case 'darwin':
    case 'macos':
      return SysOsPlat.darwin
    case 'linux':
      return SysOsPlat.linux
    case 'win32':
    case 'windows':
    case 'windows_nt':
    case 'winnt':
      return SysOsPlat.winnt
    default:
      throw new Error(`unsupported os platform: ${sysOsPlat}`)
  }
}
