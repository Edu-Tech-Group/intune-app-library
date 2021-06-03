choco feature enable --name="'useEnhancedExitCodes'" -y
$ScriptFilename = $MyInvocation.MyCommand.Name
$PackageName = $ScriptFilename -replace ".ps1"
choco list -e $PackageName --local-only