if ($IsWindows) {
  $_raw_arch = "${env:PROCESSOR_ARCHITECTURE}".ToLower()
} else {
  $_raw_arch = "$(uname -m)".ToLower()
}
$SYS_CPU_ARCH = switch ($_raw_arch) {
  'arm64' { 'aarch64' }
  'amd64' { 'x86_64' }
  default { $_raw_arch }
}
$REQ_URL_SH = "${REQ_URL_SH}?sysCpuArch=${SYS_CPU_ARCH}"

if ($IsWindows) {
  $_raw_vend = "$(Get-WmiObject -Class Win32_Processor | Select-Object -ExpandProperty Caption)".ToLower()
} elseif ($IsLinux) {
  $_raw_vend = "$(lscpu | grep --ignore-case 'model name' | cut -d ':' -f 2 | xargs)".ToLower()
} else {
  $_raw_vend = "$(sysctl machdep.cpu.brand_string 2> /dev/null | cut -d ':' -f 2 | xargs)".ToLower()
}
$SYS_CPU_VEND = switch -Wildcard ($_raw_vend) {
  'intel*' { 'intel' }
  'amd*' { 'amd' }
  'arm*' { 'arm' }
  'apple*' { 'apple' }
}
if ($SYS_CPU_VEND) {
  $REQ_URL_SH = "${REQ_URL_SH}&sysCpuVend=${SYS_CPU_VEND}"
}

if ($IsWindows) {
  $SYS_HOST = "${env:COMPUTERNAME}".ToLower()
} else {
  $SYS_HOST = "$(hostname)".ToLower()
}
$REQ_URL_SH = "${REQ_URL_SH}&sysHost=${SYS_HOST}"

$SYS_OS_PLAT = if ($IsMacOS) { 'darwin' } elseif ($IsLinux) { 'linux' } elseif ($IsWindows) { 'winnt' } else { 'unknown' }
$REQ_URL_SH = "${REQ_URL_SH}&sysOsPlat=${SYS_OS_PLAT}"

if ($SYS_OS_PLAT -eq 'linux') {
  if (-not $SYS_OS_DE -and $XDG_SESSION_DESKTOP) {
    $_de = "${XDG_SESSION_DESKTOP}".ToLower()
    $SYS_OS_DE = switch ($_de) {
      'kde' { 'plasma' }
      'rpd' { 'lxde' }
      'rpd-labwc' { 'lxde' }
      default { $_de }
    }
    $REQ_URL_SH = "${REQ_URL_SH}&sysOsDe=${SYS_OS_DE}"
  }

  if (Test-Path /etc/os-release) {
    (Get-Content -Path /etc/os-release -Raw | ConvertFrom-StringData).GetEnumerator()
    | ForEach-Object {
      Set-Variable -Name "$($_.Name)" -Value "$($_.Value)".Trim('"')
    }

    if (-not $SYS_OS -and $ID) {
      $SYS_OS = "${ID}".ToLower()
      $REQ_URL_SH = "${REQ_URL_SH}&sysOs=${SYS_OS}"
    }

    if (-not $SYS_OS_LIKE -and $SYS_OS) {
      $SYS_OS_LIKE = (if ($ID_LIKE) { "${SYS_OS}_${ID_LIKE}" } else { "${SYS_OS}" }).ToLower().Replace(' ', '_')
      $REQ_URL_SH = "${REQ_URL_SH}&sysOsLike=${SYS_OS_LIKE}"
    }

    if (-not $SYS_OS_VERS -and $VERSION_ID) {
      $SYS_OS_VERS = "${VERSION_ID}".ToLower()
      $REQ_URL_SH = "${REQ_URL_SH}&sysOsVers=${SYS_OS_VERS}"
    }

    if (-not $SYS_OS_VERS_CODE -and $VERSION_CODENAME) {
      $SYS_OS_VERS_CODE = "${VERSION_CODENAME}".ToLower()
      $REQ_URL_SH = "${REQ_URL_SH}&sysOsVersCode=${SYS_OS_VERS_CODE}"
    }
  }
}

if ($IsWindows) {
  $SYS_USER = "${env:USERNAME}".ToLower()
} else {
  $SYS_USER = "$(whoami)".ToLower()
}
$REQ_URL_SH = "${REQ_URL_SH}&sysUser=${SYS_USER}"
