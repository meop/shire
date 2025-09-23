& {
  $major = 7
  $minor = 5

  if ($CLI_VER_MAJOR) {
    $major = $CLI_VER_MAJOR -as [int]
    if ($CLI_VER_MINOR) {
      $minor = $CLI_VER_MINOR -as [int]
    }
  }

  if ($PSVersionTable.PSVersion.Major -lt $major -or $PSVersionTable.PSVersion.Minor -lt $minor) {
    opPrintErr "pwsh must be >= '${major}.${minor}' .. found '$($PSVersionTable.PSVersion)' .. aborting"
    exit 1
  }
}
