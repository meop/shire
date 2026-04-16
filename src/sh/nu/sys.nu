$env.SYS_CPU_ARCH = match (uname | get machine | str downcase) {
  'arm64' => 'aarch64',
  'amd64' => 'x86_64',
  $x => $x,
}
$env.REQ_URL_SH = $"($env.REQ_URL_SH)?sysCpuArch=($env.SYS_CPU_ARCH)"

let _raw_vend = sys cpu | first | get name | str downcase
$env.SYS_CPU_VEND = match $_raw_vend {
  $x if ($x | str starts-with 'intel') => 'intel',
  $x if ($x | str starts-with 'amd') => 'amd',
  $x if ($x | str starts-with 'arm') => 'arm',
  $x if ($x | str starts-with 'apple') => 'apple',
}
if $env.SYS_CPU_VEND != null {
  $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysCpuVend=($env.SYS_CPU_VEND)"
}

$env.SYS_HOST = sys host | get hostname | str downcase
$env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysHost=($env.SYS_HOST)"

$env.SYS_OS_PLAT = match (uname | get kernel-name | str downcase) {
  'darwin' => 'darwin',
  'linux' => 'linux',
  'windows_nt' => 'winnt',
  $x => $x,
}
$env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsPlat=($env.SYS_OS_PLAT)"

if $env.SYS_OS_PLAT == 'linux' {
  if 'SYS_OS_DE' not-in $env and 'XDG_SESSION_DESKTOP' in $env {
    $env.SYS_OS_DE = match ($env.XDG_SESSION_DESKTOP | str downcase) {
      'kde' => 'plasma',
      'rpd' | 'rpd-labwc' => 'lxde',
      $x => $x,
    }
    $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsDe=($env.SYS_OS_DE)"
  }

  if ('/etc/os-release' | path exists) {
    open /etc/os-release
      | lines
      | parse "{key}={value}"
      | update value { |v| str trim --char '"' }
      | transpose --as-record --header-row
      | load-env

    if 'SYS_OS' not-in $env and 'ID' in $env {
      $env.SYS_OS = $env.ID | str downcase
      $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOs=($env.SYS_OS)"
    }

    if 'SYS_OS_LIKE' not-in $env and 'SYS_OS' in $env {
      $env.SYS_OS_LIKE = if 'ID_LIKE' in $env { $"($env.SYS_OS)_($env.ID_LIKE | str downcase)" } else { $env.SYS_OS } | str replace --all ' ' '_'
      $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsLike=($env.SYS_OS_LIKE)"
    }

    if 'SYS_OS_VERS' not-in $env and 'VERSION_ID' in $env {
      $env.SYS_OS_VERS = $env.VERSION_ID | str downcase
      $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsVers=($env.SYS_OS_VERS)"
    }

    if 'SYS_OS_VERS_CODE' not-in $env and 'VERSION_CODENAME' in $env {
      $env.SYS_OS_VERS_CODE = $env.VERSION_CODENAME | str downcase
      $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsVersCode=($env.SYS_OS_VERS_CODE)"
    }
  }
}

$env.SYS_USER = whoami | str downcase
$env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysUser=($env.SYS_USER)"
