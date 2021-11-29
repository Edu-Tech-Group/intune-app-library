if (Test-Path "${env:ProgramData}\chocolatey\choco.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}