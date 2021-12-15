if (Test-Path "${Env:ProgramFiles}\Oracle\VirtualBox\Virtualbox.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}