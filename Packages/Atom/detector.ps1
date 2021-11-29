if (Test-Path "${env:LOCALAPPDATA}\atom\Update.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}