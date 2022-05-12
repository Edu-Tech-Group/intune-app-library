if (Test-Path "${env:ProgramFiles}\7-zip\7zG.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}