do {
  mut major = 0
  mut minor = 0

  if 'SYS_VER_MAJOR' in $env {
    $major = $env.SYS_VER_MAJOR
    if 'SYS_VER_MINOR' in $env {
      $minor = $env.SYS_VER_MINOR
    }
  }

  if ((version | get major) < $major) or ((version | get minor) < $minor) {
    opPrintErr $"nu must be >= '($major).($minor)' .. found '(version | get version)' .. aborting"
    exit 1
  }
}
