if (Test-Path "${Env:ProgramFiles(x86)}\NCH Software\VideoPad\videopad.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}