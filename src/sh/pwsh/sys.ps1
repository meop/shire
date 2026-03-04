if ($IsWindows) {
  $SYS_CPU_ARCH = "${env:PROCESSOR_ARCHITECTURE}".ToLower()
} else {
  $SYS_CPU_ARCH = "$(uname -m)".ToLower()
}
$SYS_CPU_ARCH = switch ($SYS_CPU_ARCH) {
  'arm64' { 'aarch64' }
  'amd64' { 'x86_64' }
  default { $SYS_CPU_ARCH }
}
$REQ_URL_SH = "${REQ_URL_SH}?sysCpuArch=${SYS_CPU_ARCH}"

if ($IsWindows) {
  $_raw_ven = "$(Get-WmiObject -Class Win32_Processor | Select-Object -ExpandProperty Manufacturer)".ToLower()
} elseif ($IsLinux) {
  $_raw_ven = "$(lscpu | grep --ignore-case 'vendor id' | cut -d ':' -f 2 | xargs)".ToLower()
} else {
  $_raw_ven = "$(sysctl machdep.cpu.vendor 2> /dev/null | cut -d ':' -f 2 | xargs)".ToLower()
  if (-not $_raw_ven) {
    $_raw_ven = 'apple'
  }
}
$SYS_CPU_VEN_ID = switch ($_raw_ven) {
  'genuineintel' { 'intel' }
  'authenticamd' { 'amd' }
  'qemu'         { 'apple' }
  default        { $_raw_ven }
}
$REQ_URL_SH = "${REQ_URL_SH}&sysCpuVenId=${SYS_CPU_VEN_ID}"

if ($IsWindows) {
  $SYS_HOST = "${env:COMPUTERNAME}".ToLower()
} else {
  $SYS_HOST = "$(hostname)".ToLower()
}
$REQ_URL_SH = "${REQ_URL_SH}&sysHost=${SYS_HOST}"

$_raw_plat = if ($IsMacOS) { 'darwin' } elseif ($IsLinux) { 'linux' } elseif ($IsWindows) { 'winnt' } else { 'unknown' }
$SYS_OS_PLAT = switch ($_raw_plat) {
  'darwin' { 'darwin' }
  'linux'  { 'linux' }
  'winnt'  { 'winnt' }
  default  { $_raw_plat }
}
$REQ_URL_SH = "${REQ_URL_SH}&sysOsPlat=${SYS_OS_PLAT}"

if ($SYS_OS_PLAT -eq 'linux') {
  if (-not $SYS_OS_DE_ID) {
    if ($XDG_SESSION_DESKTOP) {
      $SYS_OS_DE_ID = "${XDG_SESSION_DESKTOP}".ToLower()
    }
    if ($SYS_OS_DE_ID) {
      $SYS_OS_DE_ID = switch ($SYS_OS_DE_ID) {
        'kde'       { 'plasma' }
        'rpd'       { 'lxde' }
        'rpd-labwc' { 'lxde' }
        default     { $SYS_OS_DE_ID }
      }
      $REQ_URL_SH = "${REQ_URL_SH}&sysOsDeId=${SYS_OS_DE_ID}"
    }
  }

  if (Test-Path /etc/os-release) {
    (Get-Content -Path /etc/os-release -Raw | ConvertFrom-StringData).GetEnumerator() |
    ForEach-Object {
      Set-Variable -Name "$($_.Name)" -Value "$($_.Value)".Trim('"')
    }

    if (-not $SYS_OS_ID) {
      if ($ID) {
        $SYS_OS_ID = "${ID}".ToLower()
      }
      if ($SYS_OS_ID) {
        $REQ_URL_SH = "${REQ_URL_SH}&sysOsId=${SYS_OS_ID}"
      }
    }

    if (-not $SYS_OS_ID_LIKE) {
      if ($ID_LIKE) {
        $SYS_OS_ID_LIKE = "${ID_LIKE}".ToLower().Split(' ')[0]
      }
      if ($SYS_OS_ID_LIKE) {
        $REQ_URL_SH = "${REQ_URL_SH}&sysOsIdLike=${SYS_OS_ID_LIKE}"
      }
    }

    if (-not $SYS_OS_VER_ID) {
      if ($VERSION_ID) {
        $SYS_OS_VER_ID = "${VERSION_ID}".ToLower()
      }
      if ($SYS_OS_VER_ID) {
        $REQ_URL_SH = "${REQ_URL_SH}&sysOsVerId=${SYS_OS_VER_ID}"
      }
    }

    if (-not $SYS_OS_VER_CODE) {
      if ($VERSION_CODENAME) {
        $SYS_OS_VER_CODE = "${VERSION_CODENAME}".ToLower()
      }
      if ($SYS_OS_VER_CODE) {
        $REQ_URL_SH = "${REQ_URL_SH}&sysOsVerCode=${SYS_OS_VER_CODE}"
      }
    }
  }
}

if ($IsWindows) {
  $SYS_USER = "${env:USERNAME}".ToLower()
} else {
  $SYS_USER = "$(whoami)".ToLower()
}
$REQ_URL_SH = "${REQ_URL_SH}&sysUser=${SYS_USER}"
