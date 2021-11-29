if (Test-Path "${Env:ProgramFiles}\Opera\launcher.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}