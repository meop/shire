function opPrint {
  if ($env:SUCCINCT) {
    return
  }
  [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
}

function opPrintErr {
  if ($env:SUCCINCT) {
    return
  }
  if ($env:GRAYSCALE) {
    [Console]::Error.WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  [Console]::ForegroundColor = 'red'
  [Console]::Error.WriteLine((($args | ForEach-Object { $_ }) -join ' '))
  [Console]::ResetColor()
}

function opPrintSucc {
  if ($env:SUCCINCT) {
    return
  }
  if ($env:GRAYSCALE) {
    [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  [Console]::ForegroundColor = 'green'
  [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
  [Console]::ResetColor()
}

function opPrintWarn {
  if ($env:SUCCINCT) {
    return
  }
  if ($env:GRAYSCALE) {
    [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  [Console]::ForegroundColor = 'yellow'
  [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
  [Console]::ResetColor()
}

function opPrintInfo {
  if ($env:SUCCINCT) {
    return
  }
  if ($env:GRAYSCALE) {
    [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  [Console]::ForegroundColor = 'blue'
  [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
  [Console]::ResetColor()
}

function opPrintCmd {
  if ($env:SUCCINCT) {
    return
  }
  if ($env:GRAYSCALE) {
    [Console]::WriteLine((($args | ForEach-Object { $_ }) -join ' '))
    return
  }
  $_args = @($args | ForEach-Object { $_ })
  [Console]::ForegroundColor = 'magenta'
  [Console]::Write($_args[0])
  [Console]::ResetColor()
  if ($_args.Count -gt 1) {
    [Console]::Write(' ')
    [Console]::ForegroundColor = 'cyan'
    [Console]::WriteLine((($_args | Select-Object -Skip 1) -join ' '))
    [Console]::ResetColor()
  } else {
    [Console]::WriteLine()
  }
}

function opMaybePrintCmd {
  if (-not $env:NOOP) {
    opPrintCmd @args
  }
}

function opRunCmd {
  Invoke-Expression "$(($args | ForEach-Object { $_ }) -join ' ')"
}

function opRunSilentCmd {
  Invoke-Expression "$(($args | ForEach-Object { $_ }) -join ' ') 6>&1 5>&1 4>&1 3>&1 2>&1 | Out-Null"
}

# a yes/no question: empty, y or yes is yes, and YES answers yes without asking. with no terminal to answer from,
# as under cron or a pipe, it is no: Read-Host would return null there, which is nobody's answer
function opAsk {
  param([string] $question)
  if ($env:YES) {
    return $true
  }
  if ([Console]::IsInputRedirected) {
    opPrintWarn "${question}: no terminal to answer from, so no; YES answers yes"
    return $false
  }
  $yn = Read-Host "${question} [[y]/n]"
  return ($yn -eq '') -or ($yn.ToLower() -eq 'y') -or ($yn.ToLower() -eq 'yes')
}

function opMaybeRunCmd {
  if (-not $env:NOOP) {
    opRunCmd @args
  }
}

function opMaybeRunSilentCmd {
  if (-not $env:NOOP) {
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
