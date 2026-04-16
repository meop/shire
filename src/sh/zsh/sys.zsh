_raw_arch="${(L)$(uname -m)}"
case "$_raw_arch" in
  arm64) export SYS_CPU_ARCH='aarch64' ;;
  amd64) export SYS_CPU_ARCH='x86_64' ;;
  *) export SYS_CPU_ARCH="$_raw_arch" ;;
esac
export REQ_URL_SH="${REQ_URL_SH}?sysCpuArch=${SYS_CPU_ARCH}"

if type lscpu > /dev/null; then
  _raw_vend="${(L)$(lscpu | grep --ignore-case 'model name' | cut -d ':' -f 2 | xargs)}"
elif type sysctl > /dev/null; then
  _raw_vend="${(L)$(sysctl machdep.cpu.brand_string 2> /dev/null | cut -d ':' -f 2 | xargs)}"
fi
case "$_raw_vend" in
  intel*) export SYS_CPU_VEND='intel' ;;
  amd*) export SYS_CPU_VEND='amd' ;;
  arm*) export SYS_CPU_VEND='arm' ;;
  apple*) export SYS_CPU_VEND='apple' ;;
esac
if [[ $SYS_CPU_VEND ]]; then
  export REQ_URL_SH="${REQ_URL_SH}&sysCpuVend=${SYS_CPU_VEND}"
fi

export SYS_HOST="${(L)$(hostname)}"
export REQ_URL_SH="${REQ_URL_SH}&sysHost=${SYS_HOST}"

_raw_plat="${(L)$(uname)}"
case "$_raw_plat" in
  darwin) export SYS_OS_PLAT='darwin' ;;
  linux) export SYS_OS_PLAT='linux' ;;
  *) export SYS_OS_PLAT="$_raw_plat" ;;
esac
export REQ_URL_SH="${REQ_URL_SH}&sysOsPlat=${SYS_OS_PLAT}"

if [[ $SYS_OS_PLAT == 'linux' ]]; then
  if [[ -z $SYS_OS_DE ]] && [[ $XDG_SESSION_DESKTOP ]]; then
    _raw_de="${(L)XDG_SESSION_DESKTOP}"
    case "$_raw_de" in
      kde) export SYS_OS_DE='plasma' ;;
      rpd|rpd-labwc) export SYS_OS_DE='lxde' ;;
      *) export SYS_OS_DE="$_raw_de" ;;
    esac
    export REQ_URL_SH="${REQ_URL_SH}&sysOsDe=${SYS_OS_DE}"
  fi

  if [[ -f /etc/os-release ]]; then
    source /etc/os-release

    if [[ -z $SYS_OS ]] && [[ $ID ]]; then
      export SYS_OS="${(L)ID}"
      export REQ_URL_SH="${REQ_URL_SH}&sysOs=${SYS_OS}"
    fi

    if [[ -z $SYS_OS_LIKE ]] && [[ $SYS_OS ]]; then
      export SYS_OS_LIKE="${SYS_OS}${ID_LIKE:+_${(L)${ID_LIKE// /_}}}"
      export REQ_URL_SH="${REQ_URL_SH}&sysOsLike=${SYS_OS_LIKE}"
    fi

    if [[ -z $SYS_OS_VERS ]] && [[ $VERSION_ID ]]; then
      export SYS_OS_VERS="${(L)VERSION_ID}"
      export REQ_URL_SH="${REQ_URL_SH}&sysOsVers=${SYS_OS_VERS}"
    fi

    if [[ -z $SYS_OS_VERS_CODE ]] && [[ $VERSION_CODENAME ]]; then
      export SYS_OS_VERS_CODE="${(L)VERSION_CODENAME}"
      export REQ_URL_SH="${REQ_URL_SH}&sysOsVersCode=${SYS_OS_VERS_CODE}"
    fi
  fi
fi

export SYS_USER="${(L)$(whoami)}"
export REQ_URL_SH="${REQ_URL_SH}&sysUser=${SYS_USER}"
