if (Test-Path "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}