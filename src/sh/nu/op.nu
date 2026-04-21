def opPrint --wrapped [...args] {
  if 'SUCCINCT' in $env {
    return
  }
  $"($args | flatten | str join ' ')" | print
}

def opPrintErr --wrapped [...args] {
  if 'SUCCINCT' in $env {
    return
  }
  if 'GRAYSCALE' in $env {
    $"($args | flatten | str join ' ')" | print --stderr
    return
  }
  $"(ansi red)($args | flatten | str join ' ')(ansi reset)" | print --stderr
}

def opPrintSucc --wrapped [...args] {
  if 'SUCCINCT' in $env {
    return
  }
  if 'GRAYSCALE' in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi green)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintWarn --wrapped [...args] {
  if 'SUCCINCT' in $env {
    return
  }
  if 'GRAYSCALE' in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi yellow)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintInfo --wrapped [...args] {
  if 'SUCCINCT' in $env {
    return
  }
  if 'GRAYSCALE' in $env {
    $"($args | flatten | str join ' ')" | print
    return
  }
  $"(ansi blue)($args | flatten | str join ' ')(ansi reset)" | print
}

def opPrintCmd --wrapped [...args] {
  if 'SUCCINCT' in $env {
    return
  }
  if 'GRAYSCALE' in $env {
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
  if 'NOOP' not-in $env {
    opPrintCmd ...$args
  }
}

def opRunCmd --wrapped [...args] {
  nu --no-config-file -c $"($args | flatten | str join ' ')"
}

def opRunSilentCmd --wrapped [...args] {
  nu --no-config-file -c $"($args | flatten | str join ' ') o+e> | silent"
}

def opMaybeRunCmd --wrapped [...args] {
  if 'NOOP' not-in $env {
    opRunCmd ...$args
  }
}

def opMaybeRunSilentCmd --wrapped [...args] {
  if 'NOOP' not-in $env {
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
