if (Test-Path "${env:ProgramFiles}\Wireshark\Wireshark.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}
