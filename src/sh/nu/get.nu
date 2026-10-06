# by file, not argument: a real script can exceed the command line length limit
let scriptFilePath = (mktemp --suffix '.nu' --tmpdir)
http get --raw --redirect-mode follow $env.REQ_URL_SH | save --force $scriptFilePath
let failure = (try { ^($nu.current-exe) --no-config-file $scriptFilePath; null } catch { |e| $e })
# a ctrl-c that ended the script is still pending here until a try catches it, and can cut the first removal short
try { rm --force --permanent $scriptFilePath } catch { rm --force --permanent $scriptFilePath }
# the script reported its own failure, so raising it again passes on its exit code without saying it twice
if $failure != null { $failure.raw }
