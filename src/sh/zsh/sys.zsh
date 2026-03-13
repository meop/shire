_raw_arch="${(L)$(uname -m)}"
case "$_raw_arch" in
  arm64)   export SYS_CPU_ARCH='aarch64' ;;
  amd64)   export SYS_CPU_ARCH='x86_64' ;;
  *)       export SYS_CPU_ARCH="$_raw_arch" ;;
esac
export REQ_URL_SH="${REQ_URL_SH}?sysCpuArch=${SYS_CPU_ARCH}"

if type lscpu > /dev/null; then
  _raw_ven="${(L)$(lscpu | grep --ignore-case 'vendor id' | cut -d ':' -f 2 | xargs)}"
elif type sysctl > /dev/null; then
  _raw_ven="${(L)$(sysctl machdep.cpu.vendor 2> /dev/null | cut -d ':' -f 2 | xargs)}"
  if [[ -z $_raw_ven ]]; then
    _raw_ven='apple'
  fi
fi
case "$_raw_ven" in
  genuineintel) export SYS_CPU_VEND='intel' ;;
  authenticamd) export SYS_CPU_VEND='amd' ;;
  qemu)         export SYS_CPU_VEND='apple' ;;
  *)            export SYS_CPU_VEND="$_raw_ven" ;;
esac
export REQ_URL_SH="${REQ_URL_SH}&sysCpuVend=${SYS_CPU_VEND}"

export SYS_HOST="${(L)$(hostname)}"
export REQ_URL_SH="${REQ_URL_SH}&sysHost=${SYS_HOST}"

_raw_plat="${(L)$(uname)}"
case "$_raw_plat" in
  darwin) export SYS_OS_PLAT='darwin' ;;
  linux)  export SYS_OS_PLAT='linux' ;;
  *)      export SYS_OS_PLAT="$_raw_plat" ;;
esac
export REQ_URL_SH="${REQ_URL_SH}&sysOsPlat=${SYS_OS_PLAT}"

if [[ $SYS_OS_PLAT == 'linux' ]]; then
  if [[ -z $SYS_OS_DE ]]; then
    if [[ $XDG_SESSION_DESKTOP ]]; then
      export SYS_OS_DE="${(L)XDG_SESSION_DESKTOP}"
    fi
    if [[ $SYS_OS_DE ]]; then
      case "$SYS_OS_DE" in
        kde)       export SYS_OS_DE='plasma' ;;
        rpd|rpd-labwc) export SYS_OS_DE='lxde' ;;
      esac
      export REQ_URL_SH="${REQ_URL_SH}&sysOsDe=${SYS_OS_DE}"
    fi
  fi

  if [[ -f /etc/os-release ]]; then
    source /etc/os-release

    if [[ -z $SYS_OS ]]; then
      if [[ $ID ]]; then
        export SYS_OS="${(L)ID}"
      fi
      if [[ $SYS_OS ]]; then
        export REQ_URL_SH="${REQ_URL_SH}&sysOs=${SYS_OS}"
      fi
    fi

    if [[ -z $SYS_OS_LIKE ]]; then
      if [[ $ID_LIKE ]]; then
        export SYS_OS_LIKE="${(L)ID_LIKE%% *}"
      fi
      if [[ $SYS_OS_LIKE ]]; then
        export REQ_URL_SH="${REQ_URL_SH}&sysOsLike=${SYS_OS_LIKE}"
      fi
    fi

    if [[ -z $SYS_OS_VERS ]]; then
      if [[ $VERSION_ID ]]; then
        export SYS_OS_VERS="${(L)VERSION_ID}"
      fi
      if [[ $SYS_OS_VERS ]]; then
        export REQ_URL_SH="${REQ_URL_SH}&sysOsVers=${SYS_OS_VERS}"
      fi
    fi

    if [[ -z $SYS_OS_VERS_CODE ]]; then
      if [[ $VERSION_CODENAME ]]; then
        export SYS_OS_VERS_CODE="${(L)VERSION_CODENAME}"
      fi
      if [[ $SYS_OS_VERS_CODE ]]; then
        export REQ_URL_SH="${REQ_URL_SH}&sysOsVersCode=${SYS_OS_VERS_CODE}"
      fi
    fi
  fi
fi

export SYS_USER="${(L)$(whoami)}"
export REQ_URL_SH="${REQ_URL_SH}&sysUser=${SYS_USER}"
