if (Test-Path "${env:ProgramFiles}\paint.net\PaintDotNet.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}
