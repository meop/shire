function () {
  local major=$CLI_VER_MAJOR
  local minor=$CLI_VER_MINOR

  autoload is-at-least
  if ! is-at-least "${major}.${minor}"; then
    opPrintErr "zsh must be >= '${major}.${minor}' .. found '${ZSH_VERSION}' .. aborting"
    exit 1
  fi
}
