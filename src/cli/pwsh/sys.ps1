if ($IsWindows) {
  $SYS_CPU_ARCH = "${env:PROCESSOR_ARCHITECTURE}".ToLower()
} else {
  $SYS_CPU_ARCH = "$(uname -m)".ToLower()
}
$REQ_URL_CLI = "${REQ_URL_CLI}?sysCpuArch=${SYS_CPU_ARCH}"

if ($IsWindows) {
  $SYS_CPU_VEN_ID = "$(Get-WmiObject -Class Win32_Processor | Select-Object -ExpandProperty Manufacturer)".ToLower()
} elseif ($IsLinux) {
  $SYS_CPU_VEN_ID = "$(lscpu | grep --ignore-case 'vendor id' | cut -d ':' -f 2 | xargs)".ToLower()
} else {
  $SYS_CPU_VEN_ID = "$(sysctl machdep.cpu.vendor 2> /dev/null | cut -d ':' -f 2 | xargs)".ToLower()
  if (-not $SYS_CPU_VEN_ID) {
    $SYS_CPU_VEN_ID = 'Apple'.ToLower()
  }
}
$REQ_URL_CLI = "${REQ_URL_CLI}&sysCpuVenId=${SYS_CPU_VEN_ID}"

if ($IsWindows) {
  $SYS_HOST = "${env:COMPUTERNAME}".ToLower()
} else {
  $SYS_HOST = "$(hostname)".ToLower()
}
$REQ_URL_CLI = "${REQ_URL_CLI}&sysHost=${SYS_HOST}"

if ($IsWindows) {
  $SYS_OS_PLAT = 'winnt'
} elseif ($IsLinux) {
  $SYS_OS_PLAT = 'linux'
} else {
  $SYS_OS_PLAT = 'darwin'
}
$REQ_URL_CLI = "${REQ_URL_CLI}&sysOsPlat=${SYS_OS_PLAT}"

if ($SYS_OS_PLAT -eq 'linux') {
  if (-not $SYS_OS_DE_ID) {
    if ($XDG_SESSION_DESKTOP) {
      $SYS_OS_DE_ID = "${XDG_SESSION_DESKTOP}".ToLower()
    }
    if ($SYS_OS_DE_ID) {
      $REQ_URL_CLI = "${REQ_URL_CLI}&sysOsDeId=${SYS_OS_DE_ID}"
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
        $REQ_URL_CLI = "${REQ_URL_CLI}&sysOsId=${SYS_OS_ID}"
      }
    }

    if (-not $SYS_OS_ID_LIKE) {
      if ($ID_LIKE) {
        $SYS_OS_ID_LIKE = "${ID_LIKE}".ToLower().Split(' ')[0]
      }
      if ($SYS_OS_ID_LIKE) {
        $REQ_URL_CLI = "${REQ_URL_CLI}&sysOsIdLike=${SYS_OS_ID_LIKE}"
      }
    }

    if (-not $SYS_OS_VER_ID) {
      if ($VERSION_ID) {
        $SYS_OS_VER_ID = "${VERSION_ID}".ToLower()
      }
      if ($SYS_OS_VER_ID) {
        $REQ_URL_CLI = "${REQ_URL_CLI}&sysOsVerId=${SYS_OS_VER_ID}"
      }
    }

    if (-not $SYS_OS_VER_CODE) {
      if ($VERSION_CODENAME) {
        $SYS_OS_VER_CODE = "${VERSION_CODENAME}".ToLower()
      }
      if ($SYS_OS_VER_CODE) {
        $REQ_URL_CLI = "${REQ_URL_CLI}&sysOsVerCode=${SYS_OS_VER_CODE}"
      }
    }
  }
}

if ($IsWindows) {
  $SYS_USER = "${env:USERNAME}".ToLower()
} else {
  $SYS_USER = "$(whoami)".ToLower()
}
$REQ_URL_CLI = "${REQ_URL_CLI}&sysUser=${SYS_USER}"
