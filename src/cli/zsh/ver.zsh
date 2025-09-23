function () {
  local major=5
  local minor=9

  if [[ $CLI_VER_MAJOR ]]; then
    major=$CLI_VER_MAJOR
    if [[ $CLI_VER_MINOR ]]; then
      minor=$CLI_VER_MINOR
    fi
  fi

  autoload is-at-least
  if ! is-at-least "${major}.${minor}"; then
    opPrintErr "zsh must be >= '${major}.${minor}' .. found '${ZSH_VERSION}' .. aborting"
    exit 1
  fi
}
