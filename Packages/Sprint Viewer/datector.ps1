if (Test-Path "${env:ProgramFiles(x86)}\Sprint Viewer 2\sprint.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}