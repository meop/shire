$env.SYS_CPU_ARCH = match (uname | get machine | str downcase) {
  'arm64' => 'aarch64',
  'amd64' => 'x86_64',
  $x => $x,
}
$env.REQ_URL_SH = $"($env.REQ_URL_SH)?sysCpuArch=($env.SYS_CPU_ARCH)"

$env.SYS_CPU_VEND = match (sys cpu | first | get vendor_id | split words | first | str downcase) {
  'genuineintel' => 'intel',
  'authenticamd' => 'amd',
  'qemu' => 'apple',
  $x => $x,
}
$env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysCpuVend=($env.SYS_CPU_VEND)"

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
  if 'SYS_OS_DE' not-in $env {
    if 'XDG_SESSION_DESKTOP' in $env {
      $env.SYS_OS_DE = $env.XDG_SESSION_DESKTOP | str downcase
    }
    if 'SYS_OS_DE' in $env {
      $env.SYS_OS_DE = match $env.SYS_OS_DE {
        'kde' => 'plasma',
        'rpd' | 'rpd-labwc' => 'lxde',
        $x => $x,
      }
      $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsDe=($env.SYS_OS_DE)"
    }
  }

  if ('/etc/os-release' | path exists) {
    open /etc/os-release
      | lines
      | parse "{key}={value}"
      | update value { |v| str trim --char '"' }
      | transpose --as-record --header-row
      | load-env

    if 'SYS_OS' not-in $env {
      if 'ID' in $env {
        $env.SYS_OS = $env.ID | str downcase
      }
      if 'SYS_OS' in $env {
        $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOs=($env.SYS_OS)"
      }
    }

    if 'SYS_OS_LIKE' not-in $env {
      if 'ID_LIKE' in $env {
        $env.SYS_OS_LIKE = $env.ID_LIKE | split words | first | str downcase
      }
      if 'SYS_OS_LIKE' in $env {
        $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsLike=($env.SYS_OS_LIKE)"
      }
    }

    if 'SYS_OS_VERS' not-in $env {
      if 'VERSION_ID' in $env {
        $env.SYS_OS_VERS = $env.VERSION_ID | str downcase
      }
      if 'SYS_OS_VERS' in $env {
        $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsVers=($env.SYS_OS_VERS)"
      }
    }

    if 'SYS_OS_VERS_CODE' not-in $env {
      if 'VERSION_CODENAME' in $env {
        $env.SYS_OS_VERS_CODE = $env.VERSION_CODENAME | str downcase
      }
      if 'SYS_OS_VERS_CODE' in $env {
        $env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysOsVersCode=($env.SYS_OS_VERS_CODE)"
      }
    }
  }
}

$env.SYS_USER = whoami | str downcase
$env.REQ_URL_SH = $"($env.REQ_URL_SH)&sysUser=($env.SYS_USER)"
