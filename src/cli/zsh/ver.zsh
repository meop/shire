function () {
  local major=0
  local minor=0

  if [[ $SH_VER_MAJOR ]]; then
    major=$SH_VER_MAJOR
    if [[ $SH_VER_MINOR ]]; then
      minor=$SH_VER_MINOR
    fi
  fi

  autoload is-at-least
  if ! is-at-least "${major}.${minor}"; then
    opPrintErr "zsh must be >= '${major}.${minor}' .. found '${ZSH_VERSION}' .. aborting"
    exit 1
  fi
}
