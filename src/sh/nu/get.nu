# by file, not argument: a real script can exceed the command line length limit
let scriptFilePath = (mktemp --suffix '.nu' --tmpdir)
http get --raw --redirect-mode follow $env.REQ_URL_SH | save --force $scriptFilePath
let failure = (try { ^($nu.current-exe) --no-config-file $scriptFilePath; null } catch { |e| $e })
# a ctrl-c fires once: if it cuts the removal short, the second one runs
let cut = (try { rm --force --permanent $scriptFilePath; null } catch { |e| rm --force --permanent $scriptFilePath; $e })
# the script reported its own failure; this passes on its exit code
if $failure != null { $failure.raw }
if $cut != null { $cut.raw }
