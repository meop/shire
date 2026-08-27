# by file, not argument: a real script can exceed the command line length limit
let scriptFilePath = (mktemp --suffix '.nu' --tmpdir)
http get --raw --redirect-mode follow $env.REQ_URL_SH | save --force $scriptFilePath
let failure = (try { ^($nu.current-exe) --no-config-file $scriptFilePath; null } catch { |e| $e })
rm --force --permanent $scriptFilePath
if $failure != null { error make --unspanned { msg: $failure.msg } }
