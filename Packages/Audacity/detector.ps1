if (Test-Path "${env:ProgramFiles(x86)}\Audacity\audacity.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}