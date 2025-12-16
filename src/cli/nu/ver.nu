do {
  mut major = 0
  mut minor = 109

  if 'CLI_VER_MAJOR' in $env {
    $major = $env.CLI_VER_MAJOR | into int
    if 'CLI_VER_MINOR' in $env {
      $minor = $env.CLI_VER_MINOR | into int
    }
  }

  if ((version | get major) < $major) or ((version | get minor) < $minor) {
    opPrintErr $"nu must be >= '($major).($minor)' .. found '(version | get version)' .. aborting"
    exit 1
  }
}
