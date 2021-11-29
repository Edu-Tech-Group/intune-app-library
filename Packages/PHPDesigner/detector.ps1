if (Test-Path "${Env:ProgramFiles(x86)}\phpDesigner 8\phpDesigner.exe") {
    Write-Output "Found it!"
    exit 0
}
else
{
    exit 1
}