if (Test-Path "${Env:ProgramFiles(x86)}\HotPotatoes6\HotPot.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}