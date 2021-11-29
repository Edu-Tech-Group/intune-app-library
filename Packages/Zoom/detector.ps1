if (Test-Path "${env:ProgramFiles}\Zoom\bin\Zoom.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}