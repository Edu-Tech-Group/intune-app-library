if (Test-Path "${env:LOCALAPPDATA}\Microsoft\Teams\Update.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}