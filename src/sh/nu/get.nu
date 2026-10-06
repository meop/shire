# by file, not argument: a real script can exceed the command line length limit
let scriptFilePath = (mktemp --suffix '.nu' --tmpdir)
http get --raw --redirect-mode follow $env.REQ_URL_SH | save --force $scriptFilePath
let failure = (try { ^($nu.current-exe) --no-config-file $scriptFilePath; null } catch { |e| $e })
# settle a ctrl-c that stopped the script, so the cleanup runs whole
try { do { } }
rm --force --permanent $scriptFilePath
# the script reported its own failure; this passes on its exit code
if $failure != null { $failure.raw }
