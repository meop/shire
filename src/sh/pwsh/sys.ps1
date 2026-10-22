if ($IsWindows) {
  $_raw_arch = "${env:PROCESSOR_ARCHITECTURE}".ToLower()
} else {
  $_raw_arch = "$(uname -m)".ToLower()
}
$env:SYS_CPU_ARCH = switch ($_raw_arch) {
  arm64 { 'aarch64' }
  amd64 { 'x86_64' }
  default { $_raw_arch }
}
$env:REQ_URL_SH = "${env:REQ_URL_SH}?sysCpuArch=${env:SYS_CPU_ARCH}"

if ($IsWindows) {
  $_raw_vend = "$(Get-WmiObject -Class Win32_Processor | Select-Object -ExpandProperty Caption)".ToLower()
} elseif ($IsLinux) {
  $_raw_vend = "$(lscpu | grep --ignore-case 'model name' | cut -d ':' -f 2 | xargs)".ToLower()
} else {
  $_raw_vend = "$(sysctl machdep.cpu.brand_string 2> /dev/null | cut -d ':' -f 2 | xargs)".ToLower()
}
$env:SYS_CPU_VEND = switch -Wildcard ($_raw_vend) {
  amd* { 'amd' }
  apple* { 'apple' }
  arm* { 'arm' }
  intel* { 'intel' }
}
if ($env:SYS_CPU_VEND) {
  $env:REQ_URL_SH = "${env:REQ_URL_SH}&sysCpuVend=${env:SYS_CPU_VEND}"
}

if ($IsWindows) {
  $env:SYS_HOST = "${env:COMPUTERNAME}".ToLower()
} else {
  $env:SYS_HOST = "$(hostname)".ToLower()
}
$env:REQ_URL_SH = "${env:REQ_URL_SH}&sysHost=${env:SYS_HOST}"

$env:SYS_OS_PLAT = if ($IsMacOS) { 'darwin' } elseif ($IsLinux) { 'linux' } elseif ($IsWindows) { 'windows' } else { 'unknown' }
$env:REQ_URL_SH = "${env:REQ_URL_SH}&sysOsPlat=${env:SYS_OS_PLAT}"

if ($env:SYS_OS_PLAT -eq 'linux') {
  if (-not $env:SYS_OS_DE -and $env:XDG_SESSION_DESKTOP) {
    $_de = "${env:XDG_SESSION_DESKTOP}".ToLower()
    $env:SYS_OS_DE = switch ($_de) {
      kde { 'plasma' }
      rpd { 'lxde' }
      rpd-labwc { 'lxde' }
      default { $_de }
    }
    $env:REQ_URL_SH = "${env:REQ_URL_SH}&sysOsDe=${env:SYS_OS_DE}"
  }

  if (Test-Path /etc/os-release) {
    (Get-Content -Path /etc/os-release -Raw | ConvertFrom-StringData).GetEnumerator()
    | ForEach-Object {
      Set-Variable -Name "$($_.Name)" -Value "$($_.Value)".Trim('"')
    }

    if (-not $env:SYS_OS -and $ID) {
      $env:SYS_OS = "${ID}".ToLower()
      $env:REQ_URL_SH = "${env:REQ_URL_SH}&sysOs=${env:SYS_OS}"
    }

    if (-not $env:SYS_OS_LIKE -and $env:SYS_OS) {
      $env:SYS_OS_LIKE = "$(if ($ID_LIKE) { "${env:SYS_OS}_${ID_LIKE}" } else { "${env:SYS_OS}" })".ToLower().Replace(' ', '_')
      $env:REQ_URL_SH = "${env:REQ_URL_SH}&sysOsLike=${env:SYS_OS_LIKE}"
    }

    if (-not $env:SYS_OS_VERS -and $VERSION_ID) {
      $env:SYS_OS_VERS = "${VERSION_ID}".ToLower()
      $env:REQ_URL_SH = "${env:REQ_URL_SH}&sysOsVers=${env:SYS_OS_VERS}"
    }

    if (-not $env:SYS_OS_VERS_CODE -and $VERSION_CODENAME) {
      $env:SYS_OS_VERS_CODE = "${VERSION_CODENAME}".ToLower()
      $env:REQ_URL_SH = "${env:REQ_URL_SH}&sysOsVersCode=${env:SYS_OS_VERS_CODE}"
    }
  }
}

if ($IsWindows) {
  $env:SYS_USER = "${env:USERNAME}".ToLower()
} else {
  $env:SYS_USER = "$(whoami)".ToLower()
}
$env:REQ_URL_SH = "${env:REQ_URL_SH}&sysUser=${env:SYS_USER}"
