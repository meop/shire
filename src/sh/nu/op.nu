def opPrint --wrapped [...args] {
  if SUCCINCT in $env {
    return
  }
  $"($args | flatten | str join ' ')" | print
}

def opPrintErr --wrapped [...args] {
  if SUCCINCT in $env {
    return
  }
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print --stderr
    return
  }
  $"(ansi red)($args | flatten | str join ' ')(ansi reset)" | print --stderr
}

def opPrintSucc --wrapped [...args] {
  if SUCCINCT in $env {
    return
  }
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi green)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintWarn --wrapped [...args] {
  if SUCCINCT in $env {
    return
  }
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi yellow)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintInfo --wrapped [...args] {
  if SUCCINCT in $env {
    return
  }
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi blue)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintCmd --wrapped [...args] {
  if SUCCINCT in $env {
    return
  }
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  let args = $args | flatten
  $"(ansi magenta)($args | first)(ansi reset)" | print --no-newline
  if ($args | length) > 1 {
    $" (ansi cyan)($args | skip 1 | str join ' ')(ansi reset)" | print
  }
}

def opMaybePrintCmd --wrapped [...args] {
  if NOOP not-in $env {
    opPrintCmd ...$args
  }
}

# a ctrl-c: nu's own, an input prompt's, or the exit of a command it stopped (130, SIGINT, windows' ctrl-c status)
def opInterrupted [e: record] {
  ($e.debug | str starts-with 'Interrupted ') or ($e.details.code? == 'nu::shell::io::interrupted') or ($e.exit_code? in [130, -2, -1073741510])
}

# a catch hands its error here first, so a ctrl-c is not stepped past
def opRethrowInterrupt [e: record] {
  if (opInterrupted $e) {
    $e.raw
  }
}

# fires a pending ctrl-c inside a try that clears it, so what follows runs whole; true when there was one
def opSettle [] {
  try { do { }; false } catch { true }
}

# NuSh.quietInterrupt, line for line, for the child nu a command runs in
def opQuietInterrupt [body: string] {
  [
    r#'let shireOuter = ('SHIRE_NU_NESTED' not-in $env)'#
    r#'$env.SHIRE_NU_NESTED = '1''#
    r#'try {'#
    $body
    r#'} catch { |e|'#
    r#'  let shireSettled = (try { do { }; false } catch { true })'#
    r#'  if $shireSettled or ($e.debug | str starts-with 'Interrupted ') or ($e.details.code? == 'nu::shell::io::interrupted') or ($e.exit_code? in [130, -2, -1073741510]) {'#
    r#'    if $shireOuter { print '' }'#
    r#'    exit 130'#
    r#'  }'#
    r#'  $e.raw'#
    r#'}'#
  ] | str join "\n"
}

def opRunCmd --wrapped [...args] {
  ^($nu.current-exe) --no-config-file -c (opQuietInterrupt $"($args | flatten | str join ' ')")
}

def opRunSilentCmd --wrapped [...args] {
  ^($nu.current-exe) --no-config-file -c (opQuietInterrupt $"($args | flatten | str join ' ') o+e> | silent")
}

def opMaybeRunCmd --wrapped [...args] {
  if NOOP not-in $env {
    opRunCmd ...$args
  }
}

def opMaybeRunSilentCmd --wrapped [...args] {
  if NOOP not-in $env {
    opRunSilentCmd ...$args
  }
}

def opPrintRunCmd --wrapped [...args] {
  opPrintCmd ...$args
  opRunCmd ...$args
}

def opPrintMaybeRunCmd --wrapped [...args] {
  opPrintCmd ...$args
  opMaybeRunCmd ...$args
}
