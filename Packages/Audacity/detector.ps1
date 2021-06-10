if (Test-Path "${env:ProgramFiles(x86)}\Audacity\audacity.exe") {
    Write-Host "Found it!"
}