if (Test-Path "${env:ProgramFiles(x86)}\GeoGebra 6.0\GeoGebra.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}