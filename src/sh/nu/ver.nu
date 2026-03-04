do {
  let major = $env.SH_VER_MAJOR | into int
  let minor = $env.SH_VER_MINOR | into int

  if ((version | get major) < $major) or ((version | get minor) < $minor) {
    opPrintErr $"nu must be >= '($major).($minor)' .. found '(version | get version)' .. aborting"
    exit 1
  }
}
