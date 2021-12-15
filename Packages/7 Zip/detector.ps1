if (Test-Path "${env:Program Files}\7-Zip\7z.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}