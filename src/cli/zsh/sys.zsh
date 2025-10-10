export SYS_CPU_ARCH="${(L)$(uname -m)}"
export REQ_URL_CLI="${REQ_URL_CLI}?sysCpuArch=${SYS_CPU_ARCH}"

if type lscpu > /dev/null; then
  export SYS_CPU_VEN_ID="${(L)$(lscpu | grep --ignore-case 'vendor id' | cut -d ':' -f 2 | xargs)}"
elif type sysctl > /dev/null; then
  export SYS_CPU_VEN_ID="${(L)$(sysctl machdep.cpu.vendor 2> /dev/null | cut -d ':' -f 2 | xargs)}"
  if [[ -z $SYS_CPU_VEN_ID ]]; then
    export SYS_CPU_VEN_ID="${(L)$(echo 'Apple')}"
  fi
fi
export REQ_URL_CLI="${REQ_URL_CLI}&sysCpuVenId=${SYS_CPU_VEN_ID}"

export SYS_HOST="${(L)$(hostname)}"
export REQ_URL_CLI="${REQ_URL_CLI}&sysHost=${SYS_HOST}"

export SYS_OS_PLAT="${(L)$(uname)}"
export REQ_URL_CLI="${REQ_URL_CLI}&sysOsPlat=${SYS_OS_PLAT}"

if [[ $SYS_OS_PLAT == 'linux' ]]; then
  if [[ -z $SYS_OS_DE_ID ]]; then
    if [[ $XDG_SESSION_DESKTOP ]]; then
      export SYS_OS_DE_ID="${(L)XDG_SESSION_DESKTOP}"
    fi
    if [[ $SYS_OS_DE_ID ]]; then
      export REQ_URL_CLI="${REQ_URL_CLI}&sysOsDeId=${SYS_OS_DE_ID}"
    fi
  fi

  if [[ -f /etc/os-release ]]; then
    source /etc/os-release

    if [[ -z $SYS_OS_ID ]]; then
      if [[ $ID ]]; then
        export SYS_OS_ID="${(L)ID}"
      fi
      if [[ $SYS_OS_ID ]]; then
        export REQ_URL_CLI="${REQ_URL_CLI}&sysOsId=${SYS_OS_ID}"
      fi
    fi

    if [[ -z $SYS_OS_ID_LIKE ]]; then
      if [[ $ID_LIKE ]]; then
        export SYS_OS_ID_LIKE="${(L)ID_LIKE%% *}"
      fi
      if [[ $SYS_OS_ID_LIKE ]]; then
        export REQ_URL_CLI="${REQ_URL_CLI}&sysOsIdLike=${SYS_OS_ID_LIKE}"
      fi
    fi

    if [[ -z $SYS_OS_VER_ID ]]; then
      if [[ $VERSION_ID ]]; then
        export SYS_OS_VER_ID="${(L)VERSION_ID}"
      fi
      if [[ $SYS_OS_VER_ID ]]; then
        export REQ_URL_CLI="${REQ_URL_CLI}&sysOsVerId=${SYS_OS_VER_ID}"
      fi
    fi

    if [[ -z $SYS_OS_VER_CODE ]]; then
      if [[ $VERSION_CODENAME ]]; then
        export SYS_OS_VER_CODE="${(L)VERSION_CODENAME}"
      fi
      if [[ $SYS_OS_VER_CODE ]]; then
        export REQ_URL_CLI="${REQ_URL_CLI}&sysOsVerCode=${SYS_OS_VER_CODE}"
      fi
    fi
  fi
fi

export SYS_USER="${(L)$(whoami)}"
export REQ_URL_CLI="${REQ_URL_CLI}&sysUser=${SYS_USER}"
