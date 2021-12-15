if (Test-Path "${env:ProgramFiles}\FileZilla FTP Client") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}