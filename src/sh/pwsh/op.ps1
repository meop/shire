function opPrint {
  if ($SUCCINCT) {
    return
  }
  [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
}

function opPrintErr {
  if ($SUCCINCT) {
    return
  }
  if ($GRAYSCALE) {
    [Console]::Error.WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  [Console]::ForegroundColor = 'red'
  [Console]::Error.WriteLine((($args | ForEach-Object { $_ }) -join ' '))
  [Console]::ResetColor()
}

function opPrintSucc {
  if ($SUCCINCT) {
    return
  }
  if ($GRAYSCALE) {
    [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  [Console]::ForegroundColor = 'green'
  [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
  [Console]::ResetColor()
}

function opPrintWarn {
  if ($SUCCINCT) {
    return
  }
  if ($GRAYSCALE) {
    [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  [Console]::ForegroundColor = 'yellow'
  [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
  [Console]::ResetColor()
}

function opPrintInfo {
  if ($SUCCINCT) {
    return
  }
  if ($GRAYSCALE) {
    [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  [Console]::ForegroundColor = 'blue'
  [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
  [Console]::ResetColor()
}

function opPrintCmd {
  if ($SUCCINCT) {
    return
  }
  if ($GRAYSCALE) {
    [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  $_args = $args | ForEach-Object { $_ }
  [Console]::ForegroundColor = 'magenta'
  [Console]::Write($_args[0])
  [Console]::ResetColor()
  if ($args.Length -gt 1) {
    [Console]::Write(' ')
    [Console]::ForegroundColor = 'cyan'
    [Console]::WriteLine((($_args | Select-Object -Skip 1) -join ' '))
    [Console]::ResetColor()
  }
}

function opMaybePrintCmd {
  if (-not $NOOP) {
    opPrintCmd @args
  }
}

function opRunCmd {
  Invoke-Expression "$(($args | ForEach-Object { $_ }) -join ' ')"
}

function opRunSilentCmd {
  Invoke-Expression "$(($args | ForEach-Object { $_ }) -join ' ') 6>&1 5>&1 4>&1 3>&1 2>&1 | Out-Null"
}

function opMaybeRunCmd {
  if (-not $NOOP) {
    opRunCmd @args
  }
}

function opMaybeRunSilentCmd {
  if (-not $NOOP) {
    opRunSilentCmd @args
  }
}

function opPrintRunCmd {
  opPrintCmd @args
  opRunCmd @args
}

function opPrintMaybeRunCmd {
  opPrintCmd @args
  opMaybeRunCmd @args
}
