if (Test-Path "${env:ProgramFiles(x86)}\OpenBoard\OpenBoard.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}