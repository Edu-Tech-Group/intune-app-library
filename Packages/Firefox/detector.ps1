if (Test-Path "${env:ProgramFiles}\Mozilla Firefox\browser") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}