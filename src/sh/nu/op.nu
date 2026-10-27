def opPrint --wrapped [...args] {
  $"($args | flatten | str join ' ')" | print
}

def opPrintErr --wrapped [...args] {
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print --stderr
    return
  }
  $"(ansi red)($args | flatten | str join ' ')(ansi reset)" | print --stderr
}

def opPrintSucc --wrapped [...args] {
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi green)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintWarn --wrapped [...args] {
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi yellow)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintInfo --wrapped [...args] {
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi blue)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintVerbose --wrapped [...args] {
  if VERBOSE not-in $env {
    return
  }
  $"($args | flatten | str join ' ')" | print --stderr
}

def opPrintCmd --wrapped [...args] {
  if GRAYSCALE in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  let args = $args | flatten
  $"(ansi magenta)($args | first)(ansi reset)" | print --no-newline
  if ($args | length) > 1 {
    $" (ansi cyan)($args | skip 1 | str join ' ')(ansi reset)" | print
  } else {
    print ''
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

# NuSh.quietInterrupt, line for line, for the child nu a command runs in
def opQuietInterrupt [body: string] {
  let stop = [
    r#'if ($e.debug | str starts-with 'Interrupted ') or ($e.details.code? == 'nu::shell::io::interrupted') or ($e.exit_code? in [130, -2, -1073741510]) {'#
    r#'  exit 130'#
    r#'}'#
    r#'$e.raw'#
  ] | each { |l| $"  ($l)" }
  [r#'try {'# r#'try {'# $body r#'} catch { |e|'# ...$stop r#'}'# r#'} catch { |e|'# ...$stop r#'}'#] | str join "\n"
}

def opRunCmd --wrapped [...args] {
  ^($nu.current-exe) --no-config-file -c (opQuietInterrupt $"($args | flatten | str join ' ')")
}

def opRunSilentCmd --wrapped [...args] {
  ^($nu.current-exe) --no-config-file -c (opQuietInterrupt $"($args | flatten | str join ' ') o+e> | silent")
}

# a yes/no question: empty, y or yes is yes, and YES answers yes without asking. with no terminal to answer from,
# as under cron or a pipe, it is no: input would fail there with an i/o error
def opAsk [question: string] {
  if 'YES' in $env {
    return true
  }
  if not (is-terminal --stdin) {
    opPrintWarn $"($question): no terminal to answer from, so no; YES answers yes"
    return false
  }
  let yn = (input $"($question) [[y]/n]: " | str lowercase)
  $yn in ['' 'y' 'yes']
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
