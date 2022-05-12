if (Test-Path "${env:ProgramFiles}\Mozilla Firefox\firefox.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}