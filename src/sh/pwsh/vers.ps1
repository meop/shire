& {
  $major = $SH_VERS_MAJOR -as [int]
  $minor = $SH_VERS_MINOR -as [int]

  if ($PSVersionTable.PSVersion.Major -lt $major -or $PSVersionTable.PSVersion.Minor -lt $minor) {
    opPrintErr "pwsh must be >= '${major}.${minor}' .. found '$($PSVersionTable.PSVersion)' .. aborting"
    exit 1
  }
}
