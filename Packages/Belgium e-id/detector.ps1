if (Test-Path "${env:ProgramFiles(x86)}\Belgium Identity Card\eid.ico") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}