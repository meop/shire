function () {
  local major=$SH_VERS_MAJOR
  local minor=$SH_VERS_MINOR

  autoload is-at-least
  if ! is-at-least "${major}.${minor}"; then
    opPrintErr "zsh must be >= '${major}.${minor}' .. found '${ZSH_VERSION}' .. aborting"
    exit 1
  fi
}
