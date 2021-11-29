if (Test-Path "${env:ProgramFiles}\Microsoft VS Code\Code.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}

