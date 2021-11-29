if (Test-Path "${env:ProgramFiles}\Geocadabra\Geocadabra.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}