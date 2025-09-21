& {
  $major = 0
  $minor = 0

  if ($SH_VER_MAJOR) {
    $major = "${SH_VER_MAJOR}" -as [int]
    if ($SH_VER_MINOR) {
      $minor = "${SH_VER_MINOR}" -as [int]
    }
  }

  if ($PSVersionTable.PSVersion.Major -lt $major -or $PSVersionTable.PSVersion.Minor -lt $minor) {
    opPrintErr "pwsh must be >= '${major}.${minor}' .. found '$($PSVersionTable.PSVersion)' .. aborting"
    exit 1
  }
}
