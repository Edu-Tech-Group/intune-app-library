if (Test-Path "${env:ProgramFiles}\RapidTyping 5\RapidTyping.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}