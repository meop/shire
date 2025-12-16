/**
 * This module contains components for building system implementations
 * @module
 */

/**
 * Enumeration of supported CPU architectures
 */
export enum SysCpuArch {
  aarch64 = 'aarch64',
  x86_64 = 'x86_64',
}

/**
 * Converts a string representation of CPU architecture to the corresponding enum value
 * @param sysCpuArch - The CPU architecture string to convert
 * @returns The corresponding SysCpuArch enum value
 * @throws Error if the CPU architecture is unsupported
 */
export function getSysCpuArch(sysCpuArch: string): SysCpuArch {
  switch (sysCpuArch.toLowerCase()) {
    case 'arm64':
    case 'aarch64':
      return SysCpuArch.aarch64
    case 'amd64':
    case 'x64':
    case 'x86_64':
      return SysCpuArch.x86_64
    default:
      throw new Error(`unsupported cpu architecture: ${sysCpuArch}`)
  }
}

/**
 * Enumeration of supported CPU vendor IDs
 */
export enum SysCpuVenId {
  apple = 'apple',
  amd = 'amd',
  arm = 'arm',
  intel = 'intel',
}

/**
 * Converts a string representation of CPU vendor to the corresponding enum value
 * @param sysCpuVenId - The CPU vendor string to convert
 * @returns The corresponding SysCpuVenId enum value
 * @throws Error if the CPU vendor is unsupported
 */
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

/**
 * Enumeration of supported OS desktop environments
 */
export enum SysOsDeId {
  gnome = 'gnome',
  plasma = 'plasma',
  lxde = 'lxde',
  lxqt = 'lxqt',
  xfce = 'xfce',
}

/**
 * Converts a string representation of OS desktop environment to the corresponding enum value
 * @param sysOsDeId - The OS desktop environment string to convert
 * @returns The corresponding SysOsDeId enum value
 * @throws Error if the OS desktop environment is unsupported
 */
export function getSysOsDeId(sysOsDeId: string): SysOsDeId {
  switch (sysOsDeId.toLowerCase()) {
    case 'gnome':
      return SysOsDeId.gnome
    case 'kde':
    case 'plasma':
      return SysOsDeId.plasma
    case 'rpd-labwc':
    case 'rpd':
    case 'lxde':
      return SysOsDeId.lxde
    case 'lxqt':
      return SysOsDeId.lxqt
    case 'xfce':
      return SysOsDeId.xfce
    default:
      throw new Error(`unsupported os desktop id: ${sysOsDeId}`)
  }
}

/**
 * Enumeration of supported OS IDs
 */
export enum SysOsId {
  arch = 'arch',
  debian = 'debian',
  ubuntu = 'ubuntu',
  fedora = 'fedora',
  redhat = 'redhat',
  suse = 'suse',
  void = 'void',
}

/**
 * Converts a string representation of OS ID to the corresponding enum value
 * @param sysOsId - The OS ID string to convert
 * @param sysOsIdLike - Optional the OS ID Like string to convert
 * @returns The corresponding SysOsId enum value
 * @throws Error if the OS ID is unsupported
 */
export function getSysOsId(sysOsId: string, sysOsIdLike?: string): SysOsId {
  switch (sysOsId.toLowerCase()) {
    case 'manjaro':
    case 'archarm':
    case 'arch':
      return SysOsId.arch
    case 'debian':
      return SysOsId.debian
    case 'linuxmint':
    case 'mint':
      return sysOsIdLike?.includes('debian') ? SysOsId.debian : SysOsId.ubuntu
    case 'ubuntu':
      return SysOsId.ubuntu
    case 'fedora':
      return SysOsId.fedora
    case 'centos-stream':
    case 'centos':
    case 'rocky':
    case 'rhel':
      return SysOsId.redhat
    case 'opensuse-tumbleweed':
    case 'opensuse':
    case 'suse':
      return SysOsId.suse
    case 'void':
      return SysOsId.void
    default:
      throw new Error(`unsupported os id: ${sysOsId}`)
  }
}

/**
 * Enumeration of supported OS platforms
 */
export enum SysOsPlat {
  darwin = 'darwin',
  linux = 'linux',
  winnt = 'winnt',
}

/**
 * Converts a string representation of OS platform to the corresponding enum value
 * @param sysOsPlat - The OS platform string to convert
 * @returns The corresponding SysOsPlat enum value
 * @throws Error if the OS platform is unsupported
 */
export function getSysOsPlat(sysOsPlat: string): SysOsPlat {
  switch (sysOsPlat.toLowerCase()) {
    case 'macos':
    case 'darwin':
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
